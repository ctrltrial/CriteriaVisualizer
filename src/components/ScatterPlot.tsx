import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import NavBar from "./NavBar";

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
  points,
  padding = 0.1,
}: ScatterPlotProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { camera } = useThree();
  const numPoints = points?.length || 2000;

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

  // Initial camera zoom to fit data
  useEffect(() => {
    if (camera) {
      const xRange = bounds.maxX - bounds.minX;
      const yRange = bounds.maxY - bounds.minY;

      const navbarHeight = 56;
      const availableHeight = window.innerHeight - navbarHeight;

      const aspectRatio = window.innerWidth / availableHeight;
      let zoom;

      if (xRange / yRange > aspectRatio) {
        // Width is the limiting factor
        zoom = window.innerWidth / xRange;
      } else {
        // Height is the limiting factor
        zoom = availableHeight / yRange;
      }

      (camera as THREE.OrthographicCamera).zoom = zoom;
      camera.updateProjectionMatrix();
    }
  }, [width, height, bounds]);

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
