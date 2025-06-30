@echo off
echo ====================================
echo      Starting LMS Backend
echo ====================================

REM Kiểm tra file .env
if not exist .env (
    echo Creating .env file from env.example...
    copy env.example .env
    echo .env file created. Please edit it with your database password.
    echo Press any key to continue after editing .env file...
    pause
)

REM Kiểm tra node_modules
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Tạo thư mục logs và uploads nếu chưa có
if not exist logs mkdir logs
if not exist uploads mkdir uploads

REM Kiểm tra kết nối database
echo Testing database connection...
node -e "require('dotenv').config(); const db = require('./src/config/database'); db.authenticate().then(() => { console.log('✅ Database connected successfully'); process.exit(0); }).catch(err => { console.error('❌ Database connection failed:', err.message); process.exit(1); });"

if errorlevel 1 (
    echo.
    echo ❌ Database connection failed!
    echo Please check:
    echo 1. MySQL server is running
    echo 2. Database 'lms_database' exists
    echo 3. Database credentials in .env file are correct
    echo.
    echo You can create the database by running:
    echo mysql -u root -p -e "CREATE DATABASE lms_database;"
    echo.
    pause
    exit /b 1
)

REM Khởi động development server
echo Starting backend development server...
echo Backend will be available at: http://localhost:5000
echo API Documentation: http://localhost:5000/api-docs
echo Health Check: http://localhost:5000/health
echo.
npm run dev 