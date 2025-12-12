import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Text, Line, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Container, PlacedItem } from '@/types/packing';

interface ContainerVisualizationProps {
  container: Container;
  placedItems: PlacedItem[];
}

// Scale factor to convert mm to scene units
const SCALE = 0.001;

function ContainerBox({ container }: { container: Container }) {
  const { length, width, height } = container;
  const l = length * SCALE;
  const w = width * SCALE;
  const h = height * SCALE;

  // Create edges for the container wireframe
  const points = useMemo(() => {
    return [
      // Bottom face
      [0, 0, 0], [l, 0, 0],
      [l, 0, 0], [l, w, 0],
      [l, w, 0], [0, w, 0],
      [0, w, 0], [0, 0, 0],
      // Top face
      [0, 0, h], [l, 0, h],
      [l, 0, h], [l, w, h],
      [l, w, h], [0, w, h],
      [0, w, h], [0, 0, h],
      // Vertical edges
      [0, 0, 0], [0, 0, h],
      [l, 0, 0], [l, 0, h],
      [l, w, 0], [l, w, h],
      [0, w, 0], [0, w, h],
    ].map(p => new THREE.Vector3(p[0], p[1], p[2]));
  }, [l, w, h]);

  return (
    <group>
      {/* Container wireframe */}
      {Array.from({ length: 12 }, (_, i) => (
        <Line
          key={i}
          points={[points[i * 2], points[i * 2 + 1]]}
          color="#22D3EE"
          lineWidth={1.5}
          opacity={0.6}
          transparent
        />
      ))}
      
      {/* Floor grid */}
      <mesh position={[l / 2, w / 2, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[l, w, 10, 10]} />
        <meshBasicMaterial 
          color="#22D3EE" 
          wireframe 
          opacity={0.1} 
          transparent 
        />
      </mesh>

      {/* Axis labels */}
      <Text
        position={[l / 2, -0.3, 0]}
        fontSize={0.15}
        color="#22D3EE"
        anchorX="center"
      >
        Length ({container.length}mm)
      </Text>
      <Text
        position={[-0.3, w / 2, 0]}
        fontSize={0.15}
        color="#22D3EE"
        anchorX="center"
        rotation={[0, 0, Math.PI / 2]}
      >
        Width ({container.width}mm)
      </Text>
      <Text
        position={[-0.3, -0.1, h / 2]}
        fontSize={0.15}
        color="#22D3EE"
        anchorX="center"
        rotation={[0, 0, Math.PI / 2]}
      >
        Height ({container.height}mm)
      </Text>
    </group>
  );
}

function PackedItem({ item, index }: { item: PlacedItem; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { x, y, z, l, w, h, color } = item;
  
  const scaledX = x * SCALE;
  const scaledY = y * SCALE;
  const scaledZ = z * SCALE;
  const scaledL = l * SCALE;
  const scaledW = w * SCALE;
  const scaledH = h * SCALE;

  // Animation delay based on index
  const [opacity, setOpacity] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, index * 30);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <group position={[scaledX + scaledL / 2, scaledY + scaledW / 2, scaledZ + scaledH / 2]}>
      {/* Item box */}
      <mesh ref={meshRef}>
        <boxGeometry args={[scaledL * 0.98, scaledW * 0.98, scaledH * 0.98]} />
        <meshStandardMaterial 
          color={color} 
          opacity={opacity * 0.85}
          transparent
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      
      {/* Edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(scaledL * 0.98, scaledW * 0.98, scaledH * 0.98)]} />
        <lineBasicMaterial color="#000" opacity={0.3} transparent />
      </lineSegments>
    </group>
  );
}

function Scene({ container, placedItems }: ContainerVisualizationProps) {
  const l = container.length * SCALE;
  const w = container.width * SCALE;
  const h = container.height * SCALE;

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[l * 1.5, w * 1.5, h * 1.2]} 
        fov={50}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, 5]} intensity={0.3} />
      <pointLight position={[l / 2, w / 2, h * 2]} intensity={0.5} />

      <ContainerBox container={container} />
      
      {placedItems.map((item, index) => (
        <PackedItem key={`${item.itemId}-${index}`} item={item} index={index} />
      ))}

      <OrbitControls 
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
        target={[l / 2, w / 2, h / 3]}
      />
    </>
  );
}

export function ContainerVisualization({ container, placedItems }: ContainerVisualizationProps) {
  return (
    <div className="visualization-container w-full h-full min-h-[300px]">
      <Canvas>
        <Scene container={container} placedItems={placedItems} />
      </Canvas>
    </div>
  );
}
