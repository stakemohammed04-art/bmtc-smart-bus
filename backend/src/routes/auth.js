// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// POST /auth/otp
router.post('/otp', async (req, res) => {
  const { phone, name } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const database = db();
  try {
    let user = await database.get('SELECT * FROM users WHERE phone = ?', phone);
    if (!user) {
      const result = await database.run('INSERT INTO users (phone, name) VALUES (?, ?)', [phone, name || null]);
      const userId = result.lastID;
      // create wallet with demo balance
      await database.run('INSERT INTO wallets (balance, user_id) VALUES (?, ?)', [200.0, userId]);
      user = await database.get('SELECT * FROM users WHERE id = ?', userId);
    }
    res.json({ message: 'OTP verified (mock)', user: { id: user.id, phone: user.phone, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
