import * as THREE from "three";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { MeshBasicMaterial } from "three";

// Create materials outside the component if they are static (or use a hook if parameters change)
const textMaterial = new MeshBasicMaterial({
  color: "#000000",
  depthTest: false,
  transparent: true,
});

const backgroundMaterial = new MeshBasicMaterial({
  color: "#ffffff",
  transparent: true,
  opacity: 0.25,
  depthTest: false,
});

export interface Point {
  X: number;
  Y: number;
  CLUSTER: string;
}

export interface Label {
  x: number;
  y: number;
  text: string;
}

export interface ScatterPlotProps {
  points?: Point[];
  pointSize?: number;
  pointColor?: string;
  padding?: number;
  stretchX?: number;
  stretchY?: number;
  labels?: Label[];
  highlightedCluster?: string;
}

// Custom hook for auto-fitting the camera.
function useFitCamera(
  computedBounds: ReturnType<typeof getComputedBounds>,
  padding: number,
  needsFit: boolean
) {
  const { camera } = useThree();
  useEffect(() => {
    if (
      !needsFit ||
      !computedBounds ||
      !(camera instanceof THREE.OrthographicCamera)
    )
      return;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const dataWidth = computedBounds.maxX - computedBounds.minX;
    const dataHeight = computedBounds.maxY - computedBounds.minY;
    const dataAspect = dataWidth / dataHeight;
    const viewAspect = viewWidth / viewHeight;
    const zoom =
      viewAspect > dataAspect ? viewHeight / dataHeight : viewWidth / dataWidth;
    camera.zoom = zoom * 0.9;
    camera.position.set(
      (computedBounds.maxX + computedBounds.minX) / 2,
      (computedBounds.maxY + computedBounds.minY) / 2,
      100
    );
    camera.updateProjectionMatrix();
  }, [computedBounds, camera, needsFit]);
}

// Helper to compute bounds; now separately exported in case it's used elsewhere.
export function getComputedBounds(points: Point[], padding: number) {
  if (!points.length) return null;
  const { minX, maxX, minY, maxY } = points.reduce(
    (acc, { X, Y }) => ({
      minX: Math.min(acc.minX, X),
      maxX: Math.max(acc.maxX, X),
      minY: Math.min(acc.minY, Y),
      maxY: Math.max(acc.maxY, Y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
  const xPad = (maxX - minX) * padding;
  const yPad = (maxY - minY) * padding;
  return {
    minX: minX - xPad,
    maxX: maxX + xPad,
    minY: minY - yPad,
    maxY: maxY + yPad,
  };
}

function ScatterPlot({
  pointSize = 0.05,
  pointColor = "blue",
  points = [],
  padding = 0.1,
  stretchX = 1,
  stretchY = 1,
  labels = [],
  highlightedCluster,
}: ScatterPlotProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const labelGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const [needsInitialFit, setNeedsInitialFit] = useState(true);

  // Calculate positions for each point.
  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    points.forEach(({ X, Y }, i) => {
      arr[i * 3 + 0] = X;
      arr[i * 3 + 1] = Y;
      // A small z offset to avoid overlap issues.
      arr[i * 3 + 2] = i * 0.00001;
    });
    return arr;
  }, [points]);

  // Compute bounds for camera fitting.
  const computedBounds = useMemo(
    () => getComputedBounds(points, padding),
    [points, padding]
  );

  // Use custom hook to auto-fit the camera once.
  useFitCamera(computedBounds, padding, needsInitialFit);
  useEffect(() => {
    if (computedBounds) setNeedsInitialFit(false);
  }, [computedBounds]);

  // Buffer attribute for point sizes.
  const sizes = useMemo(() => {
    const arr = new Float32Array(points.length);
    for (let i = 0; i < points.length; i++) {
      arr[i] = pointSize;
    }
    return arr;
  }, [points, pointSize]);

  // Generate random phase offsets for pulsation.
  const phaseOffsets = useMemo(() => {
    const offsets = new Float32Array(points.length);
    for (let i = 0; i < points.length; i++) {
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return offsets;
  }, [points]);

  // Animate point sizes on each frame.
  useFrame((state) => {
    if (!geometryRef.current) return;
    const aSizeAttr = geometryRef.current.getAttribute(
      "aSize"
    ) as THREE.BufferAttribute;
    if (!aSizeAttr) return;

    const time = state.clock.getElapsedTime();
    const amplitude = 0.5; // Variation
    const frequency = 2.5; // Oscillations per second.
    const baselineFactor = 1.5; // Highlight baseline multiplier

    let updated = false;
    for (let i = 0; i < points.length; i++) {
      let targetSize = pointSize;
      if (highlightedCluster && points[i].CLUSTER === highlightedCluster) {
        const baseline = pointSize * baselineFactor;
        targetSize =
          baseline *
          (1 + amplitude * Math.sin(time * frequency + phaseOffsets[i]));
      }
      if (aSizeAttr.array[i] !== targetSize) {
        aSizeAttr.array[i] = targetSize;
        updated = true;
      }
    }
    if (updated) aSizeAttr.needsUpdate = true;
  });

  if (!points.length) return null;

  return (
    <>
      <group scale={[stretchX, stretchY, 1]}>
        <points ref={pointsRef}>
          <bufferGeometry ref={geometryRef}>
            <bufferAttribute
              attach="attributes-position"
              array={positions}
              count={points.length}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-aSize"
              array={sizes}
              count={points.length}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={pointSize}
            sizeAttenuation={false}
            color={pointColor as THREE.ColorRepresentation}
            alphaTest={0.5}
            onBeforeCompile={(shader) => {
              shader.vertexShader =
                "attribute float aSize;\n" + shader.vertexShader;
              shader.vertexShader = shader.vertexShader.replace(
                "gl_PointSize = size;",
                "gl_PointSize = aSize;"
              );
              shader.fragmentShader = shader.fragmentShader.replace(
                "#include <clipping_planes_fragment>",
                `#include <clipping_planes_fragment>
                 float dist = length(gl_PointCoord - vec2(0.5));
                 if (dist > 0.5) discard;`
              );
            }}
          />
        </points>
      </group>

      {labels.map((label, i) => (
        <group
          key={i}
          ref={(el) => (labelGroupRefs.current[i] = el)}
          position={[label.x, label.y, 0.01]}
          renderOrder={999}
        >
          <mesh position={[0, 0, -0.01]} material={backgroundMaterial}>
            <planeGeometry args={[label.text.length * 8 + 2, 20 + 2]} />
          </mesh>
          <Text
            fontSize={5}
            color="#1f2937"
            anchorX="center"
            anchorY="middle"
            outlineColor="#1f2937"
            outlineWidth={0.2}
            material={textMaterial}
          >
            {label.text}
          </Text>
        </group>
      ))}
    </>
  );
}

export default ScatterPlot;
