# AGENTS.md

## OVERVIEW

Prompt Vault is a self-hosted prompt management app for storing, tagging, searching, favoriting, and reusing AI prompts.

Problem it solves:
- Prevents prompt loss across chat tools and notes apps.
- Makes prompt reuse fast via search, tag filters, favorites, and one-click copy.
- Tracks simple usage metadata (`useCount`, `lastUsed`) so frequent prompts surface naturally.

Current status:
- Functional MVP / early-stage prototype.
- Core CRUD and filtering flows are implemented and working.
- No automated test suite or migration framework yet.

## ARCHITECTURE

### Tech Stack (Declared Versions)

Note: There are no lockfiles in this repo, so only semver ranges are pinned in `package.json`.

Server (`server/package.json`):
- `express` `^4.19.2`
- `better-sqlite3` `^9.4.0`
- Runtime in container: `node:22-alpine` (`Dockerfile`)

Client (`client/package.json`):
- `react` `^18.2.0`
- `react-dom` `^18.2.0`
- `vite` `^5.2.0`
- `@vitejs/plugin-react` `^4.2.0`
- `tailwindcss` `^3.4.1`
- `postcss` `^8.4.31`
- `autoprefixer` `^10.4.16`

### Folder Structure

Top-level:
- `client/`: React SPA (Vite + Tailwind), all frontend source.
- `server/`: Express API + SQLite access + production static serving.
- `data/`: SQLite database files (`prompt-vault.db` and WAL sidecars).
- `Dockerfile`: Multi-stage-ish single-image build (installs deps, builds client, serves via Express).
- `docker-compose.yml`: Single service deployment, binds to `127.0.0.1:3108`.
- `README.md`: Human-facing setup and endpoint list.
- `PLAN.md`: Original implementation plan and architecture intent.

Frontend structure:
- `client/src/main.jsx`: React entrypoint.
- `client/src/App.jsx`: Top-level page orchestration and UI composition.
- `client/src/hooks/usePrompts.js`: API client logic + local state for prompts/tags/loading/error.
- `client/src/components/*.jsx`: Presentation + interaction components.
- `client/src/index.css`: Tailwind layers + global styles.

Backend structure:
- `server/index.js`: Express bootstrap, `/api/health`, API router mount, production static serving.
- `server/routes/prompts.js`: All API endpoints except health.
- `server/db.js`: SQLite file setup, WAL mode, schema + indexes creation.

### Core Patterns

State management:
- No Redux/Zustand.
- App-level local state in `App.jsx` plus domain API/state in custom hook `usePrompts`.

Routing:
- Frontend: no client router; single-view SPA with modal overlays.
- Backend: Express routes under `/api` and wildcard `*` fallback to `server/public/index.html` in production.

Data fetching:
- Frontend uses native `fetch` (no Axios/React Query).
- API calls are centralized in `usePrompts` and all include `credentials: 'include'`.
- Search requests are debounced by 250ms in `App.jsx`.

Persistence:
- Synchronous SQLite access via `better-sqlite3`.
- Tags stored as JSON text inside one column, not in a join table.

### Entry Points and Key Files

Primary entry points:
- Client runtime entry: `client/src/main.jsx`
- Server runtime entry: `server/index.js`
- DB initialization entry: `server/db.js` (loaded by routes)

Critical files to understand first:
- `server/routes/prompts.js` (API contract)
- `server/db.js` (schema contract)
- `client/src/hooks/usePrompts.js` (frontend/backend integration)
- `client/src/App.jsx` (interaction and refresh logic)

## DATA FLOW

### How Data Moves Through the App

Read flow:
1. `App.jsx` computes query params from `search` and `activeTag`.
2. Debounced effect calls `fetchPrompts(queryParams)`.
3. `usePrompts.fetchPrompts` calls `GET /api/prompts?...` and updates local `prompts`.
4. `App.jsx` renders `PromptList` -> `PromptCard` items.

