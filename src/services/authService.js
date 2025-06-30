
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authService = {
    hashPassword: async (password) => {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    },

    comparePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    generateToken: (payload) => {
        return jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    },

    generateRefreshToken: (payload) => {
        return jwt.sign(payload, jwtConfig.refreshSecret, {
            expiresIn: jwtConfig.refreshExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    },

    verifyToken: (token) => {
        return jwt.verify(token, jwtConfig.secret);
    },

    verifyRefreshToken: (token) => {
        return jwt.verify(token, jwtConfig.refreshSecret);
    },

    generatePasswordResetToken: () => {
        return jwt.sign(
            { purpose: 'password_reset', timestamp: Date.now() },
            jwtConfig.secret,
            { expiresIn: '1h' }
        );
    },

    generateEmailVerificationToken: (userId) => {
        return jwt.sign(
            { userId, purpose: 'email_verification' },
            jwtConfig.secret,
            { expiresIn: '24h' }
        );
    }
};

module.exports = authService; 