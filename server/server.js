require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Blueprint = require('./models/Blueprint');
const { generateBlueprint } = require('./services/deepseek');

// Verify environment variables
console.log('Environment variables loaded:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  PORT: process.env.PORT,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? `Set (starts with: ${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...)` : 'Not set'
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use local MongoDB if MONGODB_URI is not set
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appstruct';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB:', mongoURI);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Continue running the app even if DB connection fails
  }
};

connectDB();

// Routes
app.post('/api/generate', async (req, res) => {
  try {
    console.log('Received generate request:', req.body);
    const { idea, platform } = req.body;
    
    if (!idea || !platform) {
      return res.status(400).json({ 
        error: true,
        message: 'Idea and platform are required' 
      });
    }

    console.log('Calling DeepSeek API with:', { idea, platform });
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

// Make blueprint routes optional based on DB connection
if (mongoose.connection.readyState === 1) {
  app.post('/api/blueprints', async (req, res) => {
    try {
      const blueprint = new Blueprint(req.body);
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

  app.get('/api/blueprints/:userId', async (req, res) => {
    try {
      const blueprints = await Blueprint.find({ userId: req.params.userId })
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
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
