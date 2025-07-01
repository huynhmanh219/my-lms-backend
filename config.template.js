
module.exports = {
  // Environment Configuration
  NODE_ENV: 'development',
  PORT: 3000,

  // Database Configuration
  database: {
    host: 'localhost',
    port: 3306,
    name: 'lms_database',
    username: 'root',
    password: '', // Add your database password
  },

  // JWT Configuration
  jwt: {
    secret: 'your_super_secret_jwt_key_here_change_in_production',
    refreshSecret: 'your_super_secret_refresh_key_here_change_in_production',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },

  // Frontend URL (for CORS and email links)
  frontendUrl: 'http://localhost:5173',

  // Email Configuration (SMTP)
  email: {
    host: 'localhost',
    port: 587,
    secure: false,
    user: '', // Add your SMTP user
    pass: '', // Add your SMTP password
    from: 'noreply@lms.com',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 50, // MB
    path: './uploads',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 900000, // 15 minutes
    maxRequests: 100,
  },

  // Security
  security: {
    bcryptRounds: 12,
    passwordResetExpires: 3600000, // 1 hour
  },

  // Logging
  logging: {
    level: 'info',
    file: 'logs/app.log',
  },
}; 