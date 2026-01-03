const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const auth = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Checking authentication...');
    }

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      throw new Error('User not found');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Authentication successful:', {
        userId: user._id,
        username: user.username
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Authentication error:', error.message);
    }

    // Don't expose detailed error messages in production
    res.status(401).json({ 
      error: true,
      message: 'Authentication failed'
    });
  }
};

module.exports = auth;
