import React from 'react';
import styles from './WordCloud3D.module.css';

const Sidebar = ({ topWords }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Top Keywords</div>
      <div className={styles.sidebarList}>
        {topWords.map((w, i) => {
          const pct = Math.max(0, Math.min(100, Math.round(w.weight * 100)));
          const bucket = Math.round(pct / 5) * 5;
          return (
            <div key={`${w.word}-${i}`} className={styles.sidebarItem}>
              <div className={styles.sidebarWordRow}>
                <span className={styles.sidebarIndex}>{i + 1}</span>
                <span className={styles.sidebarWord}>{w.word}</span>
                <span className={styles.sidebarWeight}>{w.weight.toFixed(2)}</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={`${styles.progressBar} ${styles['w' + bucket]}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;