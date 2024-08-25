import React from "react";
import DrawShapeToWaveform from "./DrawShapeToWaveform";

function App({ patchConnection }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <div
        style={{
          width: "120px",
          background: "#222222",
          padding: "20px",
        }}
      >
        <button className="side-button">Wave 1</button>
        <button className="side-button">Wave 2</button>
        <button className="side-button">Wave Folding</button>
      </div>
      <div style={{ flex: 1 }}>
        <DrawShapeToWaveform patchConnection={patchConnection} />
      </div>
    </div>
  );
}

export default App;
