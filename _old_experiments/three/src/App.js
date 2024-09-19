import React, { useState } from "react";
import Home from "./Home";
import DrawShapeToWaveform from "./DrawShapeToWaveform";
import FatLine from "./FatLine";

function App() {
  const [activeComponent, setActiveComponent] = useState("home");

  const renderComponent = () => {
    switch (activeComponent) {
      case "home":
        return <Home />;
      case "draw":
        return <DrawShapeToWaveform />;
      case "fatline":
        return <FatLine />;
      default:
        return <Home />;
    }
  };

  return (
    <div>
      <nav style={{ position: "absolute", top: "0", left: "0", margin: 0 }}>
        <button onClick={() => setActiveComponent("home")}>Home</button>
        <button onClick={() => setActiveComponent("draw")}>
          Draw Shape to Waveform
        </button>
        <button onClick={() => setActiveComponent("fatline")}>Fatline</button>
      </nav>
      {renderComponent()}
    </div>
  );
}

export default App;
