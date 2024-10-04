import * as THREE from "three";
import { BoundingBox, splitBoundingBoxHorizontal } from "../../domain/layout";
import { BuildRadio } from "../../elements/radio";
import { BuildSlider } from "../../elements/slider";

export type FilterBlockValue = {
  type: number;
  cutoff: number;
  resonance: number;
  keytracking: number;
};

export const BuildFilterBlock = (
  scene: THREE.Scene,
  root: HTMLElement,
  ctx: CanvasRenderingContext2D,
  boundingBox: BoundingBox,
  canvasRedraw: () => void,
  onValueChanged: (value: FilterBlockValue) => void
) => {
  let isVisible = false;
  let resonanceVisible = true;
  let filterDetailsVisible = true;
  let currentValue: FilterBlockValue = {
    type: 0,
    cutoff: 0,
    resonance: 0,
    keytracking: 0,
  };

  const bb = splitBoundingBoxHorizontal(4, boundingBox);

  const filterType = BuildRadio(
    ["Off", "LP 1", "LP 2"],
    scene,
    ctx,
    bb[0],
    (value) => {
      onValueChanged({ ...currentValue, type: value });
    },
    0,
    true,
    false
  );

  const keytrackingSlider = BuildSlider(
    "\nKeyTrack",
    scene,
    root,
    ctx,
    bb[1],
    (value) => {
      onValueChanged({ ...currentValue, keytracking: value });
    },
    0,
    0,
    1,
    0.01,
    false
  );

  const cutoffSlider = BuildSlider(
    "\nCutoff",
    scene,
    root,
    ctx,
    bb[2],
    (value) => {
      onValueChanged({ ...currentValue, cutoff: value });
    },
    0,
    440,
    18000,
    1,
    false
  );

  const resonanceSlider = BuildSlider(
    "\nReso",
    scene,
    root,
    ctx,
    bb[3],
    (value) => {
      onValueChanged({ ...currentValue, resonance: value });
    },
    0,
    0,
    1,
    0.01,
    false
  );

  const updateVisible = () => {
    filterType.setVisible(isVisible);
    keytrackingSlider.setVisible(isVisible && filterDetailsVisible);
    cutoffSlider.setVisible(isVisible && filterDetailsVisible);
    resonanceSlider.setVisible(
      isVisible && filterDetailsVisible && resonanceVisible
    );
    canvasRedraw();
  };

  const setFilterModType = (type: number) => {
    resonanceVisible = type == 1 || type == 2;
    filterDetailsVisible = type > 0;
    updateVisible();
  };

  return {
    setBoundingBox: (b: BoundingBox) => {
      const bb = splitBoundingBoxHorizontal(4, b);

      filterType.setBoundingBox(bb[0]);
      keytrackingSlider.setBoundingBox(bb[1]);
      cutoffSlider.setBoundingBox(bb[2]);
      resonanceSlider.setBoundingBox(bb[3]);
    },
    setVisible: (v: boolean) => {
      isVisible = v;
      updateVisible();
    },
    canvasDraw: () => {
      filterType.draw();
      keytrackingSlider.draw();
      cutoffSlider.draw();
      resonanceSlider.draw();
    },
    setValue: (newValue: FilterBlockValue) => {
      currentValue = newValue;
      filterType.setValue(newValue.type);
      keytrackingSlider.setValue(newValue.keytracking);
      cutoffSlider.setValue(newValue.cutoff);
      resonanceSlider.setValue(newValue.resonance);
      setFilterModType(currentValue.type);
    },
  };
};
