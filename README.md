# Learning Management System (LMS) Backend

A comprehensive Learning Management System backend API built with Express.js, MySQL, and Sequelize ORM.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete CRUD for students, teachers, and administrators
- **Course Management**: Subjects, classes, enrollment system
- **Lecture Management**: Chapters, lectures, content organization
- **Material Management**: File uploads, downloads, search functionality
- **Quiz System**: Comprehensive quiz creation, attempts, and grading
- **Statistics & Reports**: Dashboard analytics and detailed reports
- **File Uploads**: Support for documents, images, and multimedia
- **Email System**: Automated notifications and password reset
- **Security**: Rate limiting, input validation, error handling

## 📋 API Endpoints Overview

- **Authentication**: 6 APIs (login, logout, password management)
- **User Management**: 25 APIs (teachers, students, roles)
- **Course Management**: 20 APIs (subjects, classes, enrollment)
- **Lecture Management**: 20 APIs (lectures, chapters, permissions)
- **Material Management**: 25 APIs (CRUD, file operations, search)
- **Quiz Management**: 25 APIs (quizzes, questions, attempts, results)
- **Statistics & Reports**: 15 APIs (dashboard, analytics)

**Total: 120+ API endpoints**

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors, rate limiting
- **File Upload**: Multer
- **Validation**: Joi
- **Email**: Nodemailer
- **Logging**: Morgan

## 📦 Installation

### Prerequisites

- Node.js (v16.0.0 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd my-lms-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lms_database
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Email Configuration (optional for development)
SMTP_HOST=your_smtp_host
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

### 4. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE lms_database;
```

### 5. Run the application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🔧 Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📁 Project Structure

```
src/
├── config/          # Database, JWT, Multer configurations
├── controllers/     # Request handlers for each module
├── middleware/      # Auth, validation, error handling middleware
├── models/          # Sequelize models and relationships
├── routes/          # API route definitions
├── services/        # Business logic and external services
└── utils/           # Helper functions and constants
```

## 🌐 API Documentation

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/refresh-token
```

### User Management
```
# Teachers
GET    /api/users/teachers
GET    /api/users/teachers/:id
POST   /api/users/teachers
PUT    /api/users/teachers/:id
DELETE /api/users/teachers/:id

# Students
GET    /api/users/students
GET    /api/users/students/:id
POST   /api/users/students
PUT    /api/users/students/:id
DELETE /api/users/students/:id

# Roles
GET    /api/users/roles
```

### Course Management
```
# Subjects
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id

# Classes
GET    /api/courses/classes
POST   /api/courses/classes
PUT    /api/courses/classes/:id
DELETE /api/courses/classes/:id

# Enrollment
GET    /api/courses/classes/:id/students
POST   /api/courses/classes/:id/students
DELETE /api/courses/classes/:id/students/:studentId
```

### Quiz Management
```
# Quizzes
GET    /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes
PUT    /api/quizzes/:id
DELETE /api/quizzes/:id

# Quiz Attempts
GET    /api/quizzes/:id/start
POST   /api/quizzes/attempts
GET    /api/quizzes/attempts/:id
PUT    /api/quizzes/attempts/:id/answer
```

For complete API documentation, see the individual route files in `/src/routes/`.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Lecturer, Student roles
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive validation using Joi
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **XSS Protection**: Helmet.js security headers
- **File Upload Security**: File type and size validation

## 🚦 Development Phases

### ✅ Phase 1: Project Setup & Foundation (COMPLETED)
- Project structure initialization
- Dependencies installation
- Basic Express setup

### 🔄 Phase 2: Database Integration (NEXT)
- Sequelize models implementation
- Database relationships
- Seeders and migrations

### 📅 Upcoming Phases
- Phase 3: Authentication & Authorization
- Phase 4: User Management
- Phase 5: Course Management
- Phase 6: Lecture Management
- Phase 7: Material Management
- Phase 8: Quiz Management
- Phase 9: Statistics & Reports
- Phase 10-12: Security, Testing & Deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for education and learning. 