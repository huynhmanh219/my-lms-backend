
const redis = require('redis');
const NodeCache = require('node-cache');

class CacheService {
    constructor() {
        this.isRedisConnected = false;
        this.redisClient = null;
        
        this.memoryCache = new NodeCache({
            stdTTL: 600,
            checkperiod: 120,
            useClones: false
        });
        
        this.initializeRedis();
    }

    async initializeRedis() {
        try {
            const redisConfig = {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
                db: process.env.REDIS_DB || 0,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                connectTimeout: 10000,
                lazyConnect: true
            };

            this.redisClient = redis.createClient(redisConfig);

            this.redisClient.on('connect', () => {
                this.isRedisConnected = true;
                console.log('Redis cache connected successfully');
            });

            this.redisClient.on('error', (error) => {
                this.isRedisConnected = false;
                console.warn('Redis cache connection error, using memory cache fallback');
            });

            this.redisClient.on('end', () => {
                this.isRedisConnected = false;
                console.warn('Redis connection ended, using memory cache fallback');
            });

            if (process.env.NODE_ENV !== 'test') {
                await this.redisClient.connect();
            }

        } catch (error) {
            this.isRedisConnected = false;
            console.warn('Failed to initialize Redis, using memory cache only');
        }
    }

    async get(key) {
        try {
            if (this.isRedisConnected && this.redisClient) {
                const value = await this.redisClient.get(key);
                if (value) {
                    return JSON.parse(value);
                }
            }
            
            return this.memoryCache.get(key) || null;
            
        } catch (error) {
            console.error('Cache get error:', error.message);
            return null;
        }
    }

    async set(key, value, ttl = 600) {
        try {
            const serializedValue = JSON.stringify(value);
            
            if (this.isRedisConnected && this.redisClient) {
                await this.redisClient.setEx(key, ttl, serializedValue);
            }
            
            this.memoryCache.set(key, value, ttl);
            
            return true;
            
        } catch (error) {
            console.error('Cache set error:', error.message);
            return false;
        }
    }

    async del(key) {
        try {
            if (this.isRedisConnected && this.redisClient) {
                await this.redisClient.del(key);
            }
            
            this.memoryCache.del(key);
            return true;
            
        } catch (error) {
            console.error('Cache delete error:', error.message);
            return false;
        }
    }

    async clear() {
        try {
            if (this.isRedisConnected && this.redisClient) {
                await this.redisClient.flushDb();
            }
            
            this.memoryCache.flushAll();
            console.log('Cache cleared successfully');
            return true;
            
        } catch (error) {
            console.error('Cache clear error:', error.message);
            return false;
        }
    }

    getStats() {
        const memStats = this.memoryCache.getStats();
        
        return {
            redis: {
                connected: this.isRedisConnected,
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379
            },
            memory: {
                keys: memStats.keys,
                hits: memStats.hits,
                misses: memStats.misses
            }
        };
    }
}

const cacheService = new CacheService();

const cacheHelpers = {
    userKey: (userId) => `user:${userId}`,
    userSessionKey: (userId, sessionId) => `session:${userId}:${sessionId}`,
    
    courseKey: (courseId) => `course:${courseId}`,
    courseListKey: (filters) => `courses:list:${JSON.stringify(filters)}`,
    
    quizKey: (quizId) => `quiz:${quizId}`,
    quizAttemptKey: (attemptId) => `quiz_attempt:${attemptId}`,

    statsKey: (type, filters) => `stats:${type}:${JSON.stringify(filters)}`,
    dashboardKey: (userId, timeframe) => `dashboard:${userId}:${timeframe}`,
    
    TTL: {
        SHORT: 300,
        MEDIUM: 900,
        LONG: 3600,
        VERY_LONG: 86400
    }
};

module.exports = {
    cacheService,
    cacheHelpers
};
