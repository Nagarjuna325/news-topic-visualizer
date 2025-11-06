"""
Topic modeling and keyword extraction service
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class TopicAnalyzer:
    """Handles topic modeling and keyword extraction"""
    
    def __init__(self, max_features: int = 100, n_topics: int = 5):
        self.max_features = max_features
        self.n_topics = n_topics
    
    def extract_keywords_tfidf(self, tokens: List[str], top_n: int = 30) -> List[Dict[str, float]]:
        """
        Extract keywords using TF-IDF
        
        Args:
            tokens: List of preprocessed tokens
            top_n: Number of top keywords to return
            
        Returns:
            List of dictionaries with word and weight
        """
        # Join tokens back into a document
        document = ' '.join(tokens)
        
        # Initialize TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            ngram_range=(1, 2),  # Include unigrams and bigrams
            min_df=1
        )
        
        try:
            # Fit and transform
            tfidf_matrix = vectorizer.fit_transform([document])
            feature_names = vectorizer.get_feature_names_out()
            
            # Get scores
            scores = tfidf_matrix.toarray()[0]
            
            # Create word-score pairs
            word_scores = list(zip(feature_names, scores))
            
            # Sort by score and get top N
            word_scores.sort(key=lambda x: x[1], reverse=True)
            top_words = word_scores[:top_n]
            
            # Normalize weights to 0-1 range
            if top_words:
                max_weight = top_words[0][1]
                if max_weight > 0:
                    normalized_words = [
                        {'word': word, 'weight': round(float(score / max_weight), 3)}
                        for word, score in top_words
                    ]
                    return normalized_words
            
        except Exception as e:
            logger.error(f"TF-IDF extraction failed: {str(e)}")
        
        return []
    
    def extract_topics_lda(self, tokens: List[str], top_n_words: int = 30) -> List[Dict[str, float]]:
        """
        Extract topics using Latent Dirichlet Allocation
        
        Args:
            tokens: List of preprocessed tokens
            top_n_words: Number of top words to return
            
        Returns:
            List of dictionaries with word and weight
        """
        # Join tokens back into a document
        document = ' '.join(tokens)
        
        # Initialize vectorizer for LDA (uses count vectorizer)
        vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            min_df=1,
            use_idf=False,  # Use term frequency for LDA
            norm=None
        )
        
        try:
            # Fit and transform
            doc_term_matrix = vectorizer.fit_transform([document])
            feature_names = vectorizer.get_feature_names_out()
            
            # Initialize and fit LDA
            lda = LatentDirichletAllocation(
                n_components=min(self.n_topics, len(feature_names)),
                random_state=42,
                max_iter=10
            )
            lda.fit(doc_term_matrix)
            
            # Get all topic words with weights
            all_topic_words = {}
            for topic_idx, topic in enumerate(lda.components_):
                top_indices = topic.argsort()[-top_n_words:][::-1]
                for idx in top_indices:
                    word = feature_names[idx]
                    weight = float(topic[idx])
                    # Accumulate weights if word appears in multiple topics
                    if word in all_topic_words:
                        all_topic_words[word] = max(all_topic_words[word], weight)
                    else:
                        all_topic_words[word] = weight
            
            # Sort by weight and get top N
            sorted_words = sorted(all_topic_words.items(), key=lambda x: x[1], reverse=True)
            top_words = sorted_words[:top_n_words]
            
            # Normalize weights
            if top_words:
                max_weight = top_words[0][1]
                if max_weight > 0:
                    normalized_words = [
                        {'word': word, 'weight': round(float(score / max_weight), 3)}
                        for word, score in top_words
                    ]
                    return normalized_words
            
        except Exception as e:
            logger.error(f"LDA topic extraction failed: {str(e)}")
        
        return []
    
    def analyze(self, tokens: List[str], method: str = 'tfidf') -> List[Dict[str, float]]:
        """
        Analyze text and extract important words
        
        Args:
            tokens: List of preprocessed tokens
            method: Analysis method ('tfidf' or 'lda')
            
        Returns:
            List of dictionaries with word and weight
        """
        if not tokens or len(tokens) < 5:
            logger.warning("Insufficient tokens for analysis")
            return []
        
        logger.info(f"Analyzing {len(tokens)} tokens using {method}")
        
        if method == 'lda':
            result = self.extract_topics_lda(tokens)
        else:
            result = self.extract_keywords_tfidf(tokens)
        
        # Fallback if primary method fails
        if not result and method == 'lda':
            logger.info("LDA failed, falling back to TF-IDF")
            result = self.extract_keywords_tfidf(tokens)
        
        return result