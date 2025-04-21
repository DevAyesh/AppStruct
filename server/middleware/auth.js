const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const auth = async (req, res, next) => {
  try {
    console.log('Checking authentication...');
    console.log('Headers:', {
      ...req.headers,
      authorization: req.headers.authorization ? '[HIDDEN]' : 'Not present'
    });

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      throw new Error('No authentication token found');
    }

    // Verify token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('Token decoded:', { userId: decoded.userId });

    // Find user
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      console.log('User not found for token');
      throw new Error('User not found');
    }

    console.log('Authentication successful:', {
      userId: user._id,
      username: user.username
    });

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    res.status(401).json({ 
      error: true,
      message: 'Please authenticate',
      details: error.message
    });
  }
};

module.exports = auth;
