// Production Configuration for LMS Backend
// Centralized configuration management for production deployment

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'production',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'lms_backend',
    user: process.env.DB_USER || 'lms_user',
    password: process.env.DB_PASSWORD || 'secure_password',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    maxMemory: '256mb',
    maxMemoryPolicy: 'allkeys-lru'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secure-refresh-secret',
    expiresIn: process.env.JWT_EXPIRE_TIME || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE_TIME || '7d'
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: {
      name: process.env.EMAIL_FROM_NAME || 'LMS Backend',
      address: process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com'
    }
  },

  // File Upload Configuration
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,ppt,pptx,txt,jpg,jpeg,png,gif').split(',')
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
      uploadMaxRequests: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 50
    }
  },

  // Performance Configuration
  performance: {
    compression: {
      enabled: process.env.ENABLE_COMPRESSION !== 'false',
      level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
      threshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024
    },
    cache: {
      ttl: {
        short: parseInt(process.env.CACHE_TTL_SHORT) || 300,      // 5 minutes
        medium: parseInt(process.env.CACHE_TTL_MEDIUM) || 900,   // 15 minutes
        long: parseInt(process.env.CACHE_TTL_LONG) || 3600,      // 1 hour
        veryLong: parseInt(process.env.CACHE_TTL_VERY_LONG) || 86400 // 24 hours
      }
    }
  },

  // Monitoring Configuration
  monitoring: {
    enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    enableProfiling: process.env.ENABLE_PROFILING === 'true',
    sentry: {
      dsn: process.env.SENTRY_DSN || null,
      environment: process.env.NODE_ENV || 'production'
    }
  },

  // Feature Flags
  features: {
    apiDocs: process.env.ENABLE_API_DOCS === 'true',
    swaggerUI: process.env.ENABLE_SWAGGER_UI === 'true',
    debugLogging: process.env.DEV_ENABLE_DEBUG_LOGGING === 'true'
  },

  // SSL Configuration
  ssl: {
    enabled: process.env.FORCE_HTTPS === 'true',
    certPath: process.env.SSL_CERT_PATH || null,
    keyPath: process.env.SSL_KEY_PATH || null
  },

  // Third-party Integrations
  integrations: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || null
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || null,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || null
    },
    analytics: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null
    }
  }
};

// Validation function to check required configuration
function validateConfig() {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_PASSWORD'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secrets length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  console.log('✅ Configuration validation passed');
}

// Performance optimization settings
const optimizations = {
  // Database optimizations
  database: {
    enableQueryOptimization: true,
    enableConnectionPooling: true,
    enablePreparedStatements: true
  },

  // Cache optimizations
  cache: {
    enableResponseCaching: true,
    enableDatabaseQueryCaching: true,
    enableStaticFileCaching: true
  },

  // Compression optimizations
  compression: {
    enableGzip: true,
    enableBrotli: true,
    enableStaticCompression: true
  }
};

module.exports = {
  config,
  validateConfig,
  optimizations
}; 