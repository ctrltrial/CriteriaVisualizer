import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

interface Point {
  x: number;
  y: number;
}

interface ScatterPlotProps {
  points?: Point[];
  pointSize?: number;
  pointColor?: string;
  padding?: number;
}

function Points({
  pointSize = 0.05,
  pointColor = "blue",
  points = [],
  padding = 0.1,
}: ScatterPlotProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();

  // Calculate bounds with padding
  const { bounds, aspect } = useMemo(() => {
    if (!points.length) return { bounds: null, aspect: 1 };

    // Calculate min/max in single pass
    const { minX, maxX, minY, maxY } = points.reduce(
      (acc, { x, y }) => ({
        minX: Math.min(acc.minX, x),
        maxX: Math.max(acc.maxX, x),
        minY: Math.min(acc.minY, y),
        maxY: Math.max(acc.maxY, y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    // Apply padding
    const xPad = (maxX - minX) * padding;
    const yPad = (maxY - minY) * padding;

    return {
      bounds: {
        minX: minX - xPad,
        maxX: maxX + xPad,
        minY: minY - yPad,
        maxY: maxY + yPad,
      },
      aspect: (maxX - minX) / (maxY - minY),
    };
  }, [points, padding]);

  // Camera setup
  useEffect(() => {
    if (!bounds || !(camera instanceof THREE.OrthographicCamera)) return;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight - 56; // Adjust for navbar

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const viewAspect = viewWidth / viewHeight;

    // Calculate zoom based on dominant axis
    const zoom = viewAspect > aspect ? viewHeight / height : viewWidth / width;

    camera.zoom = zoom * 0.9; // Add small margin
    camera.updateProjectionMatrix();
  }, [bounds, aspect, camera]);

  // Points rendering
  useEffect(() => {
    if (!meshRef.current || !points.length) return;

    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();

    points.forEach(({ x, y }, i) => {
      dummy.position.set(x, y, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [points]);

  if (!points.length) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined!, undefined!, points.length]}>
      <circleGeometry args={[pointSize]} />
      <meshBasicMaterial color={pointColor} />
    </instancedMesh>
  );
}

export default Points;
