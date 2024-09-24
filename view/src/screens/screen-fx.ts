import * as THREE from "three";

import { dbToLinear, linearToDb } from "../domain/dsp";
import {
  BoundingBox,
  splitBoundingBoxHorizontal,
  xUnits,
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
    ["radio", ["Off", "On"], 0, 0, "chorus_enabled"],
    ["slider", "\nRate", 0, 1, "chorus_rate", [0.1, 6, 0.01]],
    ["slider", "\nDepth", 0, 2, "chorus_depth", [0.0, 1, 0.01]],
    ["radio", ["Off", "On"], 0, 3, "phaser_enabled"],
    ["slider", "\nRate", 0, 4, "phaser_rate", [0.1, 2, 0.01]],
    ["slider", "\nSpread", 0, 5, "phaser_spread", [0.0, 1, 0.01]],
    ["slider", "\nCoef", 0, 6, "phaser_coef", [0.2, 0.8, 0.05]],
    ["slider", "\nDepth", 0, 7, "phaser_depth", [0.0, 1, 0.01]],
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

  // @todo: logic here is duplicated from slider, extract
  const renderTextInBoundingBox = (boundingBox: BoundingBox, text: string) => {
    const fontSize = Math.round(xUnits(22));
    const margin = xUnits(8);
    const textHeightAdjustment = fontSize * 0.75;
    const line1Y = textHeightAdjustment + margin;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const centerX = (boundingBox.left + boundingBox.right) / 2;
    const centerY = boundingBox.top;

    const textX = canvasWidth / 2 + centerX;
    const textY = canvasHeight / 2 - centerY;

    ctx.font = `${fontSize}px Consolas, monospace`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(text, textX, textY + line1Y);
  };

  const renderLabels = () => {
    if (!isVisible) {
      return;
    }
    const bb = splitBoundingBoxHorizontal(8, getBoundingBoxTop());
    renderTextInBoundingBox(bb[0], "Chorus");
    renderTextInBoundingBox(bb[3], "Phaser");
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
