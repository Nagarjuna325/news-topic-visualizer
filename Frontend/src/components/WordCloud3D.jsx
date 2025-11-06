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
      {word}
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

  // Generate positions in a sphere
  const wordPositions = useMemo(() => {
    const positions = [];
    const radius = 5;

    words.forEach((wordData, index) => {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(-1 + (2 * index) / words.length);
      const theta = Math.sqrt(words.length * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Color based on weight (gradient from blue to red)
      const hue = 200 + (wordData.weight * 160); // 200 (blue) to 360 (red)
      const color = `hsl(${hue}, 80%, 60%)`;

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