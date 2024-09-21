import * as THREE from "three";
import { BuildWaveDrawer } from "../elements/wave-drawer";
import { BoundingBox } from "../domain/layout";

export const BuildScreenWave = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  getBoundingBoxTop: () => BoundingBox,
  getBoundingBoxBottom: () => BoundingBox
) => {
  const drawer1 = BuildWaveDrawer(
    patchConnection,
    scene,
    root,
    getBoundingBoxTop(),
    "point1"
  );

  const drawer2 = BuildWaveDrawer(
    patchConnection,
    scene,
    root,
    getBoundingBoxBottom(),
    "point2"
  );
  return {
    resize: () => {
      drawer1.setBoundingBox(getBoundingBoxTop());
      drawer2.setBoundingBox(getBoundingBoxBottom());
    },
    setVisible: (v: boolean) => {
      drawer1.setVisible(v);
      drawer2.setVisible(v);
    },
  };
};
