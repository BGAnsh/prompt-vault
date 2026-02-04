const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'prompt-vault.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    notes TEXT,
    favorite INTEGER DEFAULT 0,
    useCount INTEGER DEFAULT 0,
    lastUsed TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_prompts_updatedAt ON prompts (updatedAt);
  CREATE INDEX IF NOT EXISTS idx_prompts_favorite ON prompts (favorite);
`);

module.exports = db;