Tag flow:
1. On mount, `App.jsx` calls `fetchTags()`.
2. `usePrompts.fetchTags` calls `GET /api/tags`.
3. `TagFilter` renders chips and counts.

Create/update flow:
1. `PromptForm` collects title/content/tags/notes/favorite.
2. `App.handleSavePrompt` calls `createPrompt` or `updatePrompt`.
3. On success, app refetches tags and current prompt list.

Delete flow:
1. User confirms browser `window.confirm`.
2. `deletePrompt(id)` -> `DELETE /api/prompts/:id`.
3. On success, app refetches tags/list and closes viewer if needed.

Copy flow:
1. Browser writes text to clipboard via `navigator.clipboard.writeText`.
2. App calls `POST /api/prompts/:id/copy`.
3. Backend increments `useCount`, updates `lastUsed`/`updatedAt`.
4. App refreshes prompt list.

Favorite flow:
1. App calls `POST /api/prompts/:id/favorite`.
2. Backend toggles `favorite` 0/1 and updates `updatedAt`.
3. App refreshes list and tags.

### API Routes and Endpoints (All)

Mounted base:
- `server/index.js` mounts router at `/api`.

Endpoints:
1. `GET /api/health`
2. `GET /api/prompts`
3. `GET /api/prompts/:id`
4. `POST /api/prompts`
5. `PUT /api/prompts/:id`
6. `DELETE /api/prompts/:id`
7. `POST /api/prompts/:id/copy`
8. `POST /api/prompts/:id/favorite`
9. `GET /api/tags`

Query parameters:
- `GET /api/prompts`
- `search`: case-insensitive substring match against title/content/tags JSON text.
- `tag`: normalized to lowercase; SQL uses `tags LIKE %"tag"%`.
- `favorite=true`: returns only rows where `favorite = 1`.

Non-API server route:
- `GET *` in production serves SPA `index.html`.

### Request/Response Shapes

Canonical prompt object returned by API:
```json
{
  "id": 1,
  "title": "Prompt title",
  "content": "Prompt body",
  "tags": ["tag1", "tag2"],
  "notes": "Optional notes or null",
  "favorite": true,
  "useCount": 0,
  "lastUsed": "2026-02-04T07:35:30.522Z",
  "createdAt": "2026-02-04T07:35:30.522Z",
  "updatedAt": "2026-02-04T07:35:30.522Z"
}
```

1. `GET /api/health`
- Response `200`:
```json
{ "status": "ok" }
```

2. `GET /api/prompts`
- Response `200`: array of prompt objects.
- Sort order: `favorite DESC, updatedAt DESC`.

3. `GET /api/prompts/:id`
- Response `200`: prompt object.
- Response `404`:
```json
{ "error": "Prompt not found" }
```

4. `POST /api/prompts`
- Request body:
```json
{
  "title": "Required",
  "content": "Required",
  "tags": ["optional", "array"] ,
  "notes": "optional",
  "favorite": false
}
```
- Validation: `title` and `content` required, else `400`.
- Tags normalized to trimmed lowercase unique values.
- Response `201`: created prompt object.
- Response `400`:
```json
{ "error": "Title and content are required" }
```

5. `PUT /api/prompts/:id`
- Request body shape same as POST.
- Validation: same required fields.
- Response `200`: updated prompt object.
- Response `404`: prompt missing.

6. `DELETE /api/prompts/:id`
- Response `200`:
```json
{ "success": true }
```
- Response `404` if not found.

7. `POST /api/prompts/:id/copy`
- No request body.
- Side effects: increments `useCount`; sets `lastUsed` and `updatedAt` to now.
- Response `200`: updated prompt object.
- Response `404` if not found.

8. `POST /api/prompts/:id/favorite`
- No request body.
- Side effects: flips `favorite` (0<->1), updates `updatedAt`.
- Response `200`: updated prompt object.
- Response `404` if not found.

9. `GET /api/tags`
- Response `200`: array sorted by `count DESC`, then tag name.
```json
[
  { "tag": "coding", "count": 3 },
  { "tag": "review", "count": 2 }
]
```

