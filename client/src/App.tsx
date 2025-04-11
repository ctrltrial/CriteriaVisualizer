import "./App.css";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TOUCH, MOUSE } from "three";

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
import ScatterPlot, { Point } from "./components/ScatterPlot";
import RangeSlider from "./components/RangeSlider";
import LabelWithBackground from "./components/LabelWithBackground";

function App() {
  const [data, setData] = useState<DataItem[]>([]);
  const [labelData, setLabelData] = useState<LabelItem[]>([]);
  const [minDataVal, setMinDataVal] = useState<number>(0);
  const [maxDataVal, setMaxDataVal] = useState<number>(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [hoveredCluster, setHoveredCluster] = useState<string | undefined>(
    undefined
  );

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

  // Create event callbacks with useCallback
  const handleLabelPointerOver = useCallback(
    (clusterId: string) => (event: ThreeEvent<PointerEvent>) => {
      setHoveredCluster(clusterId);
      event.stopPropagation();
    },
    []
  );

  const handleLabelPointerOut = useCallback(
    () => (event: ThreeEvent<PointerEvent>) => {
      setHoveredCluster(undefined);
      event.stopPropagation();
    },
    []
  );

  const filteredPoints = useMemo(
    () => data.filter((d) => d.YEAR >= range[0] && d.YEAR <= range[1]),
    [data, range]
  );

  // Define decade groups for color coding.
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

  // Group points by decade.
  const pointGroups = useMemo(
    () =>
      decadeGroups.map(({ start, end, color }) => ({
        points: filteredPoints
          .filter((d) => d.YEAR >= start && d.YEAR < end)
          .map(({ X, Y, CLUSTER }) => ({
            X,
            Y,
            CLUSTER: String(CLUSTER),
          })) as Point[],
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

  if (data.length === 0) return <div>Loading...</div>;

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

          {pointGroups.map((group, i) => (
            <ScatterPlot
              key={filteredPoints.length + i} // Ensures a fresh geometry if the number of points changes.
              points={group.points}
              pointSize={15}
              pointColor={group.color}
              stretchX={1.2}
              highlightedCluster={hoveredCluster}
            />
          ))}

          {labelData.map((label) => {
            const clusterId = String(label.CLUSTER);
            const isHovered = hoveredCluster === clusterId;
            return (
              <LabelWithBackground
                key={clusterId}
                label={label}
                hovered={isHovered}
                onPointerOver={handleLabelPointerOver(clusterId)}
                onPointerOut={handleLabelPointerOut()}
              />
            );
          })}
        </Canvas>

        <div className="absolute top-4 right-4 bg-white bg-opacity-80 p-1 rounded shadow z-10">
          {pointGroups.map(({ label, color }) => (
            <div key={label} className="flex items-center my-1">
              <div
                className="w-3 h-3 mr-2 rounded"
                style={{ backgroundColor: color }}
              />
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
