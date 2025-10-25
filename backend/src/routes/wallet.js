// src/routes/wallet.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /wallet/:user_id
router.get('/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  const database = db();
  try {
    const wallet = await database.get('SELECT * FROM wallets WHERE user_id = ?', userId);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    const txs = await database.all('SELECT id, amount, type, timestamp FROM transactions WHERE wallet_id = ? ORDER BY timestamp DESC LIMIT 20', wallet.id);
    res.json({ wallet: { id: wallet.id, balance: wallet.balance, user_id: wallet.user_id }, transactions: txs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /wallet/topup
router.post('/topup', async (req, res) => {
  const { user_id, amount } = req.body || {};
  if (!user_id || !amount || amount <= 0) return res.status(400).json({ error: 'user_id and positive amount required' });
  const database = db();
  try {
    const wallet = await database.get('SELECT * FROM wallets WHERE user_id = ?', user_id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    const newBalance = wallet.balance + parseFloat(amount);
    await database.run('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, wallet.id]);
    await database.run('INSERT INTO transactions (amount, type, wallet_id) VALUES (?, ?, ?)', [parseFloat(amount), 'topup', wallet.id]);
    res.json({ message: 'Topup successful', wallet: { id: wallet.id, balance: newBalance } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
