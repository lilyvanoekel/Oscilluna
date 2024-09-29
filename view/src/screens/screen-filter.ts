import * as THREE from "three";
import { BuildADSRDrawer } from "../elements/adsr-drawer";
import {
  BoundingBox,
  renderTextInBoundingBox,
  splitBoundingBoxHorizontal,
  xUnits,
} from "../domain/layout";
import { BuildRadio } from "../elements/radio";
import { BuildSlider } from "../elements/slider";
import { BuildFilterBlock } from "./blocks/filter-block";

export const BuildScreenFilter = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  ctx: CanvasRenderingContext2D,
  getBoundingBoxTop: () => BoundingBox,
  getBoundingBoxBottom: () => BoundingBox,
  canvasRedraw: () => void
) => {
  let isVisible = true;
  let adsrVisible = false;
  let depthSliderVisible = false;
  let rateSliderVisible = false;

  const bbTop = splitBoundingBoxHorizontal(2, getBoundingBoxTop());
  const bb = splitBoundingBoxHorizontal(8, getBoundingBoxBottom());

  const bbAdsrAdjust = (bb: BoundingBox) => {
    const bottomBb = getBoundingBoxBottom();
    return {
      ...bb,
      top: bb.top - xUnits(56),
      left: bb.left + xUnits(8),
      right: bottomBb.right - xUnits(240),
    };
  };

  const bbRoutingAdjust = (bb: BoundingBox) => ({
    ...bb,
    left: bb.right - xUnits(220),
  });

  const filterBlockA = BuildFilterBlock(
    scene,
    root,
    ctx,
    bbTop[0],
    canvasRedraw,
    (value) => {
      console.log(value);
    }
  );

  const filterBlockB = BuildFilterBlock(
    scene,
    root,
    ctx,
    bbTop[1],
    canvasRedraw,
    (value) => {
      console.log(value);
    }
  );

  const adsr = BuildADSRDrawer(
    patchConnection,
    scene,
    root,
    bbAdsrAdjust(bb[2]),
    "adsr1"
  );

  const filterModMode = BuildRadio(
    ["None", "LFO", "ADSR L", "ADSR E", "OSC 1", "OSC 2"],
    scene,
    ctx,
    bb[0],
    (value) => {
      //   patchConnection?.sendEventOrValue("adsr1_mode", value);
      //   patchConnection?.requestParameterValue("adsr1_mode");
      setFilterModMode(value);
    },
    0,
    true,
    false
  );

  const depthSlider = BuildSlider(
    "\nDepth",
    scene,
    root,
    ctx,
    bb[1],
    (value) => {
      //   patchConnection?.sendEventOrValue(fieldId, transformerOut(value));
      //   patchConnection?.requestParameterValue(fieldId);
    },
    0,
    0,
    1,
    0.01,
    false
  );

  const rateSlider = BuildSlider(
    "\nRate",
    scene,
    root,
    ctx,
    bb[2],
    (value) => {
      //   patchConnection?.sendEventOrValue(fieldId, transformerOut(value));
      //   patchConnection?.requestParameterValue(fieldId);
    },
    0,
    0,
    1,
    0.01,
    false
  );

  const filterRouting = BuildRadio(
    ["Parallel", "Series 1 → 2", "Series 2 → 1"],
    scene,
    ctx,
    bbRoutingAdjust(getBoundingBoxBottom()),
    (value) => {
      //   patchConnection?.sendEventOrValue("adsr1_mode", value);
      //   patchConnection?.requestParameterValue("adsr1_mode");
    },
    0,
    true,
    false
  );

  const updateVisible = () => {
    filterBlockA.setVisible(isVisible);
    filterBlockB.setVisible(isVisible);
    filterModMode.setVisible(isVisible);
    depthSlider.setVisible(isVisible && depthSliderVisible);
    rateSlider.setVisible(isVisible && rateSliderVisible);
    adsr.setVisible(isVisible && adsrVisible);
    filterRouting.setVisible(isVisible);
    canvasRedraw();
  };

  const setFilterModMode = (modMode: number) => {
    adsrVisible = modMode == 2 || modMode == 3;
    depthSliderVisible = modMode != 0;
    rateSliderVisible = modMode == 1;

    updateVisible();

    adsr.setExponential(modMode == 3);
  };

  const paramsUpdated = ({
    endpointID,
    value,
  }: {
    endpointID: string;
    value: number;
  }) => {};

  patchConnection?.addAllParameterListener(paramsUpdated);

  //   patchConnection?.requestParameterValue("adsr1_mode");
  //   patchConnection?.requestParameterValue("adsr2_mode");

  const renderLabels = () => {
    if (!isVisible) {
      return;
    }

    const bbTop = splitBoundingBoxHorizontal(2, getBoundingBoxTop());

    renderTextInBoundingBox(ctx, bbTop[0], "Filter A");
    renderTextInBoundingBox(ctx, bbTop[1], "Filter B");
    renderTextInBoundingBox(ctx, getBoundingBoxBottom(), "Filter A Mod");
    renderTextInBoundingBox(
      ctx,
      bbRoutingAdjust(getBoundingBoxBottom()),
      "Filter Routing"
    );
  };

  return {
    resize: () => {
      const bbTop = splitBoundingBoxHorizontal(2, getBoundingBoxTop());
      filterBlockA.setBoundingBox(bbTop[0]);
      filterBlockB.setBoundingBox(bbTop[1]);
      const bb = splitBoundingBoxHorizontal(8, getBoundingBoxBottom());

      adsr.setBoundingBox(bbAdsrAdjust(bb[2]));
      depthSlider.setBoundingBox(bb[1]);
      rateSlider.setBoundingBox(bb[2]);
      filterModMode.setBoundingBox(bb[0]);
      filterRouting.setBoundingBox(bbRoutingAdjust(getBoundingBoxBottom()));
    },
    setVisible: (v: boolean) => {
      isVisible = v;
      updateVisible();
    },
    canvasDraw: () => {
      renderLabels();

      filterBlockA.canvasDraw();
      filterBlockB.canvasDraw();
      filterModMode.draw();
      depthSlider.draw();
      rateSlider.draw();
      filterRouting.draw();
    },
  };
};
