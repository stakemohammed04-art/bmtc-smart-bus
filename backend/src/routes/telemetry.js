// src/routes/telemetry.js
const express = require('express');
const router = express.Router();
const { db } = require('../db');

// POST /bus/update
router.post('/update', async (req, res) => {
  const { bus_id, latitude, longitude, speed } = req.body || {};
  if (!bus_id || latitude === undefined || longitude === undefined) return res.status(400).json({ error: 'bus_id, latitude and longitude required' });
  const database = db();
  try {
    const result = await database.run('INSERT INTO telemetry (bus_id, latitude, longitude, speed) VALUES (?, ?, ?, ?)', [bus_id, parseFloat(latitude), parseFloat(longitude), parseFloat(speed || 0)]);
    res.json({ message: 'Telemetry saved', telemetry_id: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /bus/latest - return latest position per bus
router.get('/latest', async (req, res) => {
  const database = db();
  try {
    const rows = await database.all(`
      SELECT t.bus_id, t.latitude, t.longitude, t.speed, t.timestamp
      FROM telemetry t
      INNER JOIN (
        SELECT bus_id, MAX(timestamp) as maxts FROM telemetry GROUP BY bus_id
      ) mx ON t.bus_id = mx.bus_id AND t.timestamp = mx.maxts
    `);
    res.json({ buses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
