import express from "express"
import dotenv from 'dotenv'

// Load environment variables
try {
    dotenv.config()
} catch (error) {
    console.log('No .env file found, using environment variables');
}

const app = express();

// Basic middleware
app.use(express.json());

// Simple CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
    next();
});

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    });
});

app.get('/test', (req, res) => {
    res.json({
        message: 'Test endpoint working!',
        timestamp: new Date().toISOString()
    });
});

app.get('/cors-test', (req, res) => {
    res.json({
        message: 'CORS test successful',
        timestamp: new Date().toISOString()
    });
});

// Handle OPTIONS
app.options('*', (req, res) => {
    res.status(200).end();
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

const port = process.env.PORT || 3000;

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default app;