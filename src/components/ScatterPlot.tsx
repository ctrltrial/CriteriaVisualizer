import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { OrbitControls } from "@react-three/drei";

interface Point {
  x: number;
  y: number;
}

interface ScatterPlotProps {
  points?: Point[];
  pointSize?: number;
  pointColor?: string;
  padding?: number; // Percentage of padding around data
}

function Points({
  pointSize = 0.05,
  pointColor = "blue",
  points,
  padding = 0.1, // 10% padding by default
}: ScatterPlotProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const numPoints = points?.length || 2000; // default number of points for testing

  // Calculate bounds from data or use defaults
  const bounds = useMemo(() => {
    if (!points?.length) {
      return { minX: -10, maxX: 10, minY: -10, maxY: 10 };
    }

    const xValues = points.map((p) => p.x);
    const yValues = points.map((p) => p.y);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    // Add padding
    const xPadding = (maxX - minX) * padding;
    const yPadding = (maxY - minY) * padding;

    return {
      minX: minX - xPadding,
      maxX: maxX + xPadding,
      minY: minY - yPadding,
      maxY: maxY + yPadding,
    };
  }, [points, padding]);

  // Calculate dimensions
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];

    for (let i = 0; i < numPoints; i++) {
      let x, y;
      if (points && points[i]) {
        x = points[i].x;
        y = points[i].y;
      } else {
        // Generate random points within calculated bounds
        x = bounds.minX + Math.random() * width;
        y = bounds.minY + Math.random() * height;
      }

      dummy.position.set(x, y, 0);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }

    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [points, bounds, width, height, numPoints]);

  return (
    <>
      {/* Grid helper that matches data bounds */}
      <gridHelper
        args={[Math.max(width, height), 10]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[
          (bounds.maxX + bounds.minX) / 2,
          (bounds.maxY + bounds.minY) / 2,
          -0.01,
        ]}
      />

      <instancedMesh
        ref={meshRef}
        args={[
          undefined as unknown as THREE.BufferGeometry,
          undefined as unknown as THREE.Material,
          numPoints,
        ]}
      >
        <circleGeometry args={[pointSize]} />
        <meshBasicMaterial color={pointColor} />
      </instancedMesh>
    </>
  );
}

export default Points;
