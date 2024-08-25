import React from "react";
import DrawShapeToWaveform from "./DrawShapeToWaveform";

function App({ patchConnection }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DrawShapeToWaveform patchConnection={patchConnection} />
    </div>
  );
}

export default App;
