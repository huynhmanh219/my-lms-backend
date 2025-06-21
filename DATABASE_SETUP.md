# Database Setup Guide

This guide will help you set up MySQL database for the LMS backend.

## Prerequisites

1. **MySQL Server** installed and running
2. **MySQL command-line client** (usually comes with MySQL)
3. **Node.js** dependencies installed (`npm install`)

## Installation Options

### Option 1: Local MySQL Installation

#### Windows:
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run installer and select "Developer Default"
3. Set root password during installation
4. Start MySQL service

#### macOS:
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Set root password
mysql_secure_installation
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Option 2: Docker MySQL (Recommended for development)

```bash
# Pull and run MySQL container
docker run --name lms-mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=lms_database \
  -p 3306:3306 \
  -d mysql:8.0

# Wait for container to start (30 seconds)
```

## Database Setup Steps

### 1. Update Environment Variables

Edit your `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lms_database
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql

# If using Docker with default settings:
# DB_PASSWORD=root123
```

### 2. Create Database and Tables

Run the SQL setup script:

```bash
# Method 1: Using npm script (requires MySQL CLI)
npm run db:setup

# Method 2: Manual MySQL command
mysql -u root -p < database-setup.sql

# Method 3: MySQL Workbench
# - Open MySQL Workbench
# - Connect to your MySQL server
# - File > Open SQL Script > Select database-setup.sql
# - Execute the script
```

### 3. Seed Initial Data

```bash
# Run the seeder to create default accounts
npm run db:seed
```

### 4. Test Database Connection

```bash
# Start the server to test connection
npm run dev
```

## Default Accounts Created

After seeding, you'll have these test accounts:

| Role     | Email               | Password    | Description           |
|----------|---------------------|-------------|-----------------------|
| Admin    | admin@lms.com       | admin123    | System administrator  |
| Lecturer | lecturer@lms.com    | lecturer123 | Sample teacher        |
| Student  | student@lms.com     | student123  | Sample student        |

## Troubleshooting

### MySQL Connection Issues

1. **Connection refused**: MySQL service not running
   ```bash
   # Windows
   net start mysql
   
   # macOS/Linux
   brew services start mysql  # or
   sudo systemctl start mysql
   ```

2. **Access denied**: Wrong credentials
   - Check `.env` file credentials
   - Reset MySQL root password if needed

3. **Database doesn't exist**:
   ```sql
   -- Create manually in MySQL
   CREATE DATABASE lms_database;
   ```

4. **Port already in use**:
   - Change `DB_PORT` in `.env` to different port (e.g., 3307)
   - Or stop other MySQL instances

### Docker-specific Issues

1. **Container not starting**:
   ```bash
   docker logs lms-mysql
   ```

2. **Port conflicts**:
   ```bash
   # Use different port
   docker run --name lms-mysql \
     -e MYSQL_ROOT_PASSWORD=root123 \
     -e MYSQL_DATABASE=lms_database \
     -p 3307:3306 \
     -d mysql:8.0
   ```

## Database Reset

To reset the entire database:

```bash
# This will drop and recreate everything
npm run db:reset
```

## Next Steps

After successful database setup:

1. ✅ Phase 1: Project Setup (Complete)
2. ✅ Phase 2: Database Integration (Complete)  
3. ➡️ Phase 3: Authentication System (Next)

The database is now ready for Phase 3 implementation! 