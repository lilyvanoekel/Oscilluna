import * as THREE from "three";
import { BuildWaveDrawer } from "../elements/wave-drawer";
import { BoundingBox, renderTextInBoundingBox } from "../domain/layout";

export const BuildScreenWave = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  ctx: CanvasRenderingContext2D,
  getBoundingBoxTop: () => BoundingBox,
  getBoundingBoxBottom: () => BoundingBox
) => {
  let isVisible = true;

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

  const renderLabels = () => {
    if (!isVisible) {
      return;
    }

    renderTextInBoundingBox(ctx, getBoundingBoxTop(), "Osc 1");
    renderTextInBoundingBox(ctx, getBoundingBoxBottom(), "Osc 2");
  };

  return {
    resize: () => {
      drawer1.setBoundingBox(getBoundingBoxTop());
      drawer2.setBoundingBox(getBoundingBoxBottom());
    },
    setVisible: (v: boolean) => {
      isVisible = v;
      drawer1.setVisible(v);
      drawer2.setVisible(v);
    },
    canvasDraw: () => {
      renderLabels();
    },
  };
};
