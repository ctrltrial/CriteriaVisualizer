import "./App.css";
import { useState, useMemo, useEffect } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { TOUCH, MOUSE, Shape } from "three";

import {
  fetchData,
  fetchLabel,
  getMaxVal,
  getMinVal,
  DataItem,
  LabelItem,
  DECADE_COLORS,
} from "./utils/data";

import NavBar from "./components/NavBar";
import ScatterPlot from "./components/ScatterPlot";
import RangeSlider from "./components/RangeSlider";

// Helper: Creates a rounded rectangle shape centered at the origin.
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

/**
 * LabelWithBackground computes the dimensions of the background using the
 * text length and font size. It only renders the background when hovered.
 * The background is built from a rounded rectangle shape.
 */
function LabelWithBackground({
  label,
  hovered,
  onPointerOver,
  onPointerOut,
}: {
  label: LabelItem;
  hovered: boolean;
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
}) {
  const fontSize = hovered ? 4 : 3; // Use different font sizes for normal and hovered states.
  const letterWidthFactor = 0.6; // Estimate the width of one character.
  const horizontalMargin = hovered ? 3 : 2;
  const verticalMargin = hovered ? 3 : 2;

  // Compute approximate width and height of the text.
  const computedWidth = label.LABEL.length * fontSize * letterWidthFactor + horizontalMargin;
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
          <shapeGeometry args={[createRoundedRectShape(computedWidth, computedHeight, radius)]} />
          <meshBasicMaterial color={bgColor} transparent opacity={bgOpacity} />
        </mesh>
      )}
      <Text fontSize={fontSize} color={textColor} anchorX="center" anchorY="middle">
        {label.LABEL}
      </Text>
    </group>
  );
}

function App() {
  const [data, setData] = useState<DataItem[]>([]);
  const [labelData, setLabelData] = useState<LabelItem[]>([]);
  const [minDataVal, setMinDataVal] = useState<number>(0);
  const [maxDataVal, setMaxDataVal] = useState<number>(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  // Note: Use string | undefined (instead of null) to match the prop type in ScatterPlot.
  const [hoveredCluster, setHoveredCluster] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedData = await fetchData();
        setData(fetchedData);
        const minVal = getMinVal(fetchedData);
        const maxVal = getMaxVal(fetchedData);
        setMinDataVal(minVal);
        setMaxDataVal(maxVal);
        setRange([minVal, maxVal]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadLabels() {
      try {
        const fetchedLabels = await fetchLabel();
        setLabelData(fetchedLabels);
      } catch (error) {
        console.error("Error fetching labels:", error);
      }
    }
    loadLabels();
  }, []);

  const filteredPoints = useMemo(
    () => data.filter((d) => d.YEAR >= range[0] && d.YEAR <= range[1]),
    [data, range]
  );

  const decadeGroups = useMemo(
    () => [
      { start: 1970, end: 1979, color: DECADE_COLORS["1970-1979"] },
      { start: 1980, end: 1989, color: DECADE_COLORS["1980-1989"] },
      { start: 1990, end: 1999, color: DECADE_COLORS["1990-1999"] },
      { start: 2000, end: 2009, color: DECADE_COLORS["2000-2009"] },
      { start: 2010, end: 2019, color: DECADE_COLORS["2010-2019"] },
      { start: 2020, end: Infinity, color: DECADE_COLORS["2020+"] },
    ],
    []
  );

  const pointGroups = useMemo(
    () =>
      decadeGroups.map(({ start, end, color }) => ({
        points: filteredPoints
          .filter((d) => d.YEAR >= start && d.YEAR < end)
          .map(({ X, Y, CLUSTER }) => ({
            X,
            Y,
            CLUSTER: String(CLUSTER),
          })),
        color,
        label: `${start}${end === Infinity ? "+" : `-${end}`}`,
      })),
    [filteredPoints, decadeGroups]
  );

  const histogramData = useMemo(() => {
    if (data.length === 0) return [];
    const BIN_WIDTH = 1;
    const numBins = Math.ceil(maxDataVal - minDataVal);
    return Array.from({ length: numBins }, (_, i) => {
      const binStart = Math.floor(minDataVal) + i;
      return {
        arg: binStart,
        val: data.filter(
          (d) => d.YEAR >= binStart && d.YEAR < binStart + BIN_WIDTH
        ).length,
      };
    });
  }, [data, minDataVal, maxDataVal]);

  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 relative">
        <Canvas
          orthographic
          camera={{ zoom: 40, position: [0, 0, 100] }}
          style={{ background: "#1e1e1e" }}
        >
          <OrbitControls
            enableRotate={false}
            enableZoom={true}
            zoomSpeed={1}
            enablePan={true}
            mouseButtons={{ LEFT: MOUSE.PAN }}
            touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
            screenSpacePanning={true}
            maxAzimuthAngle={0}
            minAzimuthAngle={0}
          />

          {/* Pass the hovered cluster state as a prop to ScatterPlot */}
          {pointGroups.map((group, i) => (
            <ScatterPlot
              key={i}
              points={group.points}
              pointSize={15}
              pointColor={group.color}
              stretchX={1.2}
              highlightedCluster={hoveredCluster}
            />
          ))}

          {/* Render labels with background highlight on hover */}
          {labelData.map((label) => {
            const clusterId = String(label.CLUSTER);
            const isHovered = hoveredCluster === clusterId;
            return (
              <LabelWithBackground
                key={clusterId}
                label={label}
                hovered={isHovered}
                onPointerOver={(event: ThreeEvent<PointerEvent>) => {
                  setHoveredCluster(clusterId);
                  event.stopPropagation();
                }}
                onPointerOut={(event: ThreeEvent<PointerEvent>) => {
                  setHoveredCluster(undefined);
                  event.stopPropagation();
                }}
              />
            );
          })}
        </Canvas>
        <div className="absolute top-4 right-4 bg-white bg-opacity-80 p-1 rounded shadow z-10">
          {pointGroups.map(({ label, color }) => (
            <div key={label} className="flex items-center my-1">
              <div className="w-3 h-3 mr-2 rounded" style={{ backgroundColor: color }} />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <RangeSlider
        data={histogramData}
        value={range}
        onValueChange={setRange}
        lowerSliderBound={minDataVal}
        upperSliderBound={maxDataVal}
      />
    </div>
  );
}

export default App;
