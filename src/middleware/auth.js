

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

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, jwtConfig.secret);
            
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
        next();
    }
};

module.exports = {
    auth,
    optionalAuth
}; 