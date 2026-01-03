const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config/config');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Username, email and password are required'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid email format'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
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

    if (process.env.NODE_ENV !== 'production') {
      console.log('User created successfully:', user._id);
    }

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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Registration error:', error.message);
    }
    res.status(500).json({
      error: true,
      message: 'Error creating user'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

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

    if (process.env.NODE_ENV !== 'production') {
      console.log('Login successful:', user._id);
    }

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error.message);
    }
    res.status(500).json({
      error: true,
      message: 'Error logging in'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching user profile:', error.message);
    }
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
