Title: News Topic Visualizer
Description: Extracts a news article’s text, analyzes keywords, and renders a 3D word cloud.
Stack
Backend: FastAPI, Newspaper3k, BeautifulSoup, NLTK, scikit‑learn (TF‑IDF), optional LDA
Frontend: React + Vite, Three.js via react‑three‑fiber/drei, Nginx for static serving
Docker: Multi-stage Dockerfiles; optional docker-compose.yml for local dev
How It Works
Fetch: Try Newspaper3k → fallback to requests + BeautifulSoup to grab paragraphs and title.
Clean: Lowercase, strip URLs/emails/non‑letters; tokenize with NLTK; remove stopwords and very short tokens.
Score: TF‑IDF with unigrams/bigrams, capped features. Scores are normalized to [0–1]. LDA is available but off by default.
Visualize: The frontend positions words in a 3D sphere; color and size scale with weight.
Repository Structure
Backend/ FastAPI service with article extraction + analysis code
Frontend/ React/Vite app serving the 3D visualization
docker-compose.yml Optional for local dev (frontend + backend)
Quick Start (Docker Compose)
docker-compose up --build
App: http://localhost:3000
API: http://localhost:8000
Quick Start (Without Docker)
Backend
cd Backend
python -m venv .venv && source .venv/bin/activate (Windows: .\.venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
Frontend
cd Frontend
npm ci
Create Frontend/.env.local with VITE_API_URL=http://localhost (line 8000)
npm run dev → open http://localhost:5173 (or as shown)
API
GET /health → {"status":"healthy"}
POST /analyze
Body: {"url": "https://example.com/some-article"}
Returns: { success, url, title, words: [{word, weight}], total_words, message }
Note: Endpoint expects a real article page (not a homepage). Short/JS‑heavy pages may be rejected.
Deployment (Railway)
You deploy TWO services from the SAME repo:
Backend service
Root Directory: Backend
Dockerfile Path: Dockerfile
Healthcheck Path: /health
The container binds to ${PORT} automatically (CMD uses ${PORT:-8000})
Frontend service
Root Directory: Frontend
Dockerfile Path: Dockerfile
Set the backend URL for builds
Easiest: Frontend/.env.production with VITE_API_URL=https://<backend>.up.railway.app
Networking: target port 80
Troubleshooting
Frontend calls localhost: ensure VITE_API_URL is set for the build (env file or build arg), then rebuild.
“Article too short”: try a long‑form article URL; you can relax thresholds in Backend/app.
Build fails on Railway: ensure each service uses the correct Root Directory + Dockerfile Path pairing.