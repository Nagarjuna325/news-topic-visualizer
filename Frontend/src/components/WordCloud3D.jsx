import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import styles from './WordCloud3D.module.css';

const Word3D = ({ word, weight, position, color }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      meshRef.current.rotation.y += 0.002;
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const fontSize = 0.3 + (weight * 0.9);

  return (
    <Text
      ref={meshRef}
      position={position}
      fontSize={fontSize}
      color={hovered ? '#ffeb3b' : color}
      anchorX="center"
      anchorY="middle"
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      outlineWidth={0.02}
      outlineColor="#000000"
    >
      {hovered ? `${word} (${weight.toFixed(2)})` : word}
    </Text>
  );
};

const WordCloudScene = ({ words }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const weightToColor = (w) => {
    if (w >= 0.66) return 'hsl(360, 80%, 60%)';
    if (w >= 0.33) return 'hsl(280, 80%, 60%)';
    return 'hsl(200, 80%, 60%)';
  };

  const wordPositions = useMemo(() => {
    const positions = [];
    const minR = 2.5;
    const maxR = 6;

    words.forEach((wordData, index) => {
      const phi = Math.acos(-1 + (2 * index) / words.length);
      const theta = Math.sqrt(words.length * Math.PI) * phi;

      const clampedW = Math.min(Math.max(wordData.weight, 0), 1);
      const r = minR + (maxR - minR) * (1 - clampedW);
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      const color = weightToColor(wordData.weight);

      positions.push({
        ...wordData,
        position: [x, y, z],
        color,
      });
    });

    return positions;
  }, [words]);

  return (
    <group ref={groupRef}>
      {wordPositions.map((wordData, index) => (
        <Word3D
          key={`${wordData.word}-${index}`}
          word={wordData.word}
          weight={wordData.weight}
          position={wordData.position}
          color={wordData.color}
        />
      ))}
    </group>
  );
};

const ParticleField = () => {
  const particlesRef = useRef();
  const particleCount = 1000;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

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

      <div className={styles.controls}>
        <p>Click and drag to rotate - Scroll to zoom - Right-click to pan</p>
      </div>
    </div>
  );
};

export default WordCloud3D;