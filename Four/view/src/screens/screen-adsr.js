import { BuildADSRDrawer } from "../adsr-drawer.js";

export const BuildScreenAdsr = (
  patchConnection,
  scene,
  getBoundingBoxTop,
  getBoundingBoxBottom
) => {
  const adsr1 = BuildADSRDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxTop(),
    "adsr1"
  );

  const adsr2 = BuildADSRDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxBottom(),
    "adsr2"
  );

  return {
    resize: () => {
      adsr1.setBoundingBox(getBoundingBoxTop());
      adsr2.setBoundingBox(getBoundingBoxBottom());
    },
    setVisible: (v) => {
      adsr1.setVisible(v);
      adsr2.setVisible(v);
    },
  };
};
