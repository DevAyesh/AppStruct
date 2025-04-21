require('dotenv').config();
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
  DEEPSEEK_API_KEY_length: process.env.DEEPSEEK_API_KEY?.length,
  JWT_SECRET_exists: !!process.env.JWT_SECRET,
  JWT_SECRET_length: process.env.JWT_SECRET?.length,
  current_dir: __dirname,
  env_path: require('path').resolve(__dirname, '.env')
});

// Middleware
app.use(cors());
app.use(express.json());

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
    console.log('Received generate request:', req.body);
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
      response: error.response?.data
    });

    res.status(500).json({
      error: true,
      message: error.message,
      details: error.response?.data
    });
  }
});

// Add error handling for auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', {
      username: req.body.username,
      email: req.body.email
    });

    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Username, email and password are required'
      });
    }

    // Check if user exists
    const User = require('./models/User');
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log('User already exists:', {
        email: existingUser.email,
        username: existingUser.username
      });
      return res.status(400).json({
        error: true,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    console.log('User created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email
    });

    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    res.status(500).json({
      error: true,
      message: 'Error creating user',
      details: error.message
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
