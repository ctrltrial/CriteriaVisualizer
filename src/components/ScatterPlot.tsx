import * as THREE from "three";
import { useEffect, useRef, useMemo, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { MeshBasicMaterial } from "three";

const textMaterial = new MeshBasicMaterial({
  color: "#f0f0f0",
  depthTest: false, // ✅ disable depth test so it draws on top
  transparent: true,
});

interface Point {
  x: number;
  y: number;
}

interface Label {
  x: number;
  y: number;
  text: string;
}

interface ScatterPlotProps {
  points?: Point[];
  pointSize?: number;
  pointColor?: string;
  padding?: number;
  labels?: Label[];
}

function ScatterPlot({
  pointSize = 0.05,
  pointColor = "blue",
  points = [],
  padding = 0.1,
  labels = [],
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

  const labelRefs = useRef<(THREE.Object3D | null)[]>([]); // 👈 For scaling

  useFrame(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      const baseScale = 1 / camera.zoom;
      labelRefs.current.forEach((label) => {
        if (label) {
          label.scale.setScalar(baseScale);
        }
      });
    }
  });

  // Calculate data bounds once on first mount
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

  // Initial camera fit
  useEffect(() => {
    if (
      !needsInitialFit ||
      !bounds ||
      !(camera instanceof THREE.OrthographicCamera)
    )
      return;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight - 56; // e.g. navbar offset
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

  // Convert points to a position buffer
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
    <>
      {/* Circle-shaped points that do NOT scale on zoom */}
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
          sizeAttenuation={false} // keeps same screen size on zoom
          color={pointColor as THREE.ColorRepresentation}
          alphaTest={0.5}
          onBeforeCompile={(shader) => {
            // Make each point a circle by discarding corners
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <clipping_planes_fragment>",
              `#include <clipping_planes_fragment>
               float dist = length(gl_PointCoord - vec2(0.5));
               if (dist > 0.5) discard;`
            );
          }}
        />
      </points>

      {/* Fixed-size 3D Text labels */}
      {labels.map((label, i) => (
        <Text
          key={i}
          ref={(el) => (labelRefs.current[i] = el)}
          position={[label.x, label.y, 0.01]} // 👈 slight z-offset to bring forward
          fontSize={20}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          outlineColor="#1f2937"
          lineHeight={1.1}
          renderOrder={999} // 👈 force to render last
          material={textMaterial} // 👈 ignore depth buffer (draw over points)
        >
          {label.text}
        </Text>
      ))}
    </>
  );
}

export default ScatterPlot;
