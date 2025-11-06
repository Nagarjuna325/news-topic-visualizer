"""
FastAPI main application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import Dict

from app.models import URLRequest, AnalysisResponse, WordCloudItem, RootResponse
from app.services.article_fetcher import ArticleFetcher
from app.services.topic_analyzer import TopicAnalyzer
from app.utils.text_cleaner import TextCleaner

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="News Topic Analyzer API",
    description="Extract and analyze topics from news articles",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
article_fetcher = ArticleFetcher()
text_cleaner = TextCleaner()
topic_analyzer = TopicAnalyzer(max_features=100, n_topics=5)


@app.get("/")
async def root() -> dict:
    """Root endpoint"""
    return {
        "message": "News Topic Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analyze (POST)",
            "health": "/health (GET)"
        }
    }


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_article(request: URLRequest) -> AnalysisResponse:
    """
    Analyze article from URL and return word cloud data
    
    Args:
        request: URLRequest containing article URL
        
    Returns:
        AnalysisResponse with word cloud data
        
    Raises:
        HTTPException: If article cannot be fetched or analyzed
    """
    url = str(request.url)
    logger.info(f"Received analysis request for URL: {url}")
    
    try:
        # Step 1: Fetch article content
        logger.info("Fetching article content...")
        article_data = article_fetcher.fetch_article(url)
        title = article_data['title']
        text = article_data['text']
        
        logger.info(f"Fetched article: '{title}' ({len(text)} characters)")
        
        # Step 2: Clean and preprocess text
        logger.info("Preprocessing text...")
        tokens = text_cleaner.preprocess(text)
        
        if len(tokens) < 10:
            raise ValueError("Article content too short for meaningful analysis,need at least 10 meaningful words after cleaning. Please provide a longer article URL.")
        
        logger.info(f"Preprocessed {len(tokens)} tokens")
        
        # Step 3: Extract topics/keywords
        logger.info("Extracting topics...")
        words_data = topic_analyzer.analyze(tokens, method='tfidf')
        
        if not words_data:
            raise ValueError("Could not extract meaningful topics from article")
        
        # Convert to WordCloudItem objects
        word_cloud_items = [
            WordCloudItem(word=item['word'], weight=item['weight'])
            for item in words_data
        ]
        
        logger.info(f"Extracted {len(word_cloud_items)} keywords")
        
        # Step 4: Return response
        response = AnalysisResponse(
            success=True,
            url=url,
            title=title,
            words=word_cloud_items,
            total_words=len(word_cloud_items),
            message="Analysis completed successfully"
        )
        
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while analyzing the article: {str(e)}"
        )


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)