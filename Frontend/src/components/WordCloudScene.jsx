import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import Word3D from './Word3D';

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

export default WordCloudScene;