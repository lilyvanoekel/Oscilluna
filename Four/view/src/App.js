import React from "react";
import DrawShapeToWaveform from "./DrawShapeToWaveform";

function App({ patchConnection }) {
  return (
    <div>
      <DrawShapeToWaveform patchConnection={patchConnection} />
    </div>
  );
}

export default App;