### Database Schema

SQLite file location:
- `data/prompt-vault.db`

Pragmas:
- `journal_mode = WAL`

Tables:
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

Indexes:
```sql
CREATE INDEX idx_prompts_updatedAt ON prompts (updatedAt);
CREATE INDEX idx_prompts_favorite ON prompts (favorite);
```

Relations:
- None. Single-table design.
- Tags are denormalized JSON text, not relational.

Key field semantics:
- `favorite`: stored as integer `0/1`, exposed as boolean by API formatter.
- `tags`: serialized JSON string in DB, parsed to array on read.
- `createdAt`, `updatedAt`, `lastUsed`: ISO timestamp strings.

### Auth Flow

App-level auth:
- None in Express app (no login/session/JWT code).

Deployment auth model:
- Intended to run behind Authelia/Caddy at reverse-proxy level (documented in README/PLAN).
- Frontend sends `credentials: 'include'` on all API requests so proxy/session cookies are forwarded.

Implication:
- If proxy session expires or API is unreachable, frontend surfaces: `Session expired or API unreachable — refresh the page`.

### External Service Connections

Direct external dependencies in runtime:
- Google Fonts CSS and font files via `fonts.googleapis.com` and `fonts.gstatic.com` (in `client/index.html`).
- Browser Clipboard API (`navigator.clipboard`) for copy action.

Infrastructure dependencies (outside app process):
- Caddy reverse proxy.
- Authelia authentication gateway.

## CONVENTIONS

### File Naming Patterns

- React components: `PascalCase.jsx` in `client/src/components`.
- Hooks: `camelCase` prefixed with `use` (example: `usePrompts.js`).
- Server modules: lowercase (`index.js`, `db.js`, `routes/prompts.js`).

### Component Structure

- `App.jsx` handles page-level orchestration and modal visibility.
- Components are mostly presentational and callback-driven.
- Modals (`PromptForm`, `PromptViewer`) return `null` when closed.

### Import Organization

Observed style:
- React import first.
- Local hook/component imports next.
- CSS imports in entry (`main.jsx`).
- Relative imports with explicit `.js/.jsx` extension.

### Type/Interface Patterns

- No TypeScript.
- No formal runtime schema validation.
- Data contracts are implicit via endpoint handlers and component usage.
- Normalization functions in server route layer enforce minimal shape consistency (`normalizeTags`, `parseTags`, `formatPrompt`).

### Error Handling Approach

Backend:
- Explicit `400` for missing required fields.
- Explicit `404` when row not found.
- No global error middleware.
- No try/catch around DB operations (uncaught errors would bubble and could crash request handling).

Frontend:
- Hook catches network/API errors and maps fetch failures to a session/unreachable message.
- Mutations throw errors upward; `App.jsx` shows toast messages.
- Loading and error state are global to prompt list fetch flow.

### Testing Approach

- No automated tests (no Jest/Vitest/Cypress, no test scripts).
- Validation is currently manual via UI and curl health checks.

### Anti-Patterns to Avoid

- Do not introduce a second tags representation; keep server/client aligned on JSON-array-in-text convention unless doing a full migration.
- Do not add ad-hoc fetch calls from random components; extend `usePrompts` to keep API behavior centralized.
- Do not bypass existing normalization (`normalizeTags`) when writing server mutations.
- Do not assume app-level auth exists; protect deployment at reverse proxy if exposed.
- Do not treat `favorite` as string/boolean in DB; DB column is integer and formatting layer handles conversion.

## DEPENDENCIES

### Key Package Dependencies and Purpose

Server:
- `express`: HTTP API server and static file serving.
- `better-sqlite3`: synchronous SQLite client for CRUD operations.

Client:
- `react`, `react-dom`: UI rendering and state/effect model.
- `vite`, `@vitejs/plugin-react`: dev server/build pipeline.
- `tailwindcss`, `postcss`, `autoprefixer`: styling pipeline.

