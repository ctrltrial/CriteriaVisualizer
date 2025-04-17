import { Html } from "@react-three/drei";
import { LabelItem } from "../utils/data";

interface LabelsProps {
  labels: LabelItem[];
  onHover: (clusterId: string | undefined) => void;
  hoveredCluster?: string;
}

export default function Labels({ labels, onHover, hoveredCluster }: LabelsProps) {
  // Split labels so the hovered one renders last (on top)
  const nonHovered = labels.filter(lbl => String(lbl.CLUSTER) !== hoveredCluster);
  const hoveredLbl = labels.find(lbl => String(lbl.CLUSTER) === hoveredCluster);

  const renderLabel = (lbl: LabelItem, isHovered: boolean, zIndex: number, zPos: number, zRange: [number, number]) => (
    <Html
      key={lbl.CLUSTER + (isHovered ? "-hover" : "")}
      position={[lbl.X, lbl.Y, zPos]}
      center
      sprite
      zIndexRange={zRange}
    >
      <div
        className="label-element"
        onMouseEnter={() => onHover(String(lbl.CLUSTER))}
        onMouseLeave={() => onHover(undefined)}
        style={{
          zIndex,
          padding: "4px 8px",
          backgroundColor: isHovered ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
          borderRadius: "4px",
          color: "#fff",
          fontSize: "14px",
          cursor: "pointer",
          transition: "background-color 0.2s, transform 0.2s",
          transform: isHovered ? "scale(1.1)" : undefined,
          whiteSpace: "nowrap",
        }}
      >
        {lbl.LABEL}
      </div>
    </Html>
  );

  return (
    <>
      {nonHovered.map(lbl => renderLabel(lbl, false, 0, 1, [0, 0]))}
      {hoveredLbl && renderLabel(hoveredLbl, true, 9999, 2, [9999, 9999])}
    </>
  );
}
