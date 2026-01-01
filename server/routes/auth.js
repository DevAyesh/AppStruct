const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config/config');
const fetch = require('node-fetch');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:10',message:'Register endpoint entry',data:{hasBody:!!req.body,bodyKeys:req.body?Object.keys(req.body):[],username:req.body?.username,email:req.body?.email,hasPassword:!!req.body?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  try {
    console.log('Registration attempt:', {
      username: req.body.username,
      email: req.body.email
    });

    const { username, email, password } = req.body;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:18',message:'Extracted fields',data:{username,email,hasPassword:!!password,passwordLength:password?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Validate input
    if (!username || !email || !password) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:21',message:'Validation failed',data:{hasUsername:!!username,hasEmail:!!email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return res.status(400).json({
        error: true,
        message: 'Username, email and password are required'
      });
    }

    // Check if user exists
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:28',message:'Before user lookup',data:{email,username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:32',message:'User lookup result',data:{userExists:!!existingUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:44',message:'Before user creation',data:{username,email,usernameLength:username?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const user = new User({
      username,
      email,
      password
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:50',message:'Before user save',data:{hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    await user.save();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:51',message:'User saved successfully',data:{userId:user._id?.toString(),username:user.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.log('User created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email
    });

    // Generate token
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:58',message:'Before token generation',data:{hasJwtSecret:!!config.jwt?.secret,userId:user._id?.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: '7d' }
    );
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:63',message:'Token generated',data:{hasToken:!!token,tokenLength:token?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:64',message:'Sending success response',data:{status:201},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f597ff93-d54e-4226-baba-0c5fa440c128',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/auth.js:72',message:'Registration catch error',data:{errorMessage:error.message,errorName:error.name,errorCode:error.code,isValidationError:error.name==='ValidationError',isMongoError:error.name==='MongoError'||error.code===11000},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
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
