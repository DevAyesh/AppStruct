const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file (optional in production)
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('⚠️  No .env file found - using environment variables from hosting platform');
  console.log('This is normal for production deployments (Railway, Render, etc.)');
} else {
  console.log('✅ .env file loaded successfully');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const Blueprint = require('./models/Blueprint');
const { generateBlueprint } = require('./services/deepseek');
const auth = require('./middleware/auth');

const app = express();

// Trust proxy for Railway/production deployments
// This allows express-rate-limit to correctly identify users via X-Forwarded-For header
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (Railway)
}

// Debug environment variables (without exposing sensitive data)
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI_exists: !!process.env.MONGODB_URI,
  PORT_exists: !!process.env.PORT,
  GEMINI_API_KEY_exists: !!process.env.GEMINI_API_KEY,
  JWT_SECRET_exists: !!process.env.JWT_SECRET,
  current_dir: __dirname,
  env_path: envPath,
  env_loaded: !!result.parsed
});

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI', 'PORT', 'GEMINI_API_KEY', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('📝 Please check your Railway/hosting platform environment variables');
  console.error('Required variables:', requiredEnvVars.join(', '));
  process.exit(1);
}

// Middleware
// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"].filter(Boolean)
    }
  },
  crossOriginEmbedderPolicy: false // Allow external resources
}));

// Configure CORS with secure defaults
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      /\.vercel\.app$/,
      /\.railway\.app$/
    ].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));
app.use(express.json());

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: true, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for generation endpoints
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 generation requests per 15 minutes
  message: { error: true, message: 'Too many generation requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Serve static files from the public directory
app.use(express.static('public'));

// Connect to MongoDB with detailed logging
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Database URL:', config.mongodb.uri.replace(
        /(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/,
        '$1[HIDDEN]$3'
      ));
    }

    // Add mongoose debug logging only in development
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }

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

// Add request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
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
}

// Routes
app.use('/api/auth', authRoutes);

// DNS test endpoint (for debugging - only in development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/dns-test', async (req, res) => {
    const dns = require('dns').promises;
    try {
      const addresses = await dns.resolve4('generativelanguage.googleapis.com');
      res.json({
        success: true,
        hostname: 'generativelanguage.googleapis.com',
        addresses: addresses,
        message: 'DNS resolution successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        message: 'DNS resolution failed'
      });
    }
  });
}

// Protected routes
app.post('/api/generate', generateLimiter, auth, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Generate request received:', {
        user: req.user?._id,
        platform: req.body.platform,
        ideaLength: req.body.idea?.length || 0
      });
    }

    const { idea, platform } = req.body;
    
    // Input validation
    if (!idea || !platform) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea and platform are required' 
      });
    }

    if (typeof idea !== 'string' || typeof platform !== 'string') {
      return res.status(400).json({ 
        error: true,
        message: 'Invalid input types' 
      });
    }

    if (idea.trim().length < 10) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea must be at least 10 characters long' 
      });
    }

    if (idea.length > 5000) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea is too long (maximum 5000 characters)' 
      });
    }

    const validPlatforms = ['web', 'mobile', 'both'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({ 
        error: true,
        message: 'Invalid platform. Must be one of: web, mobile, both' 
      });
    }

    const markdown = await generateBlueprint(idea, platform);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Generated markdown length:', markdown?.length || 0);
    }
    
    res.json({ markdown });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Generate API Error:', error.message);
    }

    res.status(500).json({
      error: true,
      message: 'Error generating blueprint'
    });
  }
});

// Streaming endpoint for real-time blueprint generation
app.post('/api/generate-stream', generateLimiter, auth, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Streaming generate request received:', {
        user: req.user?._id,
        platform: req.body.platform,
        detailLevel: req.body.detailLevel,
        ideaLength: req.body.idea?.length || 0
      });
    }

    const { idea, platform, detailLevel } = req.body;
    
    // Input validation
    if (!idea || !platform) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea and platform are required' 
      });
    }

    if (typeof idea !== 'string' || typeof platform !== 'string') {
      return res.status(400).json({ 
        error: true,
        message: 'Invalid input types' 
      });
    }

    if (idea.trim().length < 10) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea must be at least 10 characters long' 
      });
    }

    if (idea.length > 5000) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea is too long (maximum 5000 characters)' 
      });
    }

    const validPlatforms = ['web', 'mobile', 'both'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({ 
        error: true,
        message: 'Invalid platform. Must be one of: web, mobile, both' 
      });
    }

    if (detailLevel && !['brief', 'full'].includes(detailLevel)) {
      return res.status(400).json({ 
        error: true,
        message: 'Invalid detail level. Must be one of: brief, full' 
      });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Call the streaming version of generateBlueprint
    const { generateBlueprintStream } = require('./services/deepseek');
    await generateBlueprintStream(idea, platform, detailLevel, (chunk) => {
      res.write(chunk);
    });
    
    res.end();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Streaming Generate API Error:', error.message);
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: true,
        message: 'Error generating blueprint'
      });
    } else {
      res.end();
    }
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Save blueprint error:', error.message);
    }
    res.status(400).json({ 
      error: true,
      message: 'Error saving blueprint'
    });
  }
});

app.get('/api/blueprints', auth, async (req, res) => {
  try {
    const blueprints = await Blueprint.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(blueprints);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Get blueprints error:', error.message);
    }
    res.status(500).json({ 
      error: true,
      message: 'Error fetching blueprints'
    });
  }
});

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
