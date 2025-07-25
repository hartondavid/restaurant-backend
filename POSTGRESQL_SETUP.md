# PostgreSQL Configuration Guide

## Overview
This application uses PostgreSQL for both environments:
- **Development**: Local PostgreSQL instance
- **Production**: Cloud PostgreSQL (Vercel/Supabase)

## Development Setup (Local PostgreSQL)

### 1. Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# Windows (using installer)
# Download from: https://www.postgresql.org/download/windows/

# macOS (using Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Start PostgreSQL Service
```bash
# Windows
# PostgreSQL service should start automatically

# macOS
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Create Database and User
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE restaurant_db;

-- Create user (optional)
CREATE USER restaurant_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;

-- Exit
\q
```

### 4. Create .env.local file
Create a `.env.local` file in the project root:

```env
# Database Configuration for Local Development (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=restaurant_db

# Node Environment
NODE_ENV=development

# Server Port
PORT=3001
```

### 5. Test Configuration
```bash
npm run test-db
```

## Production Setup (Cloud PostgreSQL)

### 1. Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings > Database
4. Set as `DATABASE_URL` in Vercel environment variables

### 2. Vercel Environment Variables
Set in your Vercel project:
```
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres
```

### 3. Deploy
```bash
vercel --prod
```

## Configuration Files

### knexfile.cjs
- **Development**: Uses local PostgreSQL connection
- **Production**: Uses DATABASE_URL from environment

### src/utils/database.mjs
- Automatically detects environment
- Falls back to 'development' for local development
- Optimized for PostgreSQL syntax

## Database Commands

### Run Migrations
```bash
# Development
npm run migrate

# Production (via Vercel)
# Migrations run automatically on deploy
```

### Run Seeds
```bash
# Development
npm run seed

# Production
# Seeds can be run manually if needed
```

### Test Connection
```bash
npm run test-db
```

## Troubleshooting

### Common Issues

1. **"Connection refused"**
   - Check if PostgreSQL is running
   - Verify port 5432 is correct
   - Check firewall settings

2. **"Authentication failed"**
   - Verify username/password in `.env.local`
   - Check pg_hba.conf configuration

3. **"Database does not exist"**
   - Create database: `CREATE DATABASE restaurant_db;`
   - Check database name in `.env.local`

4. **Migration errors**
   - Run `npm run migrate` to apply migrations
   - Check database permissions

### PostgreSQL Commands
```bash
# Connect to PostgreSQL
psql -U postgres -d restaurant_db

# List databases
\l

# List tables
\dt

# Exit
\q
```

### Reset Database (Development)
```sql
-- Drop and recreate database
DROP DATABASE IF EXISTS restaurant_db;
CREATE DATABASE restaurant_db;
```

## Performance Tips

1. **Connection Pooling**: Already configured in knexfile
2. **Indexes**: Add indexes for frequently queried columns
3. **SSL**: Required for production connections
4. **Backup**: Regular backups recommended for production 