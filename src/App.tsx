import "./App.css";
import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";
import Points from "./components/ScatterPlot";
import { data, minDataVal, maxDataVal } from "./utils/data";
import RangeSlider from "./components/RangeSlider";

function App() {
  const [range, setRange] = useState<[number, number]>([0, 100]);

  const filteredPoints = useMemo(
    () =>
      data
        .filter((d) => d.filterVal >= range[0] && d.filterVal <= range[1])
        .map(({ x, y }) => ({ x, y })),
    [range]
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
  }, [data, minDataVal, maxDataVal]);

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
          <Points
            points={filteredPoints}
            pointSize={0.1}
            pointColor="blue"
            padding={0.1}
          />
        </Canvas>
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
