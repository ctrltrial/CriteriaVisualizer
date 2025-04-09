import "./App.css";

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
    <div className="flex flex-col h-screen">
      <NavBar />

      <div className="flex-1 relative">
        <Canvas
          orthographic
          camera={{ zoom: 40, position: [0, 0, 100] }}
          className="bg-[#f0f0f0]"
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
              pointSize={5.0}
              pointColor={group.color}
            />
          ))}
        </Canvas>

        <div className="absolute top-4 right-4 bg-white bg-opacity-80 p-2 rounded shadow z-10">
          {pointGroups.map(({ label, color }) => (
            <div key={label} className="flex items-center my-1">
              <div
                className="w-4 h-4 mr-2 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm">{label}</span>
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
