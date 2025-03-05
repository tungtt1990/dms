// src/controllers/auth.controller.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, full_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
      [username, email, hashedPassword, full_name, role]
    );
    res.status(201).json({ message: 'User registered', user_id: result.rows[0].user_id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials'});
    
    const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error });
  }
};
