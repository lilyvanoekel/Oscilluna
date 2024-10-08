import { BoundingBox } from "./layout";

export const wrapWaveform = (waveform: number[], shiftAmount = 512) => {
  const length = waveform.length;

  // Ensure shiftAmount is within bounds
  const shift = shiftAmount % length;

  // Split the waveform into two parts and rearrange them
  const part1 = waveform.slice(shift);
  const part2 = waveform.slice(0, shift);

  // Combine the parts to create the wrapped waveform
  const wrappedWaveform = part1.concat(part2);

  return wrappedWaveform;
};

export const normalizeWaveform = (waveform: number[]) => {
  const mean =
    waveform.reduce((sum, value) => sum + value, 0) / waveform.length;
  const waveform2 = waveform.map((value) => value - mean);
  const maxAbsValue = Math.max(...waveform2.map(Math.abs));
  return waveform2.map((value) => value / maxAbsValue);
};

export const generateWaveform = (
  points: { x: number; y: number }[],
  boundingBox: BoundingBox
) => {
  const numPoints = points.length;
  const targetLength = 1024;
  const waveform = [];

  const interpolate = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number
  ) => {
    return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
  };

  const scale = (numPoints - 1) / (targetLength - 1);
  const boxHeight = boundingBox.top - boundingBox.bottom;

  for (let i = 0; i < targetLength; i++) {
    const x = i * scale;
    const x1 = Math.floor(x);
    const x2 = Math.ceil(x);

    if (x1 === x2) {
      waveform.push((points[x1].y - boundingBox.bottom) / boxHeight);
    } else {
      const y1 = (points[x1].y - boundingBox.bottom) / boxHeight;
      const y2 = (points[x2].y - boundingBox.bottom) / boxHeight;
      waveform.push(interpolate(x1, y1, x2, y2, x));
    }
  }

  const target = waveform[0] - waveform[1023];
  for (let i = 0; i < targetLength; i++) {
    waveform[i] += (i / targetLength) * target;
  }

  return normalizeWaveform(waveform);
};

export const generateSineWaveControlPoints = (numberOfPoints: number) => {
  const controlPoints: number[] = [];
  const step = (2 * Math.PI) / numberOfPoints;

  for (let i = 0; i < numberOfPoints; i++) {
    const x = i * step;
    const y = Math.sin(x);
    controlPoints.push(y);
  }

  return controlPoints;
};

export const generateSquareWaveControlPoints = (numberOfPoints: number) => {
  const controlPoints: number[] = [];

  for (let i = 0; i < numberOfPoints; i++) {
    const y = i < numberOfPoints / 2 ? 1 : -1;
    controlPoints.push(y);
  }

  return controlPoints;
};

export const generateSawtoothWaveControlPoints = (numberOfPoints: number) => {
  const controlPoints: number[] = [];

  for (let i = 0; i < numberOfPoints; i++) {
    const y = 2 * (i / numberOfPoints) - 1;
    controlPoints.push(y);
  }

  return controlPoints;
};

export const generateTriangleWaveControlPoints = (numberOfPoints: number) => {
  const controlPoints: number[] = [];

  for (let i = 0; i < numberOfPoints; i++) {
    let phase = i / numberOfPoints;
    let y = 2 * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - 1;
    controlPoints.push(y);
  }

  return controlPoints;
};

export const linearToDb = (linearValue: number) => {
  if (linearValue <= 0) return -85;
  return 20 * Math.log10(linearValue);
};

export const dbToLinear = (dbValue: number) => {
  return Math.pow(10, dbValue / 20);
};
