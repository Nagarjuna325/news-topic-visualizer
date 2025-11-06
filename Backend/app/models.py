"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict


class URLRequest(BaseModel):
    """Request model for article URL"""
    url: HttpUrl
    method: Optional[str] = None  # 'tfidf' (default) or 'lda'
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://www.bbc.com/news/technology",
                "method": "tfidf"
            }
        }


class WordCloudItem(BaseModel):
    """Single word in the word cloud"""
    word: str
    weight: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "word": "technology",
                "weight": 0.85
            }
        }


class AnalysisResponse(BaseModel):
    """Response model for analysis results"""
    success: bool
    url: str
    title: Optional[str] = None
    words: List[WordCloudItem]
    total_words: int
    message: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "url": "https://example.com/article",
                "title": "Sample Article",
                "words": [
                    {"word": "technology", "weight": 0.85},
                    {"word": "innovation", "weight": 0.72}
                ],
                "total_words": 2,
                "message": "Analysis completed successfully"
            }
        }

class RootResponse(BaseModel):
    """Response model for the API root."""
    message: str
    version: str
    endpoints: Dict[str, str]