### External APIs and Services Used

- SQLite database file on local disk (`data/prompt-vault.db`).
- Google Fonts CDN (frontend typography).
- Browser Clipboard API.
- Optional but expected deployment services: Caddy + Authelia.

### Environment Variables (All Used by Code/Deploy)

1. `PORT`
- Used in `server/index.js`.
- Default: `3108` when unset.
- Controls Express listening port.

2. `NODE_ENV`
- Used in `server/index.js` and set in Dockerfile/compose.
- When `production`, server enables static file serving from `server/public` and wildcard SPA fallback.

No other env vars are read by application code.

## STABILITY MAP

### Battle-Tested / Stable Areas

- Basic CRUD endpoint coverage for prompts is straightforward and consistent.
- DB bootstrap creates schema/indexes automatically on startup.
- Core UI flows (list, search, tag filter, create/edit/delete, favorite, copy) are cohesive and small.
- Dockerized deployment path is simple and reproducible.

### Fragile or Known Break Points

- Search/tag filtering uses SQL `LIKE` against serialized JSON tags; this is not robust for scale or complex querying.
- No pagination/limit on `GET /api/prompts`; performance will degrade with large datasets.
- No migration system; schema evolution is manual and risky.
- No automated tests; regressions are easy to introduce silently.
- Frontend assumes Clipboard API availability and secure context.
- Error handling is mostly optimistic; DB/runtime exceptions are not uniformly handled.

### Technical Debt Worth Noting

- Tags should eventually be normalized into relational tables if advanced filtering/reporting is needed.
- API lacks input schema validation (zod/joi/etc.) and centralized error middleware.
- No observability/logging beyond startup console line.
- Data model and API are unversioned.
- Project planning docs mention `lucide-react` icons, but current implementation does not use that dependency.

### Areas That Should NOT Be Changed Without Full Context

- Tag storage format (`prompts.tags` JSON text) and its query assumptions.
- API path prefix `/api` and client Vite proxy (`/api -> localhost:3108`) coupling.
- Production static serving order in `server/index.js` (`/api` routes must remain mounted before wildcard `*`).
- Database file path and Docker volume mapping (`./data:/app/data`) to avoid data loss.
- WAL mode and DB file handling in `server/db.js`.

## DEVELOPMENT WORKFLOW

### Run Locally

Backend:
```bash
cd server
npm install
npm start
```

Frontend (separate terminal):
```bash
cd client
npm install
npm run dev
```

Notes:
- Vite runs on `http://localhost:5173`.
- Vite proxy forwards `/api` to `http://localhost:3108`.

### Build and Deploy

Client production build only:
```bash
cd client
npm install
npm run build
```

Docker deploy (recommended):
```bash
docker compose up -d --build
```

Container behavior:
- Exposes app on `127.0.0.1:3108` per `docker-compose.yml`.
- Runs server with `NODE_ENV=production`.
- Serves built frontend assets from `server/public`.

### Database Setup and Migration

Initial setup:
- No manual init required.
- On server startup, `server/db.js` creates `data/` directory (if missing), opens `data/prompt-vault.db`, enables WAL, and creates schema/indexes if absent.

Inspect schema/data:
```bash
sqlite3 data/prompt-vault.db ".schema"
sqlite3 data/prompt-vault.db "SELECT COUNT(*) FROM prompts;"
```

Migrations:
- No migration tool exists.
- Schema changes must be manual SQL (recommended: backup DB first).

### Testing Commands

Automated tests:
- None currently.

Manual smoke checks:
```bash
curl -s http://localhost:3108/api/health
curl -s "http://localhost:3108/api/prompts?search=test"
curl -s -X POST http://localhost:3108/api/prompts \
  -H "Content-Type: application/json" \
  -d '{"title":"Example","content":"Prompt body","tags":["demo"]}'
```

UI validation checklist:
- Create, edit, delete prompt.
- Tag creation/filtering works.
- Favorite toggle works.
- Copy updates `useCount` and `lastUsed`.
