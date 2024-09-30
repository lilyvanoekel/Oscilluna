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
import { BuildFilterBlock, FilterBlockValue } from "./blocks/filter-block";
import { debounce } from "../domain/debounce";

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

  let filterBlock1Value: FilterBlockValue = {
    type: 0,
    cutoff: 440,
    resonance: 0,
    keytracking: 0,
  };

  let filterBlock2Value: FilterBlockValue = {
    type: 0,
    cutoff: 440,
    resonance: 0,
    keytracking: 0,
  };

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
      patchConnection?.sendEventOrValue("filter1_cutoff", value.cutoff);
      patchConnection?.requestParameterValue("filter1_cutoff");
      patchConnection?.sendEventOrValue("filter1_keytrack", value.keytracking);
      patchConnection?.requestParameterValue("filter1_keytrack");
      patchConnection?.sendEventOrValue("filter1_resonance", value.resonance);
      patchConnection?.requestParameterValue("filter1_resonance");
      patchConnection?.sendEventOrValue("filter1_mode", value.type);
      patchConnection?.requestParameterValue("filter1_mode");
    }
  );

  const filterBlockB = BuildFilterBlock(
    scene,
    root,
    ctx,
    bbTop[1],
    canvasRedraw,
    (value) => {
      patchConnection?.sendEventOrValue("filter2_cutoff", value.cutoff);
      patchConnection?.requestParameterValue("filter2_cutoff");
      patchConnection?.sendEventOrValue("filter2_keytrack", value.keytracking);
      patchConnection?.requestParameterValue("filter2_keytrack");
      patchConnection?.sendEventOrValue("filter2_resonance", value.resonance);
      patchConnection?.requestParameterValue("filter2_resonance");
      patchConnection?.sendEventOrValue("filter2_mode", value.type);
      patchConnection?.requestParameterValue("filter2_mode");
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
      patchConnection?.sendEventOrValue("filter_mod", value);
      patchConnection?.requestParameterValue("filter_mod");
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
      patchConnection?.sendEventOrValue("filter_mod_depth", value);
      patchConnection?.requestParameterValue("filter_mod_depth");
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
      patchConnection?.sendEventOrValue("filter_mod_rate", value);
      patchConnection?.requestParameterValue("filter_mod_rate");
    },
    0,
    0.1,
    5,
    0.01,
    false
  );

  const filterRouting = BuildRadio(
    ["Parallel", "Series A → B", "Series B → A"],
    scene,
    ctx,
    bbRoutingAdjust(getBoundingBoxBottom()),
    (value) => {
      patchConnection?.sendEventOrValue("filter_routing", value);
      patchConnection?.requestParameterValue("filter_routing");
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
  }) => {
    switch (endpointID) {
      case "filter_mod":
        filterModMode.setValue(value);
        debounce(setFilterModMode, 100)(value);
        break;
      case "filter_mod_depth":
        depthSlider.setValue(value);
        break;
      case "filter_mod_rate":
        rateSlider.setValue(value);
        break;
      case "filter_routing":
        filterRouting.setValue(value);
        break;
      case "filter1_cutoff":
      case "filter1_keytrack":
      case "filter1_resonance":
      case "filter1_mode":
        const property = {
          filter1_cutoff: "cutoff",
          filter1_keytrack: "keytracking",
          filter1_resonance: "resonance",
          filter1_mode: "type",
        }[endpointID];
        filterBlock1Value = { ...filterBlock1Value, [property]: value };
        filterBlockA.setValue(filterBlock1Value);
        break;
      case "filter2_cutoff":
      case "filter2_keytrack":
      case "filter2_resonance":
      case "filter2_mode":
        const property2 = {
          filter2_cutoff: "cutoff",
          filter2_keytrack: "keytracking",
          filter2_resonance: "resonance",
          filter2_mode: "type",
        }[endpointID];
        filterBlock2Value = { ...filterBlock2Value, [property2]: value };
        filterBlockB.setValue(filterBlock2Value);
        break;
    }
  };

  patchConnection?.addAllParameterListener(paramsUpdated);

  patchConnection?.requestParameterValue("filter_mod");
  patchConnection?.requestParameterValue("filter_mod_depth");
  patchConnection?.requestParameterValue("filter_mod_rate");
  patchConnection?.requestParameterValue("filter_routing");

  patchConnection?.requestParameterValue("filter1_cutoff");
  patchConnection?.requestParameterValue("filter1_keytrack");
  patchConnection?.requestParameterValue("filter1_resonance");
  patchConnection?.requestParameterValue("filter1_mode");

  patchConnection?.requestParameterValue("filter2_cutoff");
  patchConnection?.requestParameterValue("filter2_keytrack");
  patchConnection?.requestParameterValue("filter2_resonance");
  patchConnection?.requestParameterValue("filter2_mode");

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
