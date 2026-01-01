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

// Debug loaded environment variables
console.log('Loaded environment variables:', {
    MONGODB_URI_exists: !!process.env.MONGODB_URI,
    PORT_exists: !!process.env.PORT,
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
    JWT_SECRET_length: process.env.JWT_SECRET?.length,
    DEEPSEEK_API_KEY_exists: !!process.env.DEEPSEEK_API_KEY
});

// Read raw file content to check format (skip in production if file doesn't exist)
const fs = require('fs');
try {
    const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
    console.log('Raw .env file content:', envContent.split('\n').map(line => {
        if (line.toLowerCase().includes('secret') || line.toLowerCase().includes('key')) {
            return line.replace(/=.*/, '=<HIDDEN>');
        }
        return line;
    }).join('\n'));
} catch (error) {
    console.log('⚠️  .env file not accessible (normal for production)');
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
        deepseekKey: process.env.DEEPSEEK_API_KEY,
    }
};

// Validate required configuration
const validateConfig = () => {
    console.log('Validating configuration...');
    const required = {
        'MongoDB URI': config.mongodb.uri,
        'JWT Secret': config.jwt.secret,
        'DeepSeek API Key': config.api.deepseekKey
    };

    console.log('Configuration values:', {
        'MongoDB URI': config.mongodb.uri ? 'Set' : 'Not set',
        'JWT Secret': config.jwt.secret ? `Set (length: ${config.jwt.secret.length})` : 'Not set',
        'DeepSeek API Key': config.api.deepseekKey ? 'Set' : 'Not set'
    });

    const missing = Object.entries(required)
        .filter(([key, value]) => {
            const isMissing = !value;
            console.log(`Checking ${key}:`, { exists: !!value, length: value?.length });
            return isMissing;
        })
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error('Missing required configuration:', missing);
        process.exit(1);
    }
};

validateConfig();

module.exports = config;
