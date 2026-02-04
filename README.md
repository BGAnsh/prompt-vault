# Prompt Vault

A self-hosted AI prompt library for storing, tagging, searching, and reusing prompts. Built with React + Vite + Tailwind, Express, and SQLite.

## Features

- Create, edit, delete prompts with tags and notes
- Search by title, content, and tags
- Filter by tag or favorites
- Copy-to-clipboard with usage stats (copy count + last used)
- SQLite storage at `./data/prompt-vault.db`
- `/api/health` endpoint

## Local Development

```bash
# Terminal 1
cd server
npm install
npm start

# Terminal 2
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3108`.

## Docker

```bash
docker compose up -d --build
```

The app listens on `PORT=3108` and stores the database at `./data/prompt-vault.db`.

## Caddy (Authelia)

Add this to your Caddyfile (managed externally):

```caddy
prompts.ansh.syncretiq.net {
	import authelia
	reverse_proxy localhost:3108
}
```

## API

- `GET /api/prompts` (supports `?search=`, `?tag=`, `?favorite=true`)
- `GET /api/prompts/:id`
- `POST /api/prompts`
- `PUT /api/prompts/:id`
- `DELETE /api/prompts/:id`
- `POST /api/prompts/:id/copy`
- `POST /api/prompts/:id/favorite`
- `GET /api/tags`
- `GET /api/health`
