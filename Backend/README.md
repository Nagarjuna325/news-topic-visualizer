Title: Backend (FastAPI)
Overview
Extracts text from a URL and returns scored keywords for visualization.
Techniques:
Fetch: Newspaper3k, fallback to requests + BeautifulSoup
Clean: NLTK stopwords + tokenization; drop short tokens
Score: TF‑IDF (unigrams/bigrams, max_features) normalized to [0–1]
Optional: LDA (off by default)
Run Locally
python -m venv .venv && source .venv/bin/activate (Windows: .\.venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Swagger: http://localhost:8000/docs
Environment/Ports
Docker CMD binds to ${PORT} with a default of 8000 for local runs.
Endpoints
GET / Basic info
GET /health Healthcheck JSON
POST /analyze Body: {"url":"<article_url>"} Returns {words:[{word, weight}], ...}
Thresholds to Adjust (if needed)
Minimum tokens in app/main.py (default requires 10 meaningful tokens).
Minimum raw text length in services/article_fetcher.py (defaults ~100 chars for each path).
Token length filter in utils/text_cleaner.py (defaults to >3).
Modeling Details
TF‑IDF uses TfidfVectorizer(max_features, ngram_range=(1,2), min_df=1).
Scores normalized by max value → weights in [0–1].
LDA builds a simple topic model and similarly normalizes top words.
Docker
Backend/Dockerfile installs deps, downloads NLTK data, exposes 8000, binds to ${PORT}.
Railway
Service settings: Root Directory Backend, Dockerfile Dockerfile, Healthcheck Path /health.
Tests/Notes
Add tests or fixtures as needed (none included by default).