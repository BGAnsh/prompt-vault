# PLAN.md — Prompt Vault

> **Winner:** AI Prompt Library — not covered by existing apps, directly useful for daily AI work, buildable in ~2.5 hours.

---

## 🎯 Goal

Build a personal AI prompt library for storing, organizing, tagging, and quickly copying frequently-used prompts. Self-hosted, fast, minimal, behind Authelia.

---

## 👤 User Stories

### MVP (This Build)
1. Add a new prompt with title, content, tags, and optional notes
2. Browse all prompts in a clean grid view
3. Search prompts by title, content, or tags
4. Filter prompts by tag
5. One-click copy to clipboard
6. Edit or delete existing prompts
7. See usage stats (copy count, last used)
8. Favorite prompts for quick access

### Post-MVP (Later)
- Variables/placeholders (`{{topic}}`) with fill-in modal
- Import/export JSON
- Hierarchical folders
- Version history

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Express.js |
| Database | SQLite (better-sqlite3) |
| Icons | Lucide React |
| Deployment | Docker + docker-compose |
| Auth | Authelia (external, already configured) |

---

## 📁 File Structure

```
prompt-vault/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PromptCard.jsx
│   │   │   ├── PromptForm.jsx
│   │   │   ├── PromptList.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── TagFilter.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/
│   │   │   └── usePrompts.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   │   └── prompts.js
│   └── package.json
├── data/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prompts` | List all (supports `?search=`, `?tag=`, `?favorite=true`) |
| `GET` | `/api/prompts/:id` | Get single prompt |
| `POST` | `/api/prompts` | Create prompt |
| `PUT` | `/api/prompts/:id` | Update prompt |
| `DELETE` | `/api/prompts/:id` | Delete prompt |
| `POST` | `/api/prompts/:id/copy` | Record copy (increment useCount, update lastUsed) |
| `POST` | `/api/prompts/:id/favorite` | Toggle favorite |
| `GET` | `/api/tags` | List unique tags with counts |
| `GET` | `/api/health` | Health check |

### Database Schema

```sql
CREATE TABLE prompts (
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
```

---

## 🖼 Key UI Screens

### Main Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  🗃️ Prompt Vault                            [+ New Prompt]  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search prompts...                                       │
│  Tags: [All] [coding] [writing] [analysis] [⭐ Favorites]   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ ⭐ Code Review  │  │ Blog Outline    │  │ Summarize    │ │
│  │ Review this...  │  │ Create an out.. │  │ Summarize... │ │
│  │ #coding #review │  │ #writing        │  │ #analysis    │ │
│  │ Used 47x        │  │ Used 12x        │  │ Used 8x      │ │
│  │     [📋 Copy]   │  │     [📋 Copy]   │  │   [📋 Copy]  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Add/Edit Modal
```
┌──────────────────────────────────────────┐
│  ✨ New Prompt                        [X] │
├──────────────────────────────────────────┤
│  Title *         [____________________]  │
│  Content *       [____________________]  │
│                  [____________________]  │
│  Tags            [coding, review______]  │
│  Notes           [____________________]  │
│           [Cancel]  [💾 Save Prompt]     │
└──────────────────────────────────────────┘
```

### Expanded View (Click Card)
```
┌──────────────────────────────────────────────────────────┐
│  Code Review                              ⭐ [✏️] [🗑️]   │
├──────────────────────────────────────────────────────────┤
│  Review this code for bugs, security issues, and best    │
│  practices: {paste code here}                            │
│  ──────────────────────────────────────────────────────  │
│  📝 Notes: Works great with Claude                       │
│  🏷️ #coding #review · 📊 47x · Last: 2h ago              │
│                              [📋 Copy to Clipboard]      │
└──────────────────────────────────────────────────────────┘
```

---

## 🔒 Security

- **Auth:** Authelia handles it — no app-level auth needed
- **XSS:** Escape HTML in prompt content
- **SQL:** Parameterized queries via better-sqlite3
- **Backup:** `./data/prompt-vault.db` — add to backup rotation

---

## 🚀 Deployment

### docker-compose.yml
```yaml
version: '3.8'
services:
  prompt-vault:
    build: .
    container_name: prompt-vault
    restart: unless-stopped
    ports:
      - "3108:3108"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3108
```

### Dockerfile
```dockerfile
FROM node:22-alpine
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

COPY server ./server
RUN mkdir -p server/public && cp -r client/dist/* server/public/

WORKDIR /app/server
EXPOSE 3108
CMD ["node", "index.js"]
```

### Caddy Snippet (add to /etc/caddy/Caddyfile)
```caddy
prompts.ansh.syncretiq.net {
	import authelia
	reverse_proxy localhost:3108
}
```

### Deploy Commands
```bash
cd ~/projects/prompt-vault
docker compose up -d --build
sudo systemctl reload caddy
```

---

## ✅ Verification Checklist

- [ ] `docker ps | grep prompt-vault` — running
- [ ] `curl localhost:3108/api/health` → `{"status":"ok"}`
- [ ] `curl -I https://prompts.ansh.syncretiq.net` → 302 to Authelia
- [ ] After login: app loads, create/edit/delete/copy/favorite all work
- [ ] Mobile responsive

---

## 📚 Post-Deploy Updates

### Add to TOOLS.md:
```markdown
## Prompt Vault
**URL:** https://prompts.ansh.syncretiq.net (Authelia protected)
**Port:** 3108, Docker container: `prompt-vault`
**Stack:** React + Express + SQLite
**Path:** ~/projects/prompt-vault
```

---

## 🕐 Time Estimate

| Phase | Time |
|-------|------|
| Project setup | 10 min |
| Backend | 30 min |
| Frontend | 60 min |
| Styling | 20 min |
| Docker + deploy | 15 min |
| Testing | 15 min |
| **Total** | **~2.5 hours** |
