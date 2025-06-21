// Authentication Service
// Business logic for authentication operations

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authService = {
    // Hash password
    hashPassword: async (password) => {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    },

    // Compare password
    comparePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Generate JWT token
    generateToken: (payload) => {
        return jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    },

    // Generate refresh token
    generateRefreshToken: (payload) => {
        return jwt.sign(payload, jwtConfig.refreshSecret, {
            expiresIn: jwtConfig.refreshExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    },

    // Verify token
    verifyToken: (token) => {
        return jwt.verify(token, jwtConfig.secret);
    },

    // Verify refresh token
    verifyRefreshToken: (token) => {
        return jwt.verify(token, jwtConfig.refreshSecret);
    },

    // Generate password reset token
    generatePasswordResetToken: () => {
        return jwt.sign(
            { purpose: 'password_reset', timestamp: Date.now() },
            jwtConfig.secret,
            { expiresIn: '1h' }
        );
    },

    // Generate email verification token
    generateEmailVerificationToken: (userId) => {
        return jwt.sign(
            { userId, purpose: 'email_verification' },
            jwtConfig.secret,
            { expiresIn: '24h' }
        );
    }
};

module.exports = authService; 