"""
Article fetching and content extraction service
"""
import requests
from bs4 import BeautifulSoup
from newspaper import Article
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)


class ArticleFetcher:
    """Handles fetching and extracting article content"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.timeout = 10
    
    def fetch_with_newspaper(self, url: str) -> Optional[Dict[str, str]]:
        """
        Fetch article using newspaper3k library
        
        Args:
            url: Article URL
            
        Returns:
            Dictionary with title and text, or None if failed
        """
        try:
            article = Article(url)
            article.download()
            article.parse()
            
            if article.text and len(article.text) > 100:
                return {
                    'title': article.title or 'Untitled',
                    'text': article.text
                }
        except Exception as e:
            logger.warning(f"Newspaper3k failed for {url}: {str(e)}")
        
        return None
    
    def fetch_with_beautifulsoup(self, url: str) -> Optional[Dict[str, str]]:
        """
        Fallback: Fetch article using BeautifulSoup
        
        Args:
            url: Article URL
            
        Returns:
            Dictionary with title and text, or None if failed
        """
        try:
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Extract title
            title = 'Untitled'
            if soup.title:
                title = soup.title.string
            elif soup.find('h1'):
                title = soup.find('h1').get_text()
            
            # Remove script and style elements
            for script in soup(['script', 'style', 'nav', 'footer', 'header']):
                script.decompose()
            
            # Extract text from paragraphs
            paragraphs = soup.find_all('p')
            text = ' '.join([p.get_text() for p in paragraphs])
            
            if text and len(text) > 100:
                return {
                    'title': title.strip(),
                    'text': text.strip()
                }
        except Exception as e:
            logger.warning(f"BeautifulSoup failed for {url}: {str(e)}")
        
        return None
    
    def fetch_article(self, url: str) -> Dict[str, str]:
        """
        Fetch article content with fallback strategies
        
        Args:
            url: Article URL
            
        Returns:
            Dictionary with title and text
            
        Raises:
            ValueError: If article content cannot be extracted
        """
        # Try newspaper3k first
        result = self.fetch_with_newspaper(url)
        
        # Fallback to BeautifulSoup
        if not result:
            result = self.fetch_with_beautifulsoup(url)
        
        if not result:
            raise ValueError("Could not extract article content from the provided URL")
        
        logger.info(f"Successfully fetched article: {result['title']}")
        return result