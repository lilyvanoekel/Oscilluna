import * as THREE from "three";
import { BuildADSRDrawer } from "../elements/adsr-drawer";
import { BoundingBox, renderTextInBoundingBox, xUnits } from "../domain/layout";
import { BuildRadio } from "../elements/radio";

export const BuildScreenAdsr = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  ctx: CanvasRenderingContext2D,
  getBoundingBoxTop: () => BoundingBox,
  getBoundingBoxBottom: () => BoundingBox
) => {
  let isVisible = true;

  const adjustBoundingBox = (bb: BoundingBox) => ({
    ...bb,
    left: bb.left + xUnits(148),
    top: bb.top - xUnits(56),
  });

  const adjustBoundingBoxRadio = (bb: BoundingBox) => ({
    ...bb,
    right: bb.left + xUnits(146),
    top: bb.top - xUnits(56),
  });

  const adsr1 = BuildADSRDrawer(
    patchConnection,
    scene,
    root,
    adjustBoundingBox(getBoundingBoxTop()),
    "adsr1"
  );

  const adsr2 = BuildADSRDrawer(
    patchConnection,
    scene,
    root,
    adjustBoundingBox(getBoundingBoxBottom()),
    "adsr2"
  );

  const radio1 = BuildRadio(
    ["Linear", "Exp"],
    scene,
    ctx,
    adjustBoundingBoxRadio(getBoundingBoxTop()),
    (value) => {
      adsr1.setExponential(!!value);
    },
    0,
    true,
    false
  );

  const radio2 = BuildRadio(
    ["Linear", "Exp"],
    scene,
    ctx,
    adjustBoundingBoxRadio(getBoundingBoxBottom()),
    (value) => {
      adsr2.setExponential(!!value);
    },
    0,
    true,
    false
  );

  const renderLabels = () => {
    if (!isVisible) {
      return;
    }

    renderTextInBoundingBox(ctx, getBoundingBoxTop(), "Osc 1 - ADSR");
    renderTextInBoundingBox(ctx, getBoundingBoxBottom(), "Osc 2 - ADSR");
  };

  return {
    resize: () => {
      adsr1.setBoundingBox(adjustBoundingBox(getBoundingBoxTop()));
      adsr2.setBoundingBox(adjustBoundingBox(getBoundingBoxBottom()));

      radio1.setBoundingBox(adjustBoundingBoxRadio(getBoundingBoxTop()));
      radio2.setBoundingBox(adjustBoundingBoxRadio(getBoundingBoxBottom()));
    },
    setVisible: (v: boolean) => {
      isVisible = v;
      adsr1.setVisible(v);
      adsr2.setVisible(v);
      radio1.setVisible(v);
      radio2.setVisible(v);
    },
    canvasDraw: () => {
      renderLabels();

      radio1.draw();
      radio2.draw();
    },
  };
};
