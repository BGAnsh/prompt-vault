const express = require('express');
const path = require('path');

const promptsRouter = require('./routes/prompts');

const app = express();
const PORT = process.env.PORT || 3108;

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', promptsRouter);

if (process.env.NODE_ENV === 'production') {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Prompt Vault listening on ${PORT}`);
});
