// // Swagger Documentation Configuration
// // OpenAPI 3.0 specification for LMS Backend API

// const swaggerJsdoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// // Basic OpenAPI specification
// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'LMS Backend API',
//       version: '1.0.0',
//       description: `
//         Learning Management System Backend API - Comprehensive educational platform backend
        
//         ## Features
//         - **Authentication & Authorization** - JWT-based authentication with role-based access control
//         - **User Management** - Complete user lifecycle management for students, lecturers, and administrators
//         - **Course Management** - Subject creation, class management, and enrollment system
//         - **Content Management** - Lecture organization, chapter structure, and learning materials
//         - **Assessment System** - Quiz creation, question management, and automated grading
//         - **Analytics & Reporting** - Dashboard statistics and detailed performance reports
//         - **Security Features** - XSS protection, SQL injection prevention, rate limiting, and comprehensive logging
        
//         ## Security
//         Most endpoints require authentication using Bearer tokens. Some endpoints have additional role-based restrictions.
        
//         ## Rate Limiting
//         - General API: 100 requests per 15 minutes
//         - Authentication: 5 requests per 15 minutes
//         - File uploads: 50 requests per hour
        
//         ## Error Handling
//         All endpoints return standardized error responses with appropriate HTTP status codes and detailed error messages.
//       `,
//       termsOfService: 'https://your-domain.com/terms',
//       contact: {
//         name: 'LMS Backend API Support',
//         url: 'https://your-domain.com/support',
//         email: 'api-support@your-domain.com'
//       },
//       license: {
//         name: 'MIT',
//         url: 'https://opensource.org/licenses/MIT'
//       }
//     },
//     servers: [
//       {
//         url: 'http://localhost:3000',
//         description: 'Development server'
//       },
//       {
//         url: 'https://api.your-domain.com',
//         description: 'Production server'
//       }
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//           description: 'Enter your JWT token in the format: Bearer <token>'
//         }
//       },
//       schemas: {
//         // Error response schema
//         ErrorResponse: {
//           type: 'object',
//           properties: {
//             status: {
//               type: 'string',
//               enum: ['error'],
//               example: 'error'
//             },
//             message: {
//               type: 'string',
//               example: 'Validation failed'
//             },
//             code: {
//               type: 'string',
//               example: 'VALIDATION_ERROR'
//             },
//             errors: {
//               type: 'array',
//               items: {
//                 type: 'string'
//               },
//               example: ['Email is required', 'Password must be at least 6 characters']
//             },
//             timestamp: {
//               type: 'string',
//               format: 'date-time',
//               example: '2023-12-25T10:30:00.000Z'
//             }
//           }
//         },
        
//         // Success response schema
//         SuccessResponse: {
//           type: 'object',
//           properties: {
//             status: {
//               type: 'string',
//               enum: ['success'],
//               example: 'success'
//             },
//             message: {
//               type: 'string',
//               example: 'Operation completed successfully'
//             },
//             data: {
//               type: 'object',
//               description: 'Response data (varies by endpoint)'
//             },
//             pagination: {
//               $ref: '#/components/schemas/Pagination'
//             },
//             timestamp: {
//               type: 'string',
//               format: 'date-time',
//               example: '2023-12-25T10:30:00.000Z'
//             }
//           }
//         },
        
//         // Pagination schema
//         Pagination: {
//           type: 'object',
//           properties: {
//             currentPage: {
//               type: 'integer',
//               example: 1
//             },
//             totalPages: {
//               type: 'integer',
//               example: 5
//             },
//             totalItems: {
//               type: 'integer',
//               example: 50
//             },
//             itemsPerPage: {
//               type: 'integer',
//               example: 10
//             },
//             hasNextPage: {
//               type: 'boolean',
//               example: true
//             },
//             hasPrevPage: {
//               type: 'boolean',
//               example: false
//             }
//           }
//         },
        
//         // User schemas
//         User: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'integer',
//               example: 1
//             },
//             email: {
//               type: 'string',
//               format: 'email',
//               example: 'user@example.com'
//             },
//             first_name: {
//               type: 'string',
//               example: 'John'
//             },
//             last_name: {
//               type: 'string',
//               example: 'Doe'
//             },
//             role: {
//               type: 'string',
//               enum: ['admin', 'lecturer', 'student'],
//               example: 'student'
//             },
//             is_active: {
//               type: 'boolean',
//               example: true
//             },
//             created_at: {
//               type: 'string',
//               format: 'date-time',
//               example: '2023-12-25T10:30:00.000Z'
//             },
//             updated_at: {
//               type: 'string',
//               format: 'date-time',
//               example: '2023-12-25T10:30:00.000Z'
//             }
//           }
//         },
        
//         // Authentication schemas
//         LoginRequest: {
//           type: 'object',
//           required: ['email', 'password'],
//           properties: {
//             email: {
//               type: 'string',
//               format: 'email',
//               example: 'user@example.com'
//             },
//             password: {
//               type: 'string',
//               minLength: 6,
//               example: 'password123'
//             },
//             remember_me: {
//               type: 'boolean',
//               example: false
//             }
//           }
//         },
        
//         LoginResponse: {
//           type: 'object',
//           properties: {
//             status: {
//               type: 'string',
//               example: 'success'
//             },
//             message: {
//               type: 'string',
//               example: 'Login successful'
//             },
//             data: {
//               type: 'object',
//               properties: {
//                 user: {
//                   $ref: '#/components/schemas/User'
//                 },
//                 tokens: {
//                   type: 'object',
//                   properties: {
//                     accessToken: {
//                       type: 'string',
//                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
//                     },
//                     refreshToken: {
//                       type: 'string',
//                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         },
        
