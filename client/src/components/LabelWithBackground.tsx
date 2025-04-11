import { useMemo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Shape } from "three";

interface LabelItem {
  CLUSTER: number;
  LABEL: string;
  X: number;
  Y: number;
}

interface LabelWithBackgroundProps {
  label: LabelItem;
  hovered: boolean;
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
}

// Helper to create a rounded rectangle shape.
function createRoundedRectShape(width: number, height: number, radius: number) {
  const shape = new Shape();
  const hw = width / 2;
  const hh = height / 2;
  shape.moveTo(-hw + radius, -hh);
  shape.lineTo(hw - radius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  shape.lineTo(hw, hh - radius);
  shape.quadraticCurveTo(hw, hh, hw - radius, hh);
  shape.lineTo(-hw + radius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  shape.lineTo(-hw, -hh + radius);
  shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  return shape;
}

export default function LabelWithBackground({
  label,
  hovered,
  onPointerOver,
  onPointerOut,
}: LabelWithBackgroundProps) {
  // Adjust font size and margins based on hover state.
  const fontSize = hovered ? 4 : 3;
  const letterWidthFactor = 0.6;
  const horizontalMargin = hovered ? 3 : 2;
  const verticalMargin = hovered ? 3 : 2;

  const computedWidth =
    label.LABEL.length * fontSize * letterWidthFactor + horizontalMargin;
  const computedHeight = fontSize + verticalMargin;
  const radius = Math.min(computedWidth, computedHeight) * 0.1;
  const textColor = "#f0f0f0";
  const bgColor = "#393b39";
  const bgOpacity = hovered ? 0.95 : 0;

  return (
    <group
      position={[label.X, label.Y, 1]}
      renderOrder={999}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {hovered && (
        <mesh position={[0, 0, -0.01]}>
          <shapeGeometry
            args={[
              createRoundedRectShape(computedWidth, computedHeight, radius),
            ]}
          />
          <meshBasicMaterial color={bgColor} transparent opacity={bgOpacity} />
        </mesh>
      )}
      <Text
        fontSize={fontSize}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {label.LABEL}
      </Text>
    </group>
  );
}
