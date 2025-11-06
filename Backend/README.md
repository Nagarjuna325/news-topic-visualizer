# News Topic Visualizer — Backend (FastAPI)

Extracts article text from a URL, cleans and tokenizes it, scores keywords, and returns normalized weights for visualization.

## How It Works
- Fetch: Newspaper3k (primary), fallback to `requests` + BeautifulSoup.
- Clean: lowercase; strip URLs/emails/non‑letters; NLTK tokenize; remove stopwords and very short tokens.
- Score: TF‑IDF over unigrams + bigrams (capped features), weights normalized to [0–1].
- Optional: LDA (implemented; TF‑IDF is default).

## Run Locally
```bash
cd Backend
python -m venv .venv && source .venv/bin/activate   # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI: http://localhost:8000/docs

## Endpoints
- `GET /health` → `{"status":"healthy"}`
 - `POST /analyze`
   - Body: `{"url": "<article_url>", "method": "tfidf" | "lda"}` (optional `method`, default `tfidf`)
  - Returns: `{ success, url, title, words: [{word, weight}], total_words, message }`
  - Notes: Use actual article pages (not homepages). Short/JS‑heavy pages may be rejected.

## Modeling Details
- TF‑IDF: `TfidfVectorizer(max_features, ngram_range=(1, 2), min_df=1)`; weights normalized by max.
- LDA: simple topic model (count-like TF via `use_idf=False`), normalized weights.
- Thresholds (can be tuned):
  - Minimum content length in `services/article_fetcher.py`.
  - Minimum tokens in `app/main.py`.
  - Token length cutoff in `utils/text_cleaner.py`.

## Docker
- `Backend/Dockerfile` installs deps, downloads NLTK data, exposes `8000`, binds to `${PORT}` with default 8000 locally.
- Use platform healthcheck path `/health`.

## Railway
- Service settings: Root Directory `Backend`, Dockerfile `Dockerfile`, Healthcheck Path `/health`.

## Troubleshooting
- “Article too short”: try a longer form article or relax thresholds.
- Newspaper3k fails: fallback to BeautifulSoup runs automatically, but JS‑heavy sites may still be sparse.
