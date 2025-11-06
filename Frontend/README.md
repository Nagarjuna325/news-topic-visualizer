Title: Frontend (React + Vite + Three.js)
Overview
Single‑page app that calls the backend to analyze a URL and renders a 3D word cloud (size/color reflect relevance).
Run Locally
npm ci
Create ./.env.local with VITE_API_URL=http://localhost (line 8000)
npm run dev → open the shown URL (typically http://localhost:5173)
Build/Serve
npm run build → outputs dist/
Production image uses Nginx. The config template (nginx.conf.template) listens on 80 and ${PORT}.
Configuration (Vite)
At build time, API base is read from VITE_API_URL:
Local: .env.local
Production: .env.production (e.g., VITE_API_URL=https://<backend>.up.railway.app)
UI Controls
Rotate (drag), zoom (scroll), pan (right‑click).
Colors show relevance from low (blue) → high (red). Font size scales with weight.
Common Issues
API calls hitting localhost in production: ensure a production env file or build arg sets VITE_API_URL and rebuild.
CORS: backend allows all origins; not expected to be an issue.
Docker
Multi‑stage Dockerfile builds the app and serves via Nginx.
Railway
Service settings: Root Directory Frontend, Dockerfile Dockerfile.
Provide VITE_API_URL via .env.production file committed to the repo, or via build args/config‑as‑code.
Networking: target port 80.