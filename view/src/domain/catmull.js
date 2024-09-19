export const NUMBER_OF_POINTS = 32;

export const generateCatmullRomControlPoints = (waveform) => {
  const controlPoints = [];
  const segmentCount = NUMBER_OF_POINTS - 1;
  const segmentLength = Math.floor(waveform.length / segmentCount);

  // Generate control points with circular wrap-around
  for (let i = 0; i <= segmentCount; i++) {
    let pointIndex = (i * segmentLength) % waveform.length;
    controlPoints.push(waveform[pointIndex]);
  }

  return controlPoints;
};

export const interpolateCatmullRom = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};

export const decodeCatmullRom = (controlPoints, length) => {
  const decodedWaveform = new Array(length).fill(0);
  const segmentCount = controlPoints.length;
  const segmentLength = length / segmentCount;

  for (let i = 0; i < length; i++) {
    const t = (i % segmentLength) / segmentLength;
    const segmentIndex = Math.floor(i / segmentLength);

    // Circular control point indexing
    const p0 = controlPoints[(segmentIndex - 1 + segmentCount) % segmentCount];
    const p1 = controlPoints[segmentIndex % segmentCount];
    const p2 = controlPoints[(segmentIndex + 1) % segmentCount];
    const p3 = controlPoints[(segmentIndex + 2) % segmentCount];

    decodedWaveform[i] = interpolateCatmullRom(p0, p1, p2, p3, t);
  }

  return decodedWaveform;
};
