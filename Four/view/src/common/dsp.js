export const wrapWaveform = (waveform, shiftAmount = 512) => {
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

export const normalizeWaveform = (waveform) => {
  const mean =
    waveform.reduce((sum, value) => sum + value, 0) / waveform.length;
  const waveform2 = waveform.map((value) => value - mean);
  const maxAbsValue = Math.max(...waveform2.map(Math.abs));
  return waveform2.map((value) => value / maxAbsValue);
};

export const generateWaveform = (points) => {
  const numPoints = points.length;
  const targetLength = 1024;
  const waveform = [];

  // Function to perform linear interpolation
  const interpolate = (x1, y1, x2, y2, x) => {
    return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
  };

  // Scale factor to map the original points to the target length
  const scale = (numPoints - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const x = i * scale;
    const x1 = Math.floor(x);
    const x2 = Math.ceil(x);

    if (x1 === x2) {
      waveform.push(points[x1].y / window.innerHeight);
    } else {
      const y1 = points[x1].y / window.innerHeight;
      const y2 = points[x2].y / window.innerHeight;
      waveform.push(interpolate(x1, y1, x2, y2, x));
    }
  }

  const target = waveform[0] - waveform[1023];
  for (let i = 0; i < targetLength; i++) {
    waveform[i] += (i / targetLength) * target;
  }

  return normalizeWaveform(waveform);
};
