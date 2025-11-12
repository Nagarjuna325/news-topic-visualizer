import React, { useState } from 'react';
import styles from './URLInput.module.css';

const SAMPLE_URLS = [
  'https://www.bbc.com',
  'https://www.cnn.com/',
  'https://www.nytimes.com',
  'https://www.wired.com',
  'https://arstechnica.com'
];

const URLInput = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('tfidf');
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

    onAnalyze(url, method);
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    setError('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>3D News Topic Visualizer</h1>
        <p className={styles.subtitle}>
          Enter a news article URL to visualize its topics in 3D
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.methodRow}>
            <label className={styles.methodLabel}>Method:</label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="method"
                value="tfidf"
                checked={method === 'tfidf'}
                onChange={() => setMethod('tfidf')}
                disabled={isLoading}
              />
              TF-IDF
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="method"
                value="lda"
                checked={method === 'lda'}
                onChange={() => setMethod('lda')}
                disabled={isLoading}
              />
              LDA
            </label>
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="https://example.com/article"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}
        </form>

        <div className={styles.samplesSection}>
          <p className={styles.samplesTitle}>Or try a sample URL:</p>
          <div className={styles.samplesGrid}>
            {SAMPLE_URLS.map((sampleUrl, index) => (
              <button
                key={index}
                onClick={() => handleSampleClick(sampleUrl)}
                className={styles.sampleButton}
                disabled={isLoading}
                type="button"
              >
                {new URL(sampleUrl).hostname.replace('www.', '')}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.instructions}>
          <p className={styles.instructionsTitle}>Tips:</p>
          <ul className={styles.instructionsList}>
            <li>Works best with news articles and blog posts</li>
            <li>The 3D word cloud is interactive - click and drag to rotate!</li>
            <li>Larger words indicate more important topics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default URLInput;