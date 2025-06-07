// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../lib/db');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, role, mobile, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !role || !password) {
      return res.status(400).json({ 
        message: 'Name, email, role, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (name, email, role, mobile, password) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, mobile, created_at`,
      [name, email, role.toUpperCase(), mobile || null, hashedPassword]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

// Signin Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);

    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.rows[0];

    res.status(200).json({
      message: 'Signin successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;