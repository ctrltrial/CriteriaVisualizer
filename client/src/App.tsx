import "./App.css";
import { useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
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
  const [activePlot, setActivePlot] = useState("Breast Cancer");
  const [colorMode, setColorMode] = useState<"years" | "clusters">("clusters");

  useEffect(() => {
    setHoveredCluster(undefined);
  }, [activePlot]);

  useEffect(() => {
    setHoveredCluster(undefined);
  }, [colorMode]);

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

  // Define cluster colors - using a diverse color palette
  const clusterColors = useMemo(
    () => [
      "#BC13FE", // Neon Purple
      "#FF00FF", // Neon Magenta
      "#04D9FF", // Neon Cyan
      "#39FF14", // Neon Green
      "#FFFF33", // Neon Yellow
      "#FF8C00", // Neon Orange
      "#FF073A", // Neon Red
      "#00FFFF", // Cyan
      "#FF1493", // Deep Pink
      "#32CD32", // Lime Green
      "#FFD700", // Gold
      "#FF4500", // Orange Red
      "#9370DB", // Medium Purple
      "#20B2AA", // Light Sea Green
      "#FF69B4", // Hot Pink
      "#00CED1", // Dark Turquoise
      "#FF6347", // Tomato
      "#8A2BE2", // Blue Violet
      "#00FF7F", // Spring Green
      "#FFB6C1", // Light Pink
    ],
    []
  );

  // Define year groups for color coding
  const yearGroups = useMemo(
    () => [
      { start: 1990, end: 1995, color: "#BC13FE" }, // Neon Purple
      { start: 1995, end: 2000, color: "#FF00FF" }, // Neon Magenta
      { start: 2000, end: 2005, color: "#04D9FF" }, // Neon Cyan
      { start: 2005, end: 2010, color: "#39FF14" }, // Neon Green
      { start: 2010, end: 2015, color: "#FFFF33" }, // Neon Yellow
      { start: 2015, end: 2020, color: "#FF8C00" }, // Neon Orange
      { start: 2020, end: 2025, color: "#FF073A" }, // Neon Red
    ],
    []
  );

  // Calculate cluster counts for sorting
  const clusterCounts = useMemo(() => {
    const counts: { [key: number]: number } = {};
    filteredPoints.forEach(point => {
      counts[point.CLUSTER] = (counts[point.CLUSTER] || 0) + 1;
    });
    return counts;
  }, [filteredPoints]);

  // Group points by clusters or years based on color mode
  const pointGroups = useMemo(() => {
    if (colorMode === "clusters") {
      // Get unique clusters from filtered data
      const uniqueClusters = [...new Set(filteredPoints.map(d => d.CLUSTER))].sort((a, b) => a - b);
      
      return uniqueClusters.map((cluster, index) => ({
        points: filteredPoints
          .filter((d) => d.CLUSTER === cluster)
          .map(({ X, Y, CLUSTER }) => ({
            X,
            Y,
            CLUSTER: String(CLUSTER),
          })) as Point[],
        color: clusterColors[index % clusterColors.length],
        label: `Cluster ${cluster}`,
      }));
    } else {
      // Group by years
      return yearGroups.map(({ start, end, color }) => ({
        points: filteredPoints
          .filter((d) => d.YEAR >= start && d.YEAR < end)
          .map(({ X, Y, CLUSTER }) => ({
            X,
            Y,
            CLUSTER: String(CLUSTER),
          })) as Point[],
        color,
        label: `${start}-${end - 1}`,
      }));
    }
  }, [filteredPoints, clusterColors, yearGroups, colorMode]);

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

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex-1 relative">
        <Canvas
          orthographic
          camera={{ zoom: 5.5, position: [0, 0, 100] }}
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
          />

          {pointGroups.map((group, i) => (
            <ScatterPlot
              key={`${activePlot}-${i}`}
              points={group.points}
              pointSize={10}
              pointColor={group.color}
              stretchX={1.2}
              highlightedCluster={hoveredCluster}
              // Disable auto-fit to maintain consistent zoom
              autoFit={false}
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
          activePlot={activePlot}
          clusterColors={clusterColors}
          clusterCounts={clusterCounts}
        />
        <PlotToggle
          activePlot={activePlot}
          setActivePlot={setActivePlot}
          plots={["Breast Cancer", "Lung Cancer", "GI Oncology"]}
        />

        <div className="absolute top-4 right-4 z-50 bg-[rgba(30,30,30,0.5)] backdrop-blur rounded p-2 shadow-md transition-all duration-300 ease-in-out">
          <div className="flex flex-col sm:flex-row gap-2 z-10">
            <button
              onClick={() => setColorMode("years")}
              className={`text-xs sm:text-sm px-3 py-1 rounded transition-all duration-200 ease-in-out hover:scale-105
                ${
                  colorMode === "years"
                    ? "bg-white text-black font-semibold"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              Years
            </button>
            <button
              onClick={() => setColorMode("clusters")}
              className={`text-xs sm:text-sm px-3 py-1 rounded transition-all duration-200 ease-in-out hover:scale-105
                ${
                  colorMode === "clusters"
                    ? "bg-white text-black font-semibold"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              Clusters
            </button>
          </div>
        </div>

        {colorMode === "years" && (
          <div className="absolute right-4 bg-[rgba(30,30,30,0.3)] backdrop-blur-3xl rounded-lg text-white border border-white/20 p-3 z-10 bottom-4 w-[140px] sm:w-[160px] md:w-[140px] lg:w-[160px] xl:w-[180px] transition-all duration-300 ease-in-out">
            <div className="text-xs font-semibold mb-2">Years</div>
            {yearGroups.map(({ start, end, color }) => (
              <div key={`${start}-${end}`} className="flex items-center my-1">
                <div
                  className="w-3 h-3 mr-2 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs">{`${start}-${end - 1}`}</span>
              </div>
            ))}
          </div>
        )}

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