//         // Course schemas
//         Course: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'integer',
//               example: 1
//             },
//             subject_name: {
//               type: 'string',
//               example: 'Introduction to Computer Science'
//             },
//             subject_code: {
//               type: 'string',
//               example: 'CS101'
//             },
//             description: {
//               type: 'string',
//               example: 'Fundamental concepts of computer science'
//             },
//             credits: {
//               type: 'integer',
//               example: 3
//             },
//             lecturer_id: {
//               type: 'integer',
//               example: 1
//             },
//             created_at: {
//               type: 'string',
//               format: 'date-time',
//               example: '2023-12-25T10:30:00.000Z'
//             }
//           }
//         },
        
//         CreateCourseRequest: {
//           type: 'object',
//           required: ['subject_name', 'subject_code', 'lecturer_id', 'credits'],
//           properties: {
//             subject_name: {
//               type: 'string',
//               minLength: 3,
//               maxLength: 255,
//               example: 'Introduction to Computer Science'
//             },
//             subject_code: {
//               type: 'string',
//               minLength: 3,
//               maxLength: 20,
//               example: 'CS101'
//             },
//             description: {
//               type: 'string',
//               maxLength: 2000,
//               example: 'Fundamental concepts of computer science'
//             },
//             lecturer_id: {
//               type: 'integer',
//               minimum: 1,
//               example: 1
//             },
//             credits: {
//               type: 'integer',
//               minimum: 1,
//               maximum: 10,
//               example: 3
//             },
//             semester: {
//               type: 'string',
//               enum: ['spring', 'summer', 'fall', 'winter'],
//               example: 'fall'
//             },
//             academic_year: {
//               type: 'string',
//               pattern: '^\\d{4}-\\d{4}$',
//               example: '2023-2024'
//             }
//           }
//         },
        
//         // Quiz schemas
//         Quiz: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'integer',
//               example: 1
//             },
//             title: {
//               type: 'string',
//               example: 'Midterm Exam'
//             },
//             description: {
//               type: 'string',
//               example: 'Comprehensive midterm examination'
//             },
//             subject_id: {
//               type: 'integer',
//               example: 1
//             },
//             time_limit: {
//               type: 'integer',
//               example: 90,
//               description: 'Time limit in minutes'
//             },
//             max_attempts: {
//               type: 'integer',
//               example: 3
//             },
//             passing_score: {
//               type: 'number',
//               example: 70.0
//             },
//             is_published: {
//               type: 'boolean',
//               example: true
//             },
//             start_date: {
//               type: 'string',
//               format: 'date-time',
//               example: '2023-12-25T10:00:00.000Z'
//             },
//             end_date: {
//               type: 'string',
//               format: 'date-time',
//               example: '2023-12-30T23:59:59.000Z'
//             }
//           }
//         },
        
//         // Material schemas
//         Material: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'integer',
//               example: 1
//             },
//             title: {
//               type: 'string',
//               example: 'Lecture 1 - Introduction'
//             },
//             description: {
//               type: 'string',
//               example: 'Introduction to the course'
//             },
//             file_name: {
//               type: 'string',
//               example: 'lecture1.pdf'
//             },
//             file_path: {
//               type: 'string',
//               example: '/uploads/documents/lecture1.pdf'
//             },
//             file_size: {
//               type: 'integer',
//               example: 1024000
//             },
//             material_type: {
//               type: 'string',
//               enum: ['document', 'video', 'audio', 'image', 'link'],
//               example: 'document'
//             },
//             is_public: {
//               type: 'boolean',
//               example: true
//             },
//             subject_id: {
//               type: 'integer',
//               example: 1
//             }
//           }
//         }
//       }
//     },
//     security: [
//       {
//         bearerAuth: []
//       }
//     ],
//     tags: [
//       {
//         name: 'Authentication',
//         description: 'Authentication and authorization endpoints'
//       },
//       {
//         name: 'Users',
//         description: 'User management endpoints'
//       },
//       {
//         name: 'Courses',
//         description: 'Course and subject management'
//       },
//       {
//         name: 'Lectures',
//         description: 'Lecture and chapter management'
//       },
//       {
//         name: 'Materials',
//         description: 'Learning material management'
//       },
//       {
//         name: 'Quizzes',
//         description: 'Quiz and assessment management'
//       },
//       {
//         name: 'Statistics',
//         description: 'Analytics and reporting'
//       }
//     ]
//   },
//   apis: [
//     './src/routes/*.js',
//     './src/controllers/*.js'
//   ]
// };

// // Generate swagger specification
// const specs = swaggerJsdoc(options);

// // Swagger UI options
// const swaggerUiOptions = {
//   explorer: true,
//   customCss: `
//     .swagger-ui .topbar { display: none }
//     .swagger-ui .info .title { color: #2c3e50; }
//     .swagger-ui .info .description { color: #34495e; }
//     .swagger-ui .scheme-container { background: #ecf0f1; padding: 15px; border-radius: 5px; }
//   `,
//   customSiteTitle: 'LMS Backend API Documentation',
//   customfavIcon: '/favicon.ico',
//   swaggerOptions: {
//     persistAuthorization: true,
//     displayRequestDuration: true,
//     tryItOutEnabled: true,
//     filter: true,
//     syntaxHighlight: {
//       theme: 'monokai'
//     }
//   }
// };

// module.exports = {
//   specs,
//   swaggerUi,
//   swaggerUiOptions
// };
