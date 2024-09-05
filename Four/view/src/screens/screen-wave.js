import { BuildWaveDrawer } from "../wave-drawer.js";

export const BuildScreenWave = (
  patchConnection,
  scene,
  getBoundingBoxTop,
  getBoundingBoxBottom
) => {
  const drawer1 = BuildWaveDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxTop(),
    "point1"
  );

  const drawer2 = BuildWaveDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxBottom(),
    "point2"
  );
  return {
    resize: () => {
      drawer1.setBoundingBox(getBoundingBoxTop());
      drawer2.setBoundingBox(getBoundingBoxBottom());
    },
    setVisible: (v) => {
      drawer1.setVisible(v);
      drawer2.setVisible(v);
    },
  };
};
