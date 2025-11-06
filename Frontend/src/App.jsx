import React, { useState, useEffect } from 'react';
import URLInput from './components/URLInput';
import WordCloud3D from './components/WordCloud3D';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeArticle, checkHealth } from './services/api';

function App() {
  const [state, setState] = useState({
    mode: 'input', // 'input', 'loading', 'visualize', 'error'
    data: null,
    error: null,
    backendStatus: 'checking',
  });

  // Check backend health on mount
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

  const handleAnalyze = async (url) => {
    setState(prev => ({ ...prev, mode: 'loading', error: null }));

    try {
      const result = await analyzeArticle(url);
      
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

  // Render based on current mode
  if (state.mode === 'loading') {
    return (
      <div style={styles.fullscreen}>
        <LoadingSpinner message="Analyzing article..." />
      </div>
    );
  }

  if (state.mode === 'visualize' && state.data) {
    return <WordCloud3D data={state.data} onBack={handleBack} />;
  }

  if (state.mode === 'error') {
    return (
      <div style={styles.fullscreen}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️Try a specific news article (not a homepage) with enough text content.</div>
          <h2 style={styles.errorTitle}></h2>
          <p style={styles.errorMessage}>{state.error}</p>
          <button onClick={handleRetry} style={styles.retryButton}>
            Try Again
          </button>
          
          {state.backendStatus === 'offline' && (
            <div style={styles.helpText}>
              <p><strong>Backend not running?</strong></p>
              <p>Make sure you've started the backend server:</p>
              <code style={styles.code}>
                cd Backend && uvicorn app.main:app --reload
              </code>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: Input mode
  return (
    <div style={styles.fullscreen}>
      {state.backendStatus === 'checking' && (
        <div style={styles.statusBadge}>Checking backend...</div>
      )}
      {state.backendStatus === 'online' && (
        <div style={{...styles.statusBadge, ...styles.statusOnline}}>
          ✓ Backend online
        </div>
      )}
      <URLInput onAnalyze={handleAnalyze} isLoading={false} />
    </div>
  );
}

const styles = {
  fullscreen: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
  },
  errorContainer: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '500px',
    margin: '0 auto',
    marginTop: '10vh',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '15px',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  retryButton: {
    padding: '14px 30px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  helpText: {
    marginTop: '30px',
    padding: '20px',
    background: '#f7fafc',
    borderRadius: '10px',
    textAlign: 'left',
    fontSize: '14px',
    color: '#4a5568',
  },
  code: {
    display: 'block',
    marginTop: '10px',
    padding: '10px',
    background: '#2d3748',
    color: '#fff',
    borderRadius: '5px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  statusBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#718096',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  statusOnline: {
    color: '#48bb78',
  },
};

export default App;