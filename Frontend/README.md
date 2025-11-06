# News Topic Visualizer — Frontend (React + Vite + Three.js)

Renders a 3D word cloud based on keywords returned by the backend.

## Features
- Interactive 3D cloud (rotate, zoom, pan) with size/color mapped to relevance.
- Sample URLs, validation, and friendly error states.
- Static build served by Nginx in production.

## Local Development
```bash
cd Frontend
npm ci
# Point the app at your local backend
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev   # open the URL shown (e.g., http://localhost:5173)
```

## Build
```bash
npm run build   # outputs to dist/
npm run preview # optional local preview
```

## Configuration
- Vite reads `VITE_API_URL` at build time.
- Development: `.env.local`
- Production: `.env.production` (e.g., `VITE_API_URL=https://<backend>.up.railway.app`)

## Docker
- Multi-stage Dockerfile builds the app, then serves with Nginx.
- Nginx config template: `nginx.conf.template` (listens on `80` and `${PORT}` for platforms like Railway).

## Controls
- Rotate: click + drag
- Zoom: scroll
- Pan: right-click + drag

## Troubleshooting
- Frontend calling `localhost` in production: ensure `VITE_API_URL` is set in `.env.production` and rebuild.
- CORS preflight OK but POST fails: confirm the backend URL and that the endpoint is `POST /analyze`.
- Assets cached: hard refresh (Ctrl/Cmd+Shift+R) after each deploy.

