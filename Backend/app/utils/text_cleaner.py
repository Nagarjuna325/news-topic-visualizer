"""
Text cleaning and preprocessing utilities
"""
import re
from typing import List
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)


class TextCleaner:
    """Handles text cleaning and preprocessing"""
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        # Add common words to filter out
        self.stop_words.update([
            'said', 'also', 'would', 'could', 'may', 'might',
            'one', 'two', 'new', 'first', 'last', 'made',
            'like', 'get', 'got', 'take', 'took', 'make',
            'come', 'came', 'go', 'went', 'know', 'think',
            'see', 'saw', 'want', 'use', 'find', 'give',
            'tell', 'ask', 'work', 'seem', 'feel', 'try',
            'leave', 'call', 'mr', 'ms', 'mrs', 'dr'
        ])
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text
        
        Args:
            text: Raw text string
            
        Returns:
            Cleaned text string
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters and digits, keep only letters and spaces
        text = re.sub(r'[^a-z\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize_and_filter(self, text: str) -> List[str]:
        """
        Tokenize text and remove stopwords
        
        Args:
            text: Cleaned text string
            
        Returns:
            List of filtered tokens
        """
        # Tokenize
        tokens = word_tokenize(text)
        
        # Filter stopwords and short words
        filtered_tokens = [
            word for word in tokens 
            if word not in self.stop_words 
            and len(word) > 3  # Remove very short words
        ]
        
        return filtered_tokens
    
    def preprocess(self, text: str) -> List[str]:
        """
        Complete preprocessing pipeline
        
        Args:
            text: Raw text string
            
        Returns:
            List of preprocessed tokens
        """
        cleaned_text = self.clean_text(text)
        tokens = self.tokenize_and_filter(cleaned_text)
        return tokens