import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

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

export default Word3D;