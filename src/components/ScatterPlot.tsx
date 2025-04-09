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

function ScatterPlot({
  pointSize = 0.05,
  pointColor = "blue",
  points = [],
  padding = 0.1,
}: ScatterPlotProps) {
  const pointsRef = useRef<THREE.Points>(null);
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

    const computedBounds = {
      minX: minX - xPad,
      maxX: maxX + xPad,
      minY: minY - yPad,
      maxY: maxY + yPad,
    };

    setInitialBounds(computedBounds);
    return computedBounds;
  }, [points, initialBounds, padding]);

  // Initial camera setup
  useEffect(() => {
    if (
      !needsInitialFit ||
      !bounds ||
      !(camera instanceof THREE.OrthographicCamera)
    )
      return;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight - 0; // NavBar height

    const dataWidth = bounds.maxX - bounds.minX;
    const dataHeight = bounds.maxY - bounds.minY;
    const dataAspect = dataWidth / dataHeight;
    const viewAspect = viewWidth / viewHeight;

    const zoom =
      viewAspect > dataAspect ? viewHeight / dataHeight : viewWidth / dataWidth;

    camera.zoom = zoom * 0.9;
    camera.position.set(
      (bounds.maxX + bounds.minX) / 2,
      (bounds.maxY + bounds.minY) / 2,
      100
    );
    camera.updateProjectionMatrix();
    setNeedsInitialFit(false);
  }, [bounds, camera, needsInitialFit]);

  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    points.forEach(({ x, y }, i) => {
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = 0;
    });
    return arr;
  }, [points]);

  if (!points.length) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        sizeAttenuation={false}
        color={pointColor as THREE.ColorRepresentation}
        alphaTest={0.5}
        onBeforeCompile={(shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <clipping_planes_fragment>",
            `#include <clipping_planes_fragment>
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;`
          );
        }}
      />
    </points>
  );
}

export default ScatterPlot;
