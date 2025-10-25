// server.js - BMTC Smart Bus (Node + SQLite) - Deploy-ready
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./src/db');
const authRoutes = require('./src/routes/auth');
const walletRoutes = require('./src/routes/wallet');
const transactionRoutes = require('./src/routes/transaction');
const telemetryRoutes = require('./src/routes/telemetry');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// CORS for deployed frontend; simple allow all for demo (adjust for production)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res) => res.json({ message: '🚍 BMTC Smart Bus API (Node) running!' }));

app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);
app.use('/transaction', transactionRoutes);
app.use('/bus', telemetryRoutes);

// serve frontend static build if present (for simple deploy to a single host)
const staticPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(staticPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB', err);
});
