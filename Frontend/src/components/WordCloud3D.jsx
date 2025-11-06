import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Individual Word Component
const Word3D = ({ word, weight, position, color }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Subtle rotation
      meshRef.current.rotation.y += 0.002;
      
      // Scale on hover
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  // Calculate font size based on weight (0.3 to 1.2)
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

// Main Word Cloud Scene
const WordCloudScene = ({ words }) => {
  const groupRef = useRef();

  // Auto-rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Map weight to discrete relevance buckets (low/medium/high)
  const weightToColor = (w) => {
    if (w >= 0.66) return 'hsl(360, 80%, 60%)'; // high - red
    if (w >= 0.33) return 'hsl(280, 80%, 60%)'; // medium - purple
    return 'hsl(200, 80%, 60%)'; // low - blue
  };

  // Generate positions in a sphere
  const wordPositions = useMemo(() => {
    const positions = [];
    const minR = 2.5; // heavier words closer to center
    const maxR = 6;

    words.forEach((wordData, index) => {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(-1 + (2 * index) / words.length);
      const theta = Math.sqrt(words.length * Math.PI) * phi;

      const clampedW = Math.min(Math.max(wordData.weight, 0), 1);
      const r = minR + (maxR - minR) * (1 - clampedW);
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      // Discrete color buckets by weight
      const color = weightToColor(wordData.weight);

      positions.push({
        ...wordData,
        position: [x, y, z],
        color: color,
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

// Particle Background
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

// Main Component
const WordCloud3D = ({ data, onBack }) => {
  const topWords = useMemo(() => {
    return [...(data?.words || [])]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 15);
  }, [data]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <div style={styles.info}>
          <h2 style={styles.title}>{data.title}</h2>
          <p style={styles.stats}>
            {data.total_words} topics extracted • Hover over words to highlight
          </p>
        </div>
      </div>

      {/* Right side panel with top words */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>Top Keywords</div>
        <div style={styles.sidebarList}>
          {topWords.map((w, i) => (
            <div key={`${w.word}-${i}`} style={styles.sidebarItem}>
              <div style={styles.sidebarWordRow}>
                <span style={styles.sidebarIndex}>{i + 1}</span>
                <span style={styles.sidebarWord}>{w.word}</span>
                <span style={styles.sidebarWeight}>{w.weight.toFixed(2)}</span>
              </div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressBar, width: `${Math.round(w.weight * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.canvasContainer}>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60 }}
          style={{ background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Particle background */}
          <ParticleField />

          {/* Word Cloud */}
          <WordCloudScene words={data.words} />

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={5}
            maxDistance={20}
            autoRotate={false}
          />
        </Canvas>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: 'hsl(200, 80%, 60%)'}} />
          <span>Lower relevance</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: 'hsl(280, 80%, 60%)'}} />
          <span>Medium relevance</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: 'hsl(360, 80%, 60%)'}} />
          <span>Higher relevance</span>
        </div>
      </div>

      <div style={styles.controls}>
        <p>🖱️ Click and drag to rotate • Scroll to zoom • Right-click to pan</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    padding: '20px 40px',
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    zIndex: 10,
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
    background: 'white',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 5px 0',
  },
  stats: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  legend: {
    position: 'absolute',
    bottom: '80px',
    left: '40px',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '15px 20px',
    borderRadius: '10px',
    display: 'flex',
    gap: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: '110px',
    right: '40px',
    width: '280px',
    maxHeight: '60vh',
    overflowY: 'auto',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    padding: '16px',
    zIndex: 11,
  },
  sidebarHeader: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: '10px',
  },
  sidebarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sidebarItem: {
    background: 'rgba(0,0,0,0.03)',
    borderRadius: '8px',
    padding: '10px',
  },
  sidebarWordRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '6px',
  },
  sidebarIndex: {
    fontSize: '12px',
    color: '#718096',
    width: '20px',
    textAlign: 'right',
  },
  sidebarWord: {
    flex: 1,
    fontSize: '14px',
    color: '#2d3748',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '0 6px',
  },
  sidebarWeight: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#4a5568',
    width: '40px',
    textAlign: 'right',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    borderRadius: '4px',
    background: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#2d3748',
  },
  legendColor: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
  },
  controls: {
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: '14px',
    color: '#4a5568',
    zIndex: 10,
  },
};

export default WordCloud3D;
