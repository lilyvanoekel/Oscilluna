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

  const adsr1Mode = BuildRadio(
    ["Linear", "Exp"],
    scene,
    ctx,
    adjustBoundingBoxRadio(getBoundingBoxTop()),
    (value) => {
      patchConnection?.sendEventOrValue("adsr1_mode", value);
      patchConnection?.requestParameterValue("adsr1_mode");
    },
    0,
    true,
    false
  );

  const adsr2Mode = BuildRadio(
    ["Linear", "Exp"],
    scene,
    ctx,
    adjustBoundingBoxRadio(getBoundingBoxBottom()),
    (value) => {
      patchConnection?.sendEventOrValue("adsr2_mode", value);
      patchConnection?.requestParameterValue("adsr2_mode");
    },
    0,
    true,
    false
  );

  const paramsUpdated = ({
    endpointID,
    value,
  }: {
    endpointID: string;
    value: number;
  }) => {
    if (endpointID == "adsr1_mode") {
      adsr1Mode.setValue(value);
      adsr1.setExponential(!!value);
    }

    if (endpointID == "adsr2_mode") {
      adsr2Mode.setValue(value);
      adsr2.setExponential(!!value);
    }
  };

  patchConnection?.addAllParameterListener(paramsUpdated);

  patchConnection?.requestParameterValue("adsr1_mode");
  patchConnection?.requestParameterValue("adsr2_mode");

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

      adsr1Mode.setBoundingBox(adjustBoundingBoxRadio(getBoundingBoxTop()));
      adsr2Mode.setBoundingBox(adjustBoundingBoxRadio(getBoundingBoxBottom()));
    },
    setVisible: (v: boolean) => {
      isVisible = v;
      adsr1.setVisible(v);
      adsr2.setVisible(v);
      adsr1Mode.setVisible(v);
      adsr2Mode.setVisible(v);
    },
    canvasDraw: () => {
      renderLabels();

      adsr1Mode.draw();
      adsr2Mode.draw();
    },
  };
};
