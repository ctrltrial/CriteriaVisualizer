import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TOUCH, MOUSE } from "three";

import {
  data,
  minDataVal,
  maxDataVal,
  DECADE_COLORS,
  getDecadeGroups,
} from "./utils/data";

import NavBar from "./components/NavBar";
import ScatterPlot from "./components/ScatterPlot";
import RangeSlider from "./components/RangeSlider";

// Helper function to filter points within a given range
const filterPointsByRange = (range: [number, number]) =>
  data.filter(
    ({ filterVal }) => filterVal >= range[0] && filterVal <= range[1]
  );

// Generate histogram data
const generateHistogramData = () => {
  const BIN_WIDTH = 1;
  const numBins = Math.ceil(maxDataVal - minDataVal);

  return Array.from({ length: numBins }, (_, i) => {
    const binStart = Math.floor(minDataVal) + i;
    const binEnd = binStart + BIN_WIDTH;
    return {
      arg: binStart,
      val: data.filter(
        ({ filterVal }) => filterVal >= binStart && filterVal < binEnd
      ).length,
    };
  });
};

function App() {
  const [range, setRange] = useState<[number, number]>([
    minDataVal,
    maxDataVal,
  ]);

  const filteredPoints = useMemo(() => filterPointsByRange(range), [range]);
  const decadeGroups = useMemo(() => getDecadeGroups(DECADE_COLORS), []);
  const histogramData = useMemo(() => generateHistogramData(), []);

  // Group points by decade
  const pointGroups = useMemo(
    () =>
      decadeGroups.map(({ start, end, color }) => ({
        points: filteredPoints
          .filter(({ filterVal }) => filterVal >= start && filterVal < end)
          .map(({ x, y }) => ({ x, y })),
        color,
        label: `${start}${end === Infinity ? "+" : `-${end}`}`,
      })),
    [filteredPoints, decadeGroups]
  );

  return (
    <div
      className="main-content"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <NavBar />

      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 200], zoom: 40, up: [0, 0, 1] }}
          style={{ background: "#f0f0f0" }}
        >
          <OrbitControls
            enableRotate={false}
            enableZoom={true}
            zoomSpeed={0.5}
            enablePan={true}
            mouseButtons={{ LEFT: MOUSE.PAN }}
            touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
            screenSpacePanning={true}
            maxAzimuthAngle={0}
            minAzimuthAngle={0}
          />

          {pointGroups.map((group, i) => (
            <ScatterPlot
              key={i}
              points={group.points}
              pointSize={0.05}
              pointColor={group.color}
              padding={0.1}
            />
          ))}
        </Canvas>
      </div>

      <div className="color-legend">
        {pointGroups.map(({ label, color }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", margin: "5px 0" }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: color,
                marginRight: 8,
                borderRadius: "3px",
              }}
            />
            <span>{label}</span>
          </div>
        ))}
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
