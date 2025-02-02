import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";
import Points from "./components/ScatterPlot";

function App() {
  // Example data - replace with your actual data
  const data = Array.from({ length: 2000 }, () => ({
    x: (Math.random() - 0.5) * 60,
    y: (Math.random() - 0.5) * 20,
  }));

  return (
    <div className="main-content">
      <NavBar />
      <div className="canvas-container">
        <Canvas
          orthographic // Use orthographic camera for true 2D view
          camera={{
            position: [0, 0, 100],
            zoom: 40, // Adjust this value to change the default zoom level
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
            points={data}
            pointSize={0.05}
            pointColor="blue"
            padding={0.1} // 10% padding around the data
          />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
