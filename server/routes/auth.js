const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config/config');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
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
    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    console.log('User created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email
    });

    // Generate token
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

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', {
      email: req.body.email
    });

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    console.log('Login successful:', {
      id: user._id,
      username: user.username,
      email: user.email
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: true,
      message: 'Error logging in'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Fetching user profile:', {
      id: req.user._id,
      username: req.user.username
    });

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching user data'
    });
  }
});

// Logout user (optional, since JWT is stateless)
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Error logging out'
    });
  }
});

module.exports = router;
