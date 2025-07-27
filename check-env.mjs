import fs from 'fs';
import path from 'path';

console.log('🔍 Checking environment configuration...');

// Check for .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

console.log('📁 Current directory:', process.cwd());
console.log('🔍 .env.local exists:', fs.existsSync(envLocalPath));
console.log('🔍 .env exists:', fs.existsSync(envPath));

if (fs.existsSync(envLocalPath)) {
    console.log('✅ Found .env.local');
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');
    console.log('🔗 DATABASE_URL in .env.local:', hasDatabaseUrl);

    if (hasDatabaseUrl) {
        const lines = envContent.split('\n');
        const dbLine = lines.find(line => line.startsWith('DATABASE_URL='));
        if (dbLine) {
            const url = dbLine.split('=')[1];
            console.log('🔗 DATABASE_URL preview:', url.substring(0, 20) + '...');
        }
    }
} else if (fs.existsSync(envPath)) {
    console.log('✅ Found .env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');
    console.log('🔗 DATABASE_URL in .env:', hasDatabaseUrl);
} else {
    console.log('❌ No environment file found!');
    console.log('📝 You need to create a .env.local file with your DATABASE_URL');
    console.log('📝 Example:');
    console.log('DATABASE_URL=postgresql://username:password@host:port/database');
    console.log('JWT_SECRET=your_jwt_secret_here');
}

// Check if DATABASE_URL is in environment variables
console.log('🔗 DATABASE_URL in process.env:', !!process.env.DATABASE_URL);
console.log('🔐 JWT_SECRET in process.env:', !!process.env.JWT_SECRET);

console.log('📊 Environment check completed!'); 