import "./App.css";
import { Canvas } from "@react-three/fiber";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./components/NavBar";
import Points from "./components/ScatterPlot";

function App() {
  return (
    <div className="main-content">
      <NavBar />
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75, near: 0.1, far: 1000 }}
          style={{ background: "#f0f0f0" }} // Optional: add background color
        >
          <Points />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
