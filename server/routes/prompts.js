const express = require('express');
const db = require('../db');

const router = express.Router();

const normalizeTags = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    const normalized = input
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean);
    return [...new Set(normalized)];
  }
  if (typeof input === 'string') {
    const normalized = input
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    return [...new Set(normalized)];
  }
  return [];
};

const serializeTags = (tags) => JSON.stringify(tags ?? []);

const parseTags = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const formatPrompt = (row) => {
  if (!row) return null;
  return {
    ...row,
    tags: parseTags(row.tags),
    favorite: Boolean(row.favorite),
    useCount: row.useCount ?? 0,
  };
};

router.get('/prompts', (req, res) => {
  const { search, tag, favorite } = req.query;
  const clauses = [];
  const params = {};

  if (favorite === 'true') {
    clauses.push('favorite = 1');
  }

  if (tag) {
    const normalizedTag = String(tag).trim().toLowerCase();
    if (normalizedTag) {
      clauses.push('tags LIKE @tag');
      params.tag = `%"${normalizedTag}"%`;
    }
  }

  if (search) {
    const normalizedSearch = `%${String(search).trim().toLowerCase()}%`;
    clauses.push(
      '(LOWER(title) LIKE @search OR LOWER(content) LIKE @search OR LOWER(tags) LIKE @search)'
    );
    params.search = normalizedSearch;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM prompts ${where} ORDER BY favorite DESC, updatedAt DESC`;
  const rows = db.prepare(sql).all(params);
  res.json(rows.map(formatPrompt));
});

router.get('/prompts/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!row) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }
  res.json(formatPrompt(row));
});

router.post('/prompts', (req, res) => {
  const { title, content, notes, favorite } = req.body ?? {};
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const tags = normalizeTags(req.body?.tags);
  const favoriteValue =
    favorite === true || favorite === 'true' || favorite === 1 || favorite === '1' ? 1 : 0;
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO prompts (title, content, tags, notes, favorite, useCount, lastUsed, createdAt, updatedAt)
     VALUES (@title, @content, @tags, @notes, @favorite, 0, NULL, @createdAt, @updatedAt)`
  );

  const info = stmt.run({
    title: String(title).trim(),
    content: String(content).trim(),
    tags: serializeTags(tags),
    notes: notes ? String(notes).trim() : null,
    favorite: favoriteValue,
    createdAt: now,
    updatedAt: now,
  });

  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(formatPrompt(row));
});

router.put('/prompts/:id', (req, res) => {
  const { title, content, notes, favorite } = req.body ?? {};
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }

  const tags = normalizeTags(req.body?.tags);
  const favoriteValue =
    favorite === true || favorite === 'true' || favorite === 1 || favorite === '1' ? 1 : 0;
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `UPDATE prompts
     SET title = @title,
         content = @content,
         tags = @tags,
         notes = @notes,
         favorite = @favorite,
         updatedAt = @updatedAt
     WHERE id = @id`
  );

  stmt.run({
    id: req.params.id,
    title: String(title).trim(),
    content: String(content).trim(),
    tags: serializeTags(tags),
    notes: notes ? String(notes).trim() : null,
    favorite: favoriteValue,
    updatedAt: now,
  });

  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  res.json(formatPrompt(row));
});

router.delete('/prompts/:id', (req, res) => {
  const info = db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id);
  if (info.changes === 0) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }
  res.json({ success: true });
});

router.post('/prompts/:id/copy', (req, res) => {
  const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE prompts
     SET useCount = useCount + 1,
         lastUsed = @lastUsed,
         updatedAt = @updatedAt
     WHERE id = @id`
  ).run({
    id: req.params.id,
    lastUsed: now,
    updatedAt: now,
  });

  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  res.json(formatPrompt(row));
});

router.post('/prompts/:id/favorite', (req, res) => {
  const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Prompt not found' });
    return;
  }

  const now = new Date().toISOString();
  const nextFavorite = existing.favorite ? 0 : 1;
  db.prepare(
    `UPDATE prompts
     SET favorite = @favorite,
         updatedAt = @updatedAt
     WHERE id = @id`
  ).run({
    id: req.params.id,
    favorite: nextFavorite,
    updatedAt: now,
  });

  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  res.json(formatPrompt(row));
});

router.get('/tags', (req, res) => {
  const rows = db.prepare('SELECT tags FROM prompts').all();
  const counts = rows.reduce((acc, row) => {
    const tags = parseTags(row.tags);
    tags.forEach((tag) => {
      const normalized = String(tag).trim().toLowerCase();
      if (!normalized) return;
      acc[normalized] = (acc[normalized] || 0) + 1;
    });
    return acc;
  }, {});

  const result = Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  res.json(result);
});

module.exports = router;
