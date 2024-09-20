import { BuildButton } from "./button";
import {
  buttonIconSine,
  buttonIconTuningFork,
  buttonIconADSR,
  buttonIconEQ,
  buttonIconFX,
} from "./button-icons";

export const BuildMenu = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  updateTab: (currentTab: number) => void
) => {
  let currentTab = 0;
  const buttons = [
    BuildButton(canvas, ctx, 12, 16, buttonIconSine, () => {
      currentTab = 0;
      updateActiveTab();
    }),
    BuildButton(canvas, ctx, 12, 102, buttonIconTuningFork, () => {
      currentTab = 1;
      updateActiveTab();
    }),
    BuildButton(canvas, ctx, 12, 188, buttonIconADSR, () => {
      currentTab = 2;
      updateActiveTab();
    }),
    BuildButton(canvas, ctx, 12, 274, buttonIconEQ, () => {
      currentTab = 3;
      updateActiveTab();
    }),
    BuildButton(canvas, ctx, 12, 360, buttonIconFX, () => {
      currentTab = 4;
      updateActiveTab();
    }),
  ];

  const updateActiveTab = () => {
    for (const button of buttons) {
      button.setActive(false);
    }

    buttons[currentTab].setActive(true);
    updateTab(currentTab);
  };

  return {
    draw: () => {
      for (const button of buttons) {
        button.draw();
      }
    },
    triggerTabUpdate: () => {
      updateActiveTab();
    },
  };
};
