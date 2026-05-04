const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config/config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Register new user
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const createToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });
};

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: true,
        message: 'Google credential is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({
      $or: [{ googleId: sub }, { email }]
    });

    if (!user) {
      user = new User({
        username: email.split('@')[0],
        email,
        googleId: sub,
        authProvider: 'google',
        avatar: picture,
        isEmailVerified: true
      });

      await user.save();
    } else if (!user.googleId) {
      user.googleId = sub;
      user.authProvider = 'google';
      user.avatar = user.avatar || picture;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.cookie('authToken', token, authCookieOptions);

    res.json({
      user: {
        id: user._id,
        username: user.username || name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(401).json({
      error: true,
      message: 'Google sign-in failed'
    });
  }
});

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
  if (password.length < 8) {
    return res.status(400).json({
      error: true,
      message: 'Password must be at least 8 characters long'
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

    // Create new user with email verification token
    const verificationToken = createToken();

    const user = new User({
      username,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    await user.save();

    if (process.env.NODE_ENV !== 'production') {
      console.log('User created successfully:', user._id);
    }

    const verifyUrl = `${process.env.FRONTEND_URL}/?verifyToken=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: 'Verify your AppStruct email',
      html: `
        <h2>Verify your email</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.'
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
    
  // Verify email
  router.post('/verify-email', async (req, res) => {
      try {
        const { token } = req.body;
    
        if (!token) {
          return res.status(400).json({
            error: true,
            message: 'Verification token is required'
          });
        }
    
        const user = await User.findOne({
          emailVerificationToken: hashToken(token),
          emailVerificationExpires: { $gt: Date.now() }
        });
    
        if (!user) {
          return res.status(400).json({
            error: true,
            message: 'Invalid or expired verification token'
          });
        }
    
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
    
        res.json({
          message: 'Email verified successfully. You can now sign in.'
        });
      } catch (error) {
        res.status(500).json({
          error: true,
          message: 'Email verification failed'
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
    // Check if user is authenticated with Google
    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({
        error: true,
        message: 'Please sign in with Google'
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
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: true,
        message: 'Please verify your email before signing in'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    res.cookie('authToken', token, authCookieOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Login successful:', user._id);
    }

    res.json({
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



// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const genericMessage = {
      message: 'If an account exists, a reset link has been sent.'
    };

    if (!email) return res.json(genericMessage);

    const user = await User.findOne({ email });

    if (!user || user.authProvider === 'google') {
      return res.json(genericMessage);
    }

    const resetToken = createToken();

    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/?resetToken=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Reset your AppStruct password',
      html: `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 30 minutes.</p>
      `
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Password reset email sent to:', email);
    }

    res.json(genericMessage);
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Error sending reset email'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: true,
        message: 'Token and new password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 8 characters long'
      });
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful. You can now sign in.'
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Password reset failed'
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
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Error logging out'
    });
  }
});

module.exports = router;
