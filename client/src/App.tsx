import "./App.css";
import { useState, useMemo, useEffect } from "react";
import { Canvas, } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TOUCH, MOUSE } from "three";

import {
  fetchData,
  fetchLabel,
  fetchRank,
  getMaxVal,
  getMinVal,
  DataItem,
  LabelItem,
  RankItem,
} from "./utils/data";

import NavBar from "./components/NavBar";
import ScatterPlot, { Point } from "./components/ScatterPlot";
import RangeSlider from "./components/RangeSlider";
import Labels from "./components/Labels";
import { InfoBox } from "./components/InfoBox";
import { PlotToggle } from "./components/NavBar";

function App() {
  const [data, setData] = useState<DataItem[]>([]);
  const [labelData, setLabelData] = useState<LabelItem[]>([]);
  const [rankData, setRankData] = useState<RankItem[]>([]);
  const [minDataVal, setMinDataVal] = useState<number>(0);
  const [maxDataVal, setMaxDataVal] = useState<number>(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [hoveredCluster, setHoveredCluster] = useState<string | undefined>(
    undefined
  );
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const [activePlot, setActivePlot] = useState("Breast Cancer");

  useEffect(() => {
    setHasUserInteracted(false);
    setHoveredCluster(undefined);
  }, [activePlot]);
  
  useEffect(() => {
    async function loadData() {
      try {
        const fetchedData = await fetchData(activePlot);
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
  }, [activePlot]);

  useEffect(() => {
    async function loadLabels() {
      try {
        const fetchedLabels = await fetchLabel(activePlot);
        setLabelData(fetchedLabels);
      } catch (error) {
        console.error("Error fetching labels:", error);
      }
    }
    loadLabels();
  }, [activePlot]);

  useEffect(() => {
    async function loadRanks() {
      try {
        const fetchedRanks = await fetchRank(activePlot);
        setRankData(fetchedRanks);
      } catch (error) {
        console.error("Error fetching ranks:", error);
      }
    }
    loadRanks();
  }, [activePlot]);

  const filteredPoints = useMemo(
    () => data.filter((d) => d.YEAR >= range[0] && d.YEAR <= range[1]),
    [data, range]
  );

  // Define decade groups for color coding.
  const fiveYearGroups = useMemo(
    () => [
      { start: 1990, end: 1995, color: "#BC13FE" }, // Neon Red
      { start: 1995, end: 2000, color: "#FF00FF" }, // Neon Orange
      { start: 2000, end: 2005, color: "#04D9FF" }, // Neon Yellow
      { start: 2005, end: 2010, color: "#39FF14" }, // Neon Green
      { start: 2010, end: 2015, color: "#FFFF33" }, // Neon Blue
      { start: 2015, end: 2020, color: "#FF8C00" }, // Neon Magenta
      { start: 2020, end: 2025, color: "#FF073A" }, // Neon Violet
    ],
    []
  );

  // Group points by 5-year groups.
  const pointGroups = useMemo(
    () =>
      fiveYearGroups.map(({ start, end, color }) => ({
        points: filteredPoints
          .filter((d) => d.YEAR >= start && d.YEAR < end)
          .map(({ X, Y, CLUSTER }) => ({
            X,
            Y,
            CLUSTER: String(CLUSTER),
          })) as Point[],
        color,
        label: `${start}-${end - 1}`,
      })),
    [filteredPoints, fiveYearGroups]
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
            zoomSpeed={0.5}
            enablePan={true}
            mouseButtons={{ LEFT: MOUSE.PAN }}
            touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
            screenSpacePanning={true}
            maxAzimuthAngle={0}
            minAzimuthAngle={0}
            onStart={() => setHasUserInteracted(true)}
          />

          {pointGroups.map((group, i) => (
            <ScatterPlot
              key={`${activePlot}-${i}`}
              points={group.points}
              pointSize={10}
              pointColor={group.color}
              stretchX={1.2}
              highlightedCluster={hoveredCluster}
              // Only auto-fit if the user hasn't interacted yet:
              autoFit={!hasUserInteracted}
            />
          ))}

          <Labels
            labels={labelData}
            onHover={setHoveredCluster}
            hoveredCluster={hoveredCluster}
          />
        </Canvas>

        <InfoBox
          rankData={rankData}
          hoveredCluster={hoveredCluster}
          setHoveredCluster={setHoveredCluster}
        />
        <PlotToggle
          activePlot={activePlot}
          setActivePlot={setActivePlot}
          plots={["Breast Cancer", "Lung Cancer", "GI Oncology"]}
        />

        <div className="absolute bottom-4 right-4 bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 p-3 z-10 max-h-[25vh]">
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
