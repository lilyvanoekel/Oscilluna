import { BuildButton } from "./button.js";
import {
  buttonIconSine,
  buttonIconTuningFork,
  buttonIconADSR,
  buttonIconEQ,
} from "./button-icons.js";

export const BuildMenu = (xUnits, canvas, ctx, updateTab) => {
  let currentTab = 0;
  const buttons = [
    BuildButton(canvas, ctx, xUnits, 12, 16, buttonIconSine(xUnits), () => {
      currentTab = 0;
      updateActiveTab();
    }),
    BuildButton(
      canvas,
      ctx,
      xUnits,
      12,
      102,
      buttonIconTuningFork(xUnits),
      () => {
        currentTab = 1;
        updateActiveTab();
      }
    ),
    BuildButton(canvas, ctx, xUnits, 12, 188, buttonIconADSR(xUnits), () => {
      currentTab = 2;
      updateActiveTab();
    }),
    BuildButton(canvas, ctx, xUnits, 12, 274, buttonIconEQ(xUnits), () => {
      currentTab = 3;
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
