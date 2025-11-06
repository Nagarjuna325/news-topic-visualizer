import React from 'react';

const LoadingSpinner = ({ message = "Analyzing article..." }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}>
        <div style={styles.bounce1}></div>
        <div style={styles.bounce2}></div>
        <div style={styles.bounce3}></div>
      </div>
      <p style={styles.message}>{message}</p>
      <p style={styles.submessage}>This may take a few seconds...</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: 'white',
  },
  spinner: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  bounce1: {
    width: '18px',
    height: '18px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out both',
    animationDelay: '-0.32s',
  },
  bounce2: {
    width: '18px',
    height: '18px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out both',
    animationDelay: '-0.16s',
  },
  bounce3: {
    width: '18px',
    height: '18px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  message: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  submessage: {
    fontSize: '14px',
    opacity: 0.8,
  },
};

// Add keyframes for animation
const styleSheet = document.styleSheets[0];
const keyframes = `
  @keyframes bounce{
    0%, 80%, 100% { 
      transform: scale(0);
      opacity: 0.5;
    } 
    40% { 
      transform: scale(1.0);
      opacity: 1;
    }
  }
`;
try {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
} catch (e) {
  // Ignore if already exists
}

export default LoadingSpinner;