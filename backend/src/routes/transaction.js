// src/routes/transaction.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

const AUTO_TOPUP_THRESHOLD = 50.0;
const AUTO_TOPUP_AMOUNT = 200.0;

// POST /transaction
router.post('/', async (req, res) => {
  const { user_id, amount } = req.body || {};
  if (!user_id || !amount || amount <= 0) return res.status(400).json({ error: 'user_id and positive amount required' });
  const database = db();
  try {
    const wallet = await database.get('SELECT * FROM wallets WHERE user_id = ?', user_id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    if (wallet.balance < amount) return res.status(402).json({ error: 'Insufficient balance' });
    const newBalance = wallet.balance - parseFloat(amount);
    await database.run('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, wallet.id]);
    await database.run('INSERT INTO transactions (amount, type, wallet_id) VALUES (?, ?, ?)', [-parseFloat(amount), 'fare', wallet.id]);
    let auto_topup = false;
    let finalBalance = newBalance;
    if (finalBalance < AUTO_TOPUP_THRESHOLD) {
      finalBalance += AUTO_TOPUP_AMOUNT;
      await database.run('UPDATE wallets SET balance = ? WHERE id = ?', [finalBalance, wallet.id]);
      await database.run('INSERT INTO transactions (amount, type, wallet_id) VALUES (?, ?, ?)', [AUTO_TOPUP_AMOUNT, 'autotopup', wallet.id]);
      auto_topup = true;
    }
    res.json({ message: 'Fare deducted', wallet: { id: wallet.id, balance: finalBalance }, auto_topup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
