// Authentication Middleware
// JWT token verification and user authentication

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { Account, Role } = require('../models');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, jwtConfig.secret);
        
        // Find user to ensure they still exist and are active
        const user = await Account.findByPk(decoded.id, {
            attributes: ['id', 'email', 'role_id', 'is_active'],
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name']
                }
            ]
        });
        
        if (!user || !user.is_active) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token or user is inactive.'
            });
        }

        // Add user information to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role.name,
            role_id: user.role_id
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expired.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token.'
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'Authentication failed.'
        });
    }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, jwtConfig.secret);
            
            // Find user to ensure they still exist and are active
            const user = await Account.findByPk(decoded.id, {
                attributes: ['id', 'email', 'role_id', 'is_active'],
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    }
                ]
            });
            
            if (user && user.is_active) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role.name,
                    role_id: user.role_id
                };
            }
        }
        
        next();
    } catch (error) {
        // Silent fail for optional auth
        next();
    }
};

module.exports = {
    auth,
    optionalAuth
}; 