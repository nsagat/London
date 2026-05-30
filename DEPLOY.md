# Deploying London

London is a **stateful, long-running Node service**: it spawns the Bright Data
MCP server as a child process and keeps an in-memory cache + usage meter on
`globalThis`. So it must run on a **persistent container/VM — not serverless.**

- ✅ Railway, Render, Fly.io, or any VM (one always-on Node process)
- ❌ Vercel / Netlify / Cloudflare Workers — serverless functions can't keep the
  spawned MCP child or in-memory state alive between requests

Run **one instance** (the cache/meter are per-process). Deploy the whole Next app
— the HTTP API (`/api/*`) and the UI ship together in one service.

> The MCP **stdio** server (`npm run mcp`) is a *local* tool for connecting an
> editor (Claude/Cursor/VS Code). It is not part of the web deploy.

---

## Deploy to Railway (recommended)

### Option A — Railway CLI (fastest, no GitHub needed)

```bash
npm i -g @railway/cli
railway login
railway init                 # create a new project
railway up                   # build + deploy this directory
```

Then set the Bright Data key and (re)deploy:

```bash
railway variables --set BRIGHT_DATA_API_KEY=<your-token>
railway up
```

Generate a public URL: Railway dashboard → your service → **Settings → Networking
→ Generate Domain**.

### Option B — Deploy from GitHub

1. Push this repo to GitHub.
2. [railway.com](https://railway.com) → **New Project → Deploy from GitHub repo**.
3. Railway reads [`railway.json`](./railway.json) and runs `npm run build` then
   `npm run start` (Nixpacks auto-installs Node + deps).
4. **Variables** tab → add `BRIGHT_DATA_API_KEY`.
5. **Settings → Networking → Generate Domain.**

### Environment variables

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `BRIGHT_DATA_API_KEY` | **yes** (for live data) | Without it the API runs in demo mode. |
| `AIMLAPI_API_KEY` | no | Optional AI extraction/brief layer (heuristics otherwise). |
| `PORT` | auto | Railway sets it; `next start` binds it automatically. |

`@brightdata/mcp` is a project dependency, so the MCP server is pre-installed in
the container (no slow first-call download).

---

## Verify the deployment

```bash
BASE=https://<your-app>.up.railway.app

curl -s $BASE/api/health | jq          # { status: "ok", brightData: "live" }
curl -s $BASE/api/tools  | jq          # the GTM tool catalog + usage
curl -s $BASE/api/tools/find_account_signals \
  -H 'content-type: application/json' \
  -d '{"vertical":"AI security startups","signals":["funding"],"limit":5}' | jq
curl -s $BASE/api/usage  | jq          # pay-as-you-go meter
```

The first live call after a fresh deploy cold-starts the Bright Data MCP server
(~5–10s); subsequent calls are fast (warm connection + cache). The boot-time
warmup primes the default demo query in the background.

---

## Notes & limits (MVP)

- **Single instance.** The cache and usage meter live in memory; don't scale to
  multiple replicas without an external store (Redis) — out of scope for the MVP.
- **Resources.** A small Railway instance (512 MB–1 GB) is enough; Bright Data
  does the heavy scraping remotely, so London stays light.
- **Cost.** Bright Data calls draw from your Bright Data credits; the in-app
  `/api/usage` meter is a mock pay-as-you-go layer, not real billing.
