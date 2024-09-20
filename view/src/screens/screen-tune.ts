import { dbToLinear, linearToDb } from "../domain/dsp";
import { xUnits } from "../domain/layout";

const getRadiosByName = (name: string): NodeListOf<HTMLInputElement> =>
  document.querySelectorAll(`input[name="${name}"]`);

function setRadioValue(name: string, value: any) {
  const radios = getRadiosByName(name);
  radios.forEach((radio) => {
    if (radio.value == value) {
      radio.checked = true;
    }
  });
}

export const BuildScreenTune = (patchConnection: any) => {
  const parentDiv = document.getElementById(
    "temporary-controls-tuning"
  ) as HTMLElement;
  parentDiv.style.left = `${Math.round(xUnits(100))}px`;

  const identity = <T>(x: T): T => x;
  type Transformer = (x: number) => number;
  const paramTransformers: Record<string, [Transformer, Transformer]> = {
    osc1_level: [
      (x: number) => linearToDb(x / 100),
      (x: number) => dbToLinear(x) * 100,
    ],
    osc2_level: [
      (x: number) => linearToDb(x / 100),
      (x: number) => dbToLinear(x) * 100,
    ],
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

  const paramsUpdated = ({
    endpointID,
    value,
  }: {
    endpointID: string;
    value: number;
  }) => {
    if (!supportedParams.includes(endpointID)) {
      return;
    }

    if (endpointID === "fm_direction") {
      setRadioValue("fm_direction", value);
      return;
    }

    const transformer = paramTransformers[endpointID]?.[1] ?? identity;
    const el = document.getElementById(endpointID) as HTMLInputElement;
    el.value = `${transformer(value)}`;
  };

  patchConnection?.addAllParameterListener(paramsUpdated);

  for (const param of supportedParams) {
    if (param === "fm_direction") {
      const radios = getRadiosByName("fm_direction");
      radios.forEach((radio) => {
        radio.addEventListener("change", (event) => {
          const target = event.target as HTMLInputElement;
          const selectedValue = target.value;
          patchConnection?.sendEventOrValue(param, selectedValue);
          patchConnection?.requestParameterValue(param);
        });
      });
    } else {
      document.getElementById(param)?.addEventListener("change", function () {
        const transformer = paramTransformers[param]?.[0] ?? identity;
        const element = this as HTMLInputElement;
        patchConnection?.sendEventOrValue(
          param,
          transformer(parseFloat(element.value))
        );
        patchConnection?.requestParameterValue(param);
      });
    }

    patchConnection?.requestParameterValue(param);
  }

  return {
    resize: () => {
      parentDiv.style.left = `${Math.round(xUnits(100))}px`;
    },
    setVisible: (v: boolean) => {
      if (v) {
        parentDiv.style.display = "block";
      } else {
        parentDiv.style.display = "none";
      }
    },
  };
};
