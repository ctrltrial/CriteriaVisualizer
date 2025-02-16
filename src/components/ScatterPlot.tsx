import * as THREE from "three";
import { useEffect, useRef, useMemo, useState } from "react";
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
  const [initialBounds, setInitialBounds] = useState<{
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);
  const [needsInitialFit, setNeedsInitialFit] = useState(true);

  // Calculate bounds once on first mount
  const bounds = useMemo(() => {
    if (!points.length || initialBounds) return initialBounds;

    const { minX, maxX, minY, maxY } = points.reduce(
      (acc, { x, y }) => ({
        minX: Math.min(acc.minX, x),
        maxX: Math.max(acc.maxX, x),
        minY: Math.min(acc.minY, y),
        maxY: Math.max(acc.maxY, y),
      }),
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
      }
    );

    const xPad = (maxX - minX) * padding;
    const yPad = (maxY - minY) * padding;

    return {
      minX: minX - xPad,
      maxX: maxX + xPad,
      minY: minY - yPad,
      maxY: maxY + yPad,
    };
  }, [points.length, padding]); // Only recalculate if point count changes

  // Initial camera setup
  useEffect(() => {
    if (
      !needsInitialFit ||
      !bounds ||
      !(camera instanceof THREE.OrthographicCamera)
    )
      return;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight - 56; // Navbar height

    const dataWidth = bounds.maxX - bounds.minX;
    const dataHeight = bounds.maxY - bounds.minY;
    const dataAspect = dataWidth / dataHeight;
    const viewAspect = viewWidth / viewHeight;

    const zoom =
      viewAspect > dataAspect ? viewHeight / dataHeight : viewWidth / dataWidth;

    camera.zoom = zoom * 0.9; // 10% margin
    camera.position.set(
      (bounds.maxX + bounds.minX) / 2,
      (bounds.maxY + bounds.minY) / 2,
      100
    );
    camera.updateProjectionMatrix();
    setNeedsInitialFit(false);
  }, [bounds, camera, needsInitialFit]);

  // Update points without affecting camera
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
