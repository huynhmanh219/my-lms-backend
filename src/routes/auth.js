
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { authSchemas } = require('../middleware/validation');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { auth } = require('../middleware/auth');
const Joi = require('joi');

// POST /auth/login
router.post('/login', 
    authLimiter,
    validate(authSchemas.login),
    authController.login
);

// POST /auth/logout
router.post('/logout', 
    auth,
    authController.logout
);

// POST /auth/change-password
router.post('/change-password',
    auth,
    validate(authSchemas.changePassword),
    authController.changePassword
);

// POST /auth/forgot-password
router.post('/forgot-password',
    passwordResetLimiter,
    validate(authSchemas.forgotPassword),
    authController.forgotPassword
);

// POST /auth/reset-password
router.post('/reset-password',
    validate(authSchemas.resetPassword),
    authController.resetPassword
);

// POST /auth/refresh-token
router.post('/refresh-token', 
    validate(Joi.object({
        refreshToken: Joi.string().required()
    })),
    authController.refreshToken
);

module.exports = router; 