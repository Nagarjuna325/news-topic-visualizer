import React, { useState, useEffect } from 'react';
import URLInput from './components/URLInput';
import WordCloud3D from './components/WordCloud3D';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeArticle, checkHealth } from './services/api';
import styles from './App.module.css';

function App() {
  const [state, setState] = useState({
    mode: 'input', // 'input', 'loading', 'visualize', 'error'
    data: null,
    error: null,
    backendStatus: 'checking',
  });

  useEffect(() => {
    checkHealth()
      .then(() => {
        setState(prev => ({ ...prev, backendStatus: 'online' }));
      })
      .catch(() => {
        setState(prev => ({ 
          ...prev, 
          backendStatus: 'offline',
          mode: 'error',
          error: 'Backend server is not reachable. Please make sure the backend is running on http://localhost:8000'
        }));
      });
  }, []);

  const handleAnalyze = async (url, method = 'tfidf') => {
    setState(prev => ({ ...prev, mode: 'loading', error: null }));

    try {
      const result = await analyzeArticle(url, method);
      
      if (result.success && result.words.length > 0) {
        setState({
          mode: 'visualize',
          data: result,
          error: null,
          backendStatus: 'online',
        });
      } else {
        throw new Error('No topics extracted from the article');
      }
    } catch (error) {
      setState({
        mode: 'error',
        data: null,
        error: error.message,
        backendStatus: 'online',
      });
    }
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, mode: 'input', data: null, error: null }));
  };

  const handleRetry = () => {
    setState(prev => ({ ...prev, mode: 'input', error: null }));
  };

  if (state.mode === 'loading') {
    return (
      <div className={styles.fullscreen}>
        <LoadingSpinner message="Analyzing article..." />
      </div>
    );
  }

  if (state.mode === 'visualize' && state.data) {
    return <WordCloud3D data={state.data} onBack={handleBack} />;
  }

  if (state.mode === 'error') {
    const shortError = (state.error || '').toLowerCase().includes('too short');
    const errorTitle = shortError ? 'Article Too Short' : 'Oops! Something went wrong';
    return (
      <div className={styles.fullscreen}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>{errorTitle}</h2>
          <p className={styles.errorMessage}>{state.error}</p>
          {shortError && (
            <p className={styles.errorHint}>Try a specific news article (not a homepage) with enough text content.</p>
          )}
          <button onClick={handleRetry} className={styles.retryButton}>
            Try Again
          </button>
          
          {state.backendStatus === 'offline' && (
            <div className={styles.helpText}>
              <p><strong>Backend not running?</strong></p>
              <p>Make sure you've started the backend server:</p>
              <code className={styles.code}>
                cd Backend && uvicorn app.main:app --reload
              </code>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullscreen}>
      {state.backendStatus === 'checking' && (
        <div className={styles.statusBadge}>Checking backend...</div>
      )}
      {state.backendStatus === 'online' && (
        <div className={`${styles.statusBadge} ${styles.statusOnline}`}>
          ✅ Backend online
        </div>
      )}
      <URLInput onAnalyze={handleAnalyze} isLoading={false} />
    </div>
  );
}

export default App;