import React from 'react';
import styles from './WordCloud3D.module.css';

const Legend = () => (
  <div className={styles.legend}>
    <div className={styles.legendItem}>
      <div className={`${styles.legendColor} ${styles.legendLow}`} />
      <span>Lower relevance</span>
    </div>
    <div className={styles.legendItem}>
      <div className={`${styles.legendColor} ${styles.legendMedium}`} />
      <span>Medium relevance</span>
    </div>
    <div className={styles.legendItem}>
      <div className={`${styles.legendColor} ${styles.legendHigh}`} />
      <span>Higher relevance</span>
    </div>
  </div>
);

export default Legend;