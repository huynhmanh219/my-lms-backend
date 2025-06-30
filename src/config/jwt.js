

require('dotenv').config();

const jwtConfig = {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256',
    issuer: 'LMS-Backend',
    audience: 'LMS-Users'
};

module.exports = jwtConfig; 