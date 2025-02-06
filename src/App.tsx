import "./App.css";
import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "bootstrap/dist/css/bootstrap.min.css";
import RangeSelector, {
  Margin,
  Scale,
  Chart,
  Series,
} from "devextreme-react/range-selector";
import "devextreme/dist/css/dx.light.css";
import NavBar from "./components/NavBar";
import Points from "./components/ScatterPlot";
import { data } from "./utils/data";

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
    const bins = Array.from({ length: 100 }, (_, i) => ({
      arg: i,
      val: data.filter((d) => Math.floor(d.filterVal) === i).length,
    }));
    return bins;
  }, []);

  const handleRangeChange = (e: any) => setRange(e.value);

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

      <div
        style={{
          // height: "170px",
          // padding: "0px 10px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e0e0e0",
          boxShadow: "0 -8px 8px rgba(0, 0, 0, 0.03)", // Lighter shadow
        }}
      >
        <RangeSelector
          dataSource={histogramData}
          onValueChanged={handleRangeChange}
          defaultValue={[0, 100]}
        >
          <Margin top={10} bottom={10} left={30} right={30} />{" "}
          <Scale startValue={0} endValue={100} />
          <Chart>
            <Series
              type="bar"
              argumentField="arg"
              valueField="val"
              color="#1976d2"
            />
          </Chart>
        </RangeSelector>
      </div>
    </div>
  );
}

export default App;
