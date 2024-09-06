import { xUnits } from "../domain/layout.js";

export const BuildScreenTune = () => {
  const parentDiv = document.getElementById("temporary-controls-tuning");
  parentDiv.style.left = `${Math.round(xUnits(100))}px`;
  return {
    resize: () => {
      parentDiv.style.left = `${Math.round(xUnits(100))}px`;
    },
    setVisible: (v) => {
      if (v) {
        parentDiv.style.display = "block";
      } else {
        parentDiv.style.display = "none";
      }
    },
  };
};
