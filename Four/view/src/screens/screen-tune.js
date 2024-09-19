import { xUnits } from "../domain/layout.js";

function linearToDb(linearValue) {
  if (linearValue <= 0) return -85;
  return 20 * Math.log10(linearValue);
}

function dbToLinear(dbValue) {
  return Math.pow(10, dbValue / 20);
}

const getRadiosByName = (name) =>
  document.querySelectorAll(`input[name="${name}"]`);

function setRadioValue(name, value) {
  const radios = getRadiosByName(name);
  radios.forEach((radio) => {
    if (radio.value == value) {
      radio.checked = true;
    }
  });
}

export const BuildScreenTune = (patchConnection) => {
  const parentDiv = document.getElementById("temporary-controls-tuning");
  parentDiv.style.left = `${Math.round(xUnits(100))}px`;

  const identity = (x) => x;
  const paramTransformers = {
    osc1_level: [(x) => linearToDb(x / 100), (x) => dbToLinear(x) * 100],
    osc2_level: [(x) => linearToDb(x / 100), (x) => dbToLinear(x) * 100],
  };

  const supportedParams = [
    ...Object.keys(paramTransformers),
    "osc1_coarse",
    "osc1_fine",
    "osc2_coarse",
    "osc2_fine",
    "fm_depth",
    "fm_direction",
    "osc1_vibrato_rate",
    "osc2_vibrato_rate",
    "osc1_vibrato_depth",
    "osc2_vibrato_depth",
    "osc1_feedback_fm",
    "osc2_feedback_fm",
  ];

  const paramsUpdated = ({ endpointID, value }) => {
    if (!supportedParams.includes(endpointID)) {
      return;
    }

    if (endpointID === "fm_direction") {
      setRadioValue("fm_direction", value);
      return;
    }

    const transformer = paramTransformers[endpointID]?.[1] ?? identity;
    document.getElementById(endpointID).value = transformer(value);
  };

  patchConnection?.addAllParameterListener(paramsUpdated);

  for (const param of supportedParams) {
    if (param === "fm_direction") {
      const radios = getRadiosByName("fm_direction");
      radios.forEach((radio) => {
        radio.addEventListener("change", (event) => {
          const selectedValue = event.target.value;
          patchConnection?.sendEventOrValue(param, selectedValue);
          patchConnection?.requestParameterValue(param);
        });
      });
    } else {
      document.getElementById(param).addEventListener("change", function () {
        const transformer = paramTransformers[param]?.[0] ?? identity;
        patchConnection?.sendEventOrValue(param, transformer(this.value));
        patchConnection?.requestParameterValue(param);
      });
    }

    patchConnection?.requestParameterValue(param);
  }

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
