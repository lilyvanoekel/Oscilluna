import * as THREE from "three";
import { BuildADSRDrawer } from "../adsr-drawer";
import { BoundingBox } from "../domain/layout";

export const BuildScreenAdsr = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  getBoundingBoxTop: () => BoundingBox,
  getBoundingBoxBottom: () => BoundingBox
) => {
  const adsr1 = BuildADSRDrawer(
    patchConnection,
    scene,
    root,
    getBoundingBoxTop(),
    "adsr1"
  );

  const adsr2 = BuildADSRDrawer(
    patchConnection,
    scene,
    root,
    getBoundingBoxBottom(),
    "adsr2"
  );

  return {
    resize: () => {
      adsr1.setBoundingBox(getBoundingBoxTop());
      adsr2.setBoundingBox(getBoundingBoxBottom());
    },
    setVisible: (v: boolean) => {
      adsr1.setVisible(v);
      adsr2.setVisible(v);
    },
  };
};
