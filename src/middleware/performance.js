    
const compression = require('compression');
const { cacheService, cacheHelpers } = require('../services/cacheService');

const compressionMiddleware = compression({
    level: process.env.NODE_ENV === 'production' ? 6 : 1,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
            return false;
        }
        
        const contentType = res.getHeader('Content-Type');
        if (contentType) {
            const skipTypes = ['image/', 'video/', 'audio/', 'application/zip', 'application/gzip'];
            if (skipTypes.some(type => contentType.includes(type))) {
                return false;
            }
        }
        
        return compression.filter(req, res);
    }
});

const responseCacheMiddleware = (cacheTTL = cacheHelpers.TTL.MEDIUM) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        
        const skipPaths = ['/api/auth/', '/api/users/profile', '/api/statistics/dashboard'];
        if (skipPaths.some(path => req.path.includes(path))) {
            return next();
        }
        
        const cacheKey = cacheHelpers.apiResponseKey(req.path, req.query);
        
        try {
            const cachedResponse = await cacheService.get(cacheKey);
            if (cachedResponse) {
                res.set('X-Cache', 'HIT');
                res.set('Cache-Control', `public, max-age=${cacheTTL}`);
                return res.status(cachedResponse.status).json(cachedResponse.data);
            }
            
            res.set('X-Cache', 'MISS');
            
            const originalJson = res.json;
            res.json = function(body) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const responseData = { status: res.statusCode, data: body };
                    cacheService.set(cacheKey, responseData, cacheTTL).catch(() => {});
                    res.set('Cache-Control', `public, max-age=${cacheTTL}`);
                }
                return originalJson.call(this, body);
            };
            
            next();
        } catch (error) {
            console.error('Response cache error:', error.message);
            next();
        }
    };
};

const queryOptimizationMiddleware = (req, res, next) => {
    req.queryOptions = {
        limit: Math.min(parseInt(req.query.limit) || 10, 100),
        offset: parseInt(req.query.offset) || 0,
        include: req.query.include ? req.query.include.split(',') : [],
        attributes: req.query.fields ? req.query.fields.split(',') : undefined,
        order: req.query.sort ? parseSort(req.query.sort) : [['created_at', 'DESC']],
        search: req.query.search || '',
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    };
    next();
};

function parseSort(sortParam) {
    const sorts = sortParam.split(',');
    return sorts.map(sort => {
        const direction = sort.startsWith('-') ? 'DESC' : 'ASC';
        const field = sort.replace(/^[-+]/, '');
        return [field, direction];
    });
}

const performanceMonitoringMiddleware = (req, res, next) => {
    const startTime = Date.now();
    
    const originalSend = res.send;
    res.send = function(body) {
        const duration = Date.now() - startTime;
        
        res.set('X-Response-Time', `${duration}ms`);
        res.set('X-Timestamp', new Date().toISOString());
        
        if (duration > 1000) {
            console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
        }
        
        return originalSend.call(this, body);
    };
    
    next();
};

const staticFileOptimizationMiddleware = (req, res, next) => {
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        res.set('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    
    next();
};

module.exports = {
    compressionMiddleware,
    responseCacheMiddleware,
    queryOptimizationMiddleware,
    performanceMonitoringMiddleware,
    staticFileOptimizationMiddleware
};
