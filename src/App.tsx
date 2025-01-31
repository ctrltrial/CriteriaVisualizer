import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import NavBar from "./components/NavBar";
import ScatterPlot from "./components/ScatterPlot";

function App() {
  return (
    <>
      <div className="main-content">
        <NavBar />
        <ScatterPlot />
      </div>
    </>
  );
}

export default App;
