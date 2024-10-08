import * as THREE from "three";

import {
  BoundingBox,
  renderTextInBoundingBox,
  splitBoundingBoxHorizontal,
} from "../domain/layout";
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

// @todo: plagiarized from screen-tune, generalize
export const BuildScreenFx = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  ctx: CanvasRenderingContext2D,
  getBoundingBoxTop: () => BoundingBox,
  getBoundingBoxBottom: () => BoundingBox
) => {
  let isVisible = false;
  const elements: ScreenElement[] = [
    ["radio", ["Off", "On"], 0, 0, "chorus_mode"],
    ["slider", "\nRate", 0, 1, "chorus_rate", [0.1, 6, 0.01]],
    ["slider", "\nDepth", 0, 2, "chorus_depth", [0.0, 1, 0.01]],
    ["slider", "\nFeedback", 0, 3, "chorus_feedback", [0.0, 1, 0.01]],
    ["radio", ["Off", "4 Stage", "8 Stage"], 0, 4, "phaser_mode"],
    ["slider", "\nRate", 0, 5, "phaser_rate", [0.1, 2, 0.01]],
    ["slider", "\nSpread", 0, 6, "phaser_spread", [0.0, 1, 0.01]],
    ["slider", "\nAmount", 0, 7, "phaser_amount", [0.0, 1, 0.01]],

    [
      "radio",
      ["Off", "Tiny", "Small", "Medium", "Large", "Hall"],
      1,
      0,
      "reverb_mode",
    ],
    ["slider", "\nDamping", 1, 1, "reverb_damping_factor", [0, 1, 0.01]],
    ["slider", "\nWidth", 1, 2, "reverb_width", [0, 1, 0.01]],
    ["slider", "\nDry/Wet", 1, 3, "reverb_wetdrymix", [0, 1, 0.01]],
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

  const renderLabels = () => {
    if (!isVisible) {
      return;
    }
    const bb = [
      splitBoundingBoxHorizontal(8, getBoundingBoxTop()),
      splitBoundingBoxHorizontal(8, getBoundingBoxBottom()),
    ];
    renderTextInBoundingBox(ctx, bb[0][0], "Chorus");
    renderTextInBoundingBox(ctx, bb[0][4], "Phaser");
    renderTextInBoundingBox(ctx, bb[1][0], "Reverb");
  };

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
      isVisible = v;
      for (const [slider] of sliders) {
        slider.setVisible(v);
      }
      for (const [radio] of radios) {
        radio.setVisible(v);
      }

      renderLabels();
    },
    canvasDraw: () => {
      for (const [slider] of sliders) {
        slider.draw();
      }
      for (const [radio] of radios) {
        radio.draw();
      }

      renderLabels();
    },
  };
};
