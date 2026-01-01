const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const Blueprint = require('./models/Blueprint');
const { generateBlueprint } = require('./services/deepseek');
const auth = require('./middleware/auth');

const app = express();

// Debug environment variables
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI_exists: !!process.env.MONGODB_URI,
  PORT_exists: !!process.env.PORT,
  DEEPSEEK_API_KEY_exists: !!process.env.DEEPSEEK_API_KEY,
  DEEPSEEK_API_KEY_start: process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 8)}...` : null,
  DEEPSEEK_API_KEY_length: process.env.DEEPSEEK_API_KEY?.length,
  JWT_SECRET_exists: !!process.env.JWT_SECRET,
  JWT_SECRET_length: process.env.JWT_SECRET?.length,
  current_dir: __dirname,
  env_path: envPath,
  env_loaded: !!result.parsed,
  env_keys: result.parsed ? Object.keys(result.parsed) : []
});

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI', 'PORT', 'DEEPSEEK_API_KEY', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

// Middleware
// Configure CORS to allow all origins for testing purposes
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://vercel.app', /\.vercel\.app$/]
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Connect to MongoDB with detailed logging
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Database URL:', config.mongodb.uri.replace(
      /(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/,
      '$1[HIDDEN]$3'
    ));

    // Add mongoose debug logging
    mongoose.set('debug', true);

    await mongoose.connect(config.mongodb.uri, {
      dbName: 'appstruct'
    });

    // Log collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Log database name
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    });
    process.exit(1);
  }
};

// Initialize database connection
connectDB().catch(console.error);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[HIDDEN]' : undefined
    }
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Protected routes
app.post('/api/generate', auth, async (req, res) => {
  try {
    console.log('Generate request received:', {
      body: req.body,
      user: req.user?._id,
      apiKeyExists: !!process.env.DEEPSEEK_API_KEY,
      apiKeyStart: process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 8)}...` : null
    });

    const { idea, platform } = req.body;
    
    if (!idea || !platform) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea and platform are required' 
      });
    }

    console.log('Calling OpenRouter API with:', { idea, platform });
    const markdown = await generateBlueprint(idea, platform);
    console.log('Generated markdown length:', markdown?.length || 0);
    
    res.json({ markdown });
  } catch (error) {
    console.error('Generate API Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      envCheck: {
        DEEPSEEK_API_KEY_exists: !!process.env.DEEPSEEK_API_KEY,
        DEEPSEEK_API_KEY_start: process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 8)}...` : null,
        DEEPSEEK_API_KEY_length: process.env.DEEPSEEK_API_KEY?.length
      }
    });

    res.status(500).json({
      error: true,
      message: error.message,
      details: error.response?.data
    });
  }
});

app.post('/api/blueprints', auth, async (req, res) => {
  try {
    const blueprint = new Blueprint({
      ...req.body,
      userId: req.user._id
    });
    await blueprint.save();
    res.status(201).json(blueprint);
  } catch (error) {
    console.error('Save blueprint error:', error);
    res.status(400).json({ 
      error: true,
      message: error.message 
    });
  }
});

app.get('/api/blueprints', auth, async (req, res) => {
  try {
    const blueprints = await Blueprint.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(blueprints);
  } catch (error) {
    console.error('Get blueprints error:', error);
    res.status(500).json({ 
      error: true,
      message: error.message 
    });
  }
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
