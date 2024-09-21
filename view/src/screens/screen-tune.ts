import * as THREE from "three";

import { dbToLinear, linearToDb } from "../domain/dsp";
import { BoundingBox, splitBoundingBoxHorizontal } from "../domain/layout";
import { BuildSlider } from "../elements/slider";
import { BuildRadio } from "../elements/radio";

const identity = <T>(x: T): T => x;
type Transformer = (x: number) => number;
type ScreenElement =
  | [
      "slider",
      string,
      number,
      number,
      string,
      (
        | [number, number, number, Transformer, Transformer]
        | [number, number, number]
      ),
    ]
  | ["radio", string[], number, number, string];

export const BuildScreenTune = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  ctx: CanvasRenderingContext2D,
  getBoundingBoxTop: () => BoundingBox,
  getBoundingBoxBottom: () => BoundingBox
) => {
  const elements: ScreenElement[] = [
    [
      "slider",
      "Output\nLevel",
      0,
      0,
      "osc1_level",
      [0, 1, 0.01, linearToDb, dbToLinear],
    ],
    ["slider", "Course\nTune", 0, 1, "osc1_coarse", [-2, 2, 1]],
    ["slider", "Fine\nTune", 0, 2, "osc1_fine", [-20, 20, 1]],
    ["slider", "Vibrato\nDepth", 0, 3, "osc1_vibrato_depth", [0, 1, 0.01]],
    ["slider", "Vibrato\nSpeed", 0, 4, "osc1_vibrato_rate", [0.5, 10, 0.01]],
    ["radio", ["No FM", "1 → 2", "2 → 1"], 0, 5, "fm_direction"],
    ["slider", "FM\nDepth", 0, 6, "fm_depth", [0, 1, 0.01]],
    ["slider", "Self\nFM", 0, 7, "osc1_feedback_fm", [0, 1, 0.01]],

    [
      "slider",
      "Output\nLevel",
      1,
      0,
      "osc2_level",
      [0, 1, 0.01, linearToDb, dbToLinear],
    ],
    ["slider", "Course\nTune", 1, 1, "osc2_coarse", [-2, 2, 1]],
    ["slider", "Fine\nTune", 1, 2, "osc2_fine", [-20, 20, 1]],
    ["slider", "Vibrato\nDepth", 1, 3, "osc2_vibrato_depth", [0, 1, 0.01]],
    ["slider", "Vibrato\nSpeed", 1, 4, "osc2_vibrato_rate", [0.5, 10, 0.01]],
    ["slider", "Self\nFM", 1, 5, "osc2_feedback_fm", [0, 1, 0.01]],
  ];

  const bb = [
    splitBoundingBoxHorizontal(8, getBoundingBoxTop()),
    splitBoundingBoxHorizontal(8, getBoundingBoxBottom()),
  ];
  const sliders: [ReturnType<typeof BuildSlider>, number, number][] = [];
  const radios: [ReturnType<typeof BuildRadio>, number, number][] = [];
  const fieldIdToElement: Record<
    string,
    [
      ReturnType<typeof BuildSlider> | ReturnType<typeof BuildRadio>,
      Transformer,
    ]
  > = {};

  for (const [elType, nameOrOptions, y, x, fieldId, sliderParams] of elements) {
    if (elType === "slider") {
      const [
        min,
        max,
        step,
        transformerOut = identity,
        transformerIn = identity,
      ] = sliderParams;
      const slider = BuildSlider(
        nameOrOptions,
        scene,
        root,
        ctx,
        bb[y][x],
        (value) => {
          patchConnection?.sendEventOrValue(fieldId, transformerOut(value));
          patchConnection?.requestParameterValue(fieldId);
        },
        0,
        min,
        max,
        step,
        false
      );

      sliders.push([slider, y, x]);
      fieldIdToElement[fieldId] = [slider, transformerIn];
    } else if (elType === "radio") {
      const radio = BuildRadio(
        nameOrOptions,
        scene,
        ctx,
        bb[y][x],
        (value) => {
          patchConnection?.sendEventOrValue(fieldId, value);
          patchConnection?.requestParameterValue(fieldId);
        },
        0,
        true,
        false
      );

      radios.push([radio, y, x]);
      fieldIdToElement[fieldId] = [radio, identity];
    }
  }

  const paramsUpdated = ({
    endpointID,
    value,
  }: {
    endpointID: string;
    value: number;
  }) => {
    if (!fieldIdToElement[endpointID]) {
      return;
    }
    const [element, transformer] = fieldIdToElement[endpointID];
    element.setValue(transformer(value));
  };

  patchConnection?.addAllParameterListener(paramsUpdated);

  for (const [elType, nameOrOptions, y, x, fieldId, sliderParams] of elements) {
    patchConnection?.requestParameterValue(fieldId);
  }

  return {
    resize: () => {
      const bb = [
        splitBoundingBoxHorizontal(8, getBoundingBoxTop()),
        splitBoundingBoxHorizontal(8, getBoundingBoxBottom()),
      ];
      for (const [slider, y, x] of sliders) {
        slider.setBoundingBox(bb[y][x]);
      }
      for (const [radio, y, x] of radios) {
        radio.setBoundingBox(bb[y][x]);
      }
    },
    setVisible: (v: boolean) => {
      for (const [slider] of sliders) {
        slider.setVisible(v);
      }
      for (const [radio] of radios) {
        radio.setVisible(v);
      }
    },
    canvasDraw: () => {
      for (const [slider] of sliders) {
        slider.draw();
      }
      for (const [radio] of radios) {
        radio.draw();
      }
    },
  };
};
