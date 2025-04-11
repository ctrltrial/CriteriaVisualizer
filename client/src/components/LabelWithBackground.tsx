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
  // Adjust font size based on hover state.
  const fontSize = hovered ? 4 : 3;
  const letterWidthFactor = 0.6;
  // Instead of fixed margins, we calculate padding as a fraction of fontSize.
  const horizontalPadding = fontSize * 0.5;
  const verticalPadding = fontSize * 0.5;

  // Compute the width and height of the text background.
  const computedWidth =
    label.LABEL.length * fontSize * letterWidthFactor + 2 * horizontalPadding;
  const computedHeight = fontSize + 2 * verticalPadding;
  const radius = Math.min(computedWidth, computedHeight) * 0.5;

  // Background: Use a dark color for good contrast.
  const bgColor = "#1a1a1a";
  const bgOpacity = hovered ? 0.9 : 0.75;

  // Text style: White text with a slight outline for separation.
  const textColor = "#FFFFFF";
  const outlineColor = "#000000";
  const outlineWidth = hovered ? 0.5 : 0.3;

  return (
    <group
      position={[label.X, label.Y, 1]}
      renderOrder={999}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <mesh position={[0, 0, -0.01]}>
        <shapeGeometry
          args={[createRoundedRectShape(computedWidth, computedHeight, radius)]}
        />
        <meshBasicMaterial color={bgColor} transparent opacity={bgOpacity} />
      </mesh>
      <Text
        fontSize={fontSize}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        outlineColor={outlineColor}
        outlineWidth={outlineWidth}
      >
        {label.LABEL}
      </Text>
    </group>
  );
}
