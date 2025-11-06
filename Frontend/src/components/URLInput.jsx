import React, { useState } from 'react';

const SAMPLE_URLS = [
  'https://www.bbc.com/news/technology',
  'https://www.theguardian.com/technology',
  'https://techcrunch.com/',
  'https://www.wired.com/',
  'https://arstechnica.com/'
];

const URLInput = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateURL = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateURL(url)) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    onAnalyze(url);
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🌐 3D News Topic Visualizer</h1>
        <p style={styles.subtitle}>
          Enter a news article URL to visualize its topics in 3D
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="https://example.com/article"
              style={{
                ...styles.input,
                ...(error ? styles.inputError : {})
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}
        </form>

        <div style={styles.samplesSection}>
          <p style={styles.samplesTitle}>Or try a sample URL:</p>
          <div style={styles.samplesGrid}>
            {SAMPLE_URLS.map((sampleUrl, index) => (
              <button
                key={index}
                onClick={() => handleSampleClick(sampleUrl)}
                style={styles.sampleButton}
                disabled={isLoading}
                type="button"
              >
                {new URL(sampleUrl).hostname.replace('www.', '')}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.instructions}>
          <p style={styles.instructionsTitle}>💡 Tips:</p>
          <ul style={styles.instructionsList}>
            <li>Works best with news articles and blog posts</li>
            <li>The 3D word cloud is interactive - click and drag to rotate!</li>
            <li>Larger words indicate more important topics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '30px',
  },
  form: {
    marginBottom: '30px',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit',
  },
  inputError: {
    borderColor: '#f56565',
  },
  button: {
    padding: '14px 30px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    whiteSpace: 'nowrap',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  errorText: {
    color: '#f56565',
    fontSize: '14px',
    marginTop: '8px',
  },
  samplesSection: {
    marginBottom: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  samplesTitle: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '12px',
    fontWeight: '500',
  },
  samplesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
  },
  sampleButton: {
    padding: '10px 16px',
    fontSize: '13px',
    color: '#667eea',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  instructions: {
    background: '#f7fafc',
    padding: '20px',
    borderRadius: '10px',
  },
  instructionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '10px',
  },
  instructionsList: {
    fontSize: '13px',
    color: '#4a5568',
    paddingLeft: '20px',
    margin: 0,
  },
};

export default URLInput;