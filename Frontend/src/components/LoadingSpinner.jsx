import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = "Analyzing article..." }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      <p className={styles.message}>{message}</p>
      <p className={styles.submessage}>This may take a few seconds...</p>
    </div>
  );
};

export default LoadingSpinner;