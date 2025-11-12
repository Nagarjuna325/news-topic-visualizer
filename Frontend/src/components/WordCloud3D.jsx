import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import styles from './WordCloud3D.module.css';
import WordCloudScene from './WordCloudScene';
import ParticleField from './ParticleField';
import Sidebar from './Sidebar';
import Legend from './Legend';

const WordCloud3D = ({ data, onBack }) => {
  const topWords = useMemo(() => {
    return [...(data?.words || [])]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 15);
  }, [data]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          &larr; Back
        </button>
        <div className={styles.info}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.stats}>
            {data.total_words} topics extracted - Hover over words to highlight
          </p>
        </div>
      </div>

      <Sidebar topWords={topWords} />

      <div className={styles.canvasContainer}>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60 }}
          className={styles.canvas}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <ParticleField />
          <WordCloudScene words={data.words} />

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={5}
            maxDistance={20}
            autoRotate={false}
          />
        </Canvas>
      </div>

      <Legend />

      <div className={styles.controls}>
        <p>Click and drag to rotate - Scroll to zoom - Right-click to pan</p>
      </div>
    </div>
  );
};

export default WordCloud3D;