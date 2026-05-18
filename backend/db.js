const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'codacol.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    avatar TEXT
  )`);

  // Note Types
  db.run(`CREATE TABLE IF NOT EXISTS note_types (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT
  )`);

  // Notes
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    userId TEXT,
    typeId TEXT,
    title TEXT,
    content TEXT,
    color TEXT,
    tags TEXT,
    todos TEXT,
    sharedWith TEXT,
    createdAt INTEGER,
    updatedAt INTEGER
  )`);
});

module.exports = db;
