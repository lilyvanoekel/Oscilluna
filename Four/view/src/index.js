import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

(async () => {
  let CmajorSingletonPatchConnection = undefined;

  if (window.frameElement && window.frameElement.CmajorSingletonPatchConnection)
    CmajorSingletonPatchConnection =
      window.frameElement.CmajorSingletonPatchConnection;

  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(<App patchConnection={CmajorSingletonPatchConnection} />);
})();
