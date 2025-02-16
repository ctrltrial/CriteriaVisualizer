import "./App.css";
import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";
import Points from "./components/ScatterPlot";
import { data, minDataVal, maxDataVal } from "./utils/data";
import RangeSlider from "./components/RangeSlider";

// Color palette for decades (purple to red gradient)
const DECADE_COLORS = {
  "1970-1980": "#6a4c93",
  "1980-1990": "#8a5c9e",
  "1990-2000": "#a96ca9",
  "2000-2010": "#c87cb4",
  "2010-2020": "#e68cbf",
  "2020+": "#ff9cca",
};

function App() {
  const [range, setRange] = useState<[number, number]>([
    minDataVal,
    maxDataVal,
  ]);

  const filteredPoints = useMemo(
    () =>
      data.filter((d) => d.filterVal >= range[0] && d.filterVal <= range[1]),
    [range]
  );

  // Define decade ranges
  const decadeGroups = useMemo(
    () => [
      { start: 1970, end: 1980, color: DECADE_COLORS["1970-1980"] },
      { start: 1980, end: 1990, color: DECADE_COLORS["1980-1990"] },
      { start: 1990, end: 2000, color: DECADE_COLORS["1990-2000"] },
      { start: 2000, end: 2010, color: DECADE_COLORS["2000-2010"] },
      { start: 2010, end: 2020, color: DECADE_COLORS["2010-2020"] },
      { start: 2020, end: Infinity, color: DECADE_COLORS["2020+"] },
    ],
    []
  );

  // Create point groups for each decade
  const pointGroups = useMemo(
    () =>
      decadeGroups.map(({ start, end, color }) => ({
        points: filteredPoints
          .filter((d) => d.filterVal >= start && d.filterVal < end)
          .map(({ x, y }) => ({ x, y })),
        color,
        label: `${start}${end === Infinity ? "+" : `-${end}`}`,
      })),
    [filteredPoints, decadeGroups]
  );

  const histogramData = useMemo(() => {
    const BIN_WIDTH = 1;
    const numBins = Math.ceil(maxDataVal - minDataVal);

    return Array.from({ length: numBins }, (_, i) => {
      const binStart = Math.floor(minDataVal) + i;
      const binEnd = binStart + BIN_WIDTH;

      return {
        arg: binStart,
        val: data.filter((d) => d.filterVal >= binStart && d.filterVal < binEnd)
          .length,
      };
    });
  }, []);

  return (
    <div
      className="main-content"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <NavBar />

      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 100],
            zoom: 40,
            up: [0, 0, 1],
          }}
          style={{ background: "#f0f0f0" }}
        >
          <OrbitControls
            enableRotate={false}
            enableZoom={true}
            enablePan={true}
          />
          {pointGroups.map((group, i) => (
            <Points
              key={i}
              points={group.points}
              pointSize={0.15}
              pointColor={group.color}
              padding={0.1}
            />
          ))}
        </Canvas>
      </div>

      <div
        className="color-legend"
        style={{
          position: "absolute",
          top: 70,
          right: 20,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {pointGroups.map((group) => (
          <div
            key={group.label}
            style={{ display: "flex", alignItems: "center", margin: "5px 0" }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: group.color,
                marginRight: 8,
                borderRadius: "3px",
              }}
            />
            <span>{group.label}</span>
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
