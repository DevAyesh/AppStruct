const dotenv = require('dotenv');
const path = require('path');

// Show current directory and env file path
console.log('Loading environment variables...');
console.log('Current directory:', __dirname);
console.log('Env file path:', path.resolve(__dirname, '../.env'));

// Load environment variables from .env file (optional in production)
const result = dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

if (result.error) {
    console.warn('⚠️  No .env file found - using environment variables from hosting platform');
} else {
    console.log('✅ .env file loaded successfully');
}

// Debug loaded environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
    console.log('Loaded environment variables:', {
        MONGODB_URI_exists: !!process.env.MONGODB_URI,
        PORT_exists: !!process.env.PORT,
        JWT_SECRET_exists: !!process.env.JWT_SECRET,
        GEMINI_API_KEY_exists: !!process.env.GEMINI_API_KEY
    });
}

// Use MONGODB_URI consistently
const config = {
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
    server: {
        port: process.env.PORT || 5000,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    api: {
        geminiKey: process.env.GEMINI_API_KEY,
    }
};

// Validate required configuration
const validateConfig = () => {
    const required = {
        'MongoDB URI': config.mongodb.uri,
        'JWT Secret': config.jwt.secret,
        'Gemini API Key': config.api.geminiKey
    };

    const missing = Object.entries(required)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error('❌ Missing required configuration:', missing);
        process.exit(1);
    }

    if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Configuration validated successfully');
    }
};

validateConfig();

module.exports = config;
