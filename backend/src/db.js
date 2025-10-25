// src/db.js - SQLite helper
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', '..', 'bmtc_node.db');

let _db;

async function init() {
  _db = await sqlite.open({ filename: DB_PATH, driver: sqlite3.Database });
  await createTables();
  console.log('SQLite DB ready at', DB_PATH);
}

async function createTables() {
  await _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      balance REAL DEFAULT 0,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      wallet_id INTEGER,
      FOREIGN KEY(wallet_id) REFERENCES wallets(id)
    );
    CREATE TABLE IF NOT EXISTS telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bus_id TEXT,
      latitude REAL,
      longitude REAL,
      speed REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function db() { return _db; }

module.exports = { init, db };
