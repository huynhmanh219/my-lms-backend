// Input Validation Middleware
// Request body, query, and params validation using Joi

const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errorMessages
            });
        }
        
        next();
    };
};

// Query validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Query validation failed',
                errors: errorMessages
            });
        }
        
        next();
    };
};

// Params validation middleware
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params);
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Parameters validation failed',
                errors: errorMessages
            });
        }
        
        next();
    };
};

// Common validation schemas
const commonSchemas = {
    id: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        sort: Joi.string().optional(),
        order: Joi.string().valid('asc', 'desc').default('asc')
    }),
    
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
};

// Authentication validation schemas
const authSchemas = {
    login: Joi.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        remember_me: Joi.boolean().optional()
    }),
    
    changePassword: Joi.object({
        current_password: commonSchemas.password,
        new_password: commonSchemas.password,
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
    }),
    
    forgotPassword: Joi.object({
        email: commonSchemas.email
    }),
    
    resetPassword: Joi.object({
        token: Joi.string().required(),
        new_password: commonSchemas.password,
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
    })
};

// User validation schemas
const userSchemas = {
    createTeacher: Joi.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        phone: Joi.string().optional(),
        title: Joi.string().optional(),
        department: Joi.string().optional(),
        bio: Joi.string().optional()
    }),
    
    createStudent: Joi.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        student_id: Joi.string().required(),
        phone: Joi.string().optional(),
        date_of_birth: Joi.date().optional(),
        address: Joi.string().optional()
    })
};

module.exports = {
    validate,
    validateQuery,
    validateParams,
    commonSchemas,
    authSchemas,
    userSchemas
}; 