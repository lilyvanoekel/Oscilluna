import * as THREE from "three";

import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

import { debounce } from "./domain/debounce.js";
import {
  NUMBER_OF_POINTS,
  generateCatmullRomControlPoints,
  decodeCatmullRom,
} from "./domain/catmull.js";
import {
  normalizeWaveform,
  generateWaveform,
  generateSineWaveControlPoints,
  generateSquareWaveControlPoints,
  generateSawtoothWaveControlPoints,
  generateTriangleWaveControlPoints,
} from "./domain/dsp.js";

export const BuildWaveDrawer = (
  patchConnection,
  scene,
  root,
  boundingBox,
  pointPrefix
) => {
  let isDrawing = false;
  let points = [];
  let line, waveformLine;
  let currentWaveform = null;
  let isVisible = true;

  const standardWaves = [
    generateSineWaveControlPoints(NUMBER_OF_POINTS),
    generateSquareWaveControlPoints(NUMBER_OF_POINTS),
    generateSawtoothWaveControlPoints(NUMBER_OF_POINTS),
    generateTriangleWaveControlPoints(NUMBER_OF_POINTS),
  ];
  let currentStandardWave = 0;

  const clipPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -boundingBox.left),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), boundingBox.right),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), boundingBox.top),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -boundingBox.bottom),
  ];

  let midpointY = (boundingBox.top + boundingBox.bottom) / 2;
  let startPoint = new THREE.Vector3(boundingBox.left, midpointY, 0);
  let endPoint = new THREE.Vector3(boundingBox.right, midpointY, 0);

  const lineGeometry = new LineGeometry();
  lineGeometry.setPositions([
    startPoint.x,
    startPoint.y,
    startPoint.z,
    endPoint.x,
    endPoint.y,
    endPoint.z,
  ]);

  const lineMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 1,
    dashed: true,
    gapSize: 2,
    dashSize: 4,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
  });

  const horizontalLine = new Line2(lineGeometry, lineMaterial);
  horizontalLine.computeLineDistances();
  scene.add(horizontalLine);

  const materialCyan = new LineMaterial({
    color: 0x00ffff,
    linewidth: 2,
    dashed: false,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    clippingPlanes: clipPlanes,
  });

  const materialPurple = new LineMaterial({
    color: 0xff00ff,
    linewidth: 10,
    dashed: false,
    transparent: true,
    opacity: 1.0,
    blending: THREE.NormalBlending,
    clippingPlanes: clipPlanes,
  });

  const onMouseDown = (event) => {
    if (!isVisible) {
      return;
    }

    // Get the mouse position relative to the center of the screen
    const rect = root.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - window.innerWidth / 2;
    const mouseY = window.innerHeight / 2 - (event.clientY - rect.top);

    // Check if the mouse position is within the bounding box
    if (
      mouseX >= boundingBox.left &&
      mouseX <= boundingBox.right &&
      mouseY >= boundingBox.bottom &&
      mouseY <= boundingBox.top
    ) {
      isDrawing = true;
      points = [];
      if (waveformLine) {
        scene.remove(waveformLine);
        waveformLine.geometry.dispose();
      }
    }
  };

  const onMouseUp = () => {
    if (!isVisible || !isDrawing) {
      return;
    }

    isDrawing = false;
    if (line) {
      scene.remove(line);
      line.geometry.dispose();
    }

    let controlPoints;
    if (points.length <= 2 || points.every((val) => val.y === points[0].y)) {
      currentStandardWave = (currentStandardWave + 1) % standardWaves.length;
      controlPoints = standardWaves[currentStandardWave];
    } else {
      const waveform = generateWaveform(points, boundingBox);
      controlPoints = generateCatmullRomControlPoints(waveform);
    }
    for (let i = 0; i < NUMBER_OF_POINTS; i++) {
      patchConnection?.sendEventOrValue(
        `${pointPrefix}_${i}`,
        controlPoints[i]
      );
      patchConnection?.requestParameterValue(`${pointPrefix}_${i}`);
    }
  };

  const controlPoints = Array(NUMBER_OF_POINTS).fill(0.0);
  const updateWave = debounce(() => {
    const decodedWaveform = decodeCatmullRom(controlPoints, 1024);
    currentWaveform = normalizeWaveform(decodedWaveform);
    displayWaveform();
  }, 300);

  const paramsUpdated = ({ endpointID, value }) => {
    const match = endpointID.match(new RegExp(`^${pointPrefix}_(\\d+)`));
    if (match) {
      const index = parseInt(match[1], 10);
      controlPoints[index] = value;
      updateWave();
    }
  };

  const onMouseMove = (event) => {
    if (!isVisible || !isDrawing) {
      return;
    }

    const rect = root.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = height / 2 - (event.clientY - rect.top);

    points.push(new THREE.Vector3(mouseX, mouseY, 0));

    if (line) {
      scene.remove(line);
      line.geometry.dispose();
    }

    const positions = [];
    points.forEach((point) => {
      positions.push(point.x, point.y, point.z);
    });

    const geometry2 = new LineGeometry();
    geometry2.setPositions(positions);

    line = new Line2(geometry2, materialPurple);
    scene.add(line);
  };

  const displayWaveform = () => {
    if (!currentWaveform || !isVisible) {
      return;
    }

    const waveform = currentWaveform;
    if (waveformLine) {
      scene.remove(waveformLine);
      waveformLine.geometry.dispose();
    }

    const boxWidth = boundingBox.right - boundingBox.left;
    const boxHeight = boundingBox.top - boundingBox.bottom;
    const adjustedHeight = boxHeight * 0.5;
    const yOffset = (boxHeight - adjustedHeight) / 2;

    const positions = [];
    const numPoints = waveform.length;

    for (let i = 0; i < numPoints; i++) {
      const x = boundingBox.left + (i / (numPoints - 1)) * boxWidth;
      const y =
        boundingBox.bottom + yOffset + (waveform[i] + 0.5) * adjustedHeight;

      positions.push(x, y, 0);
    }

    const geometry2 = new LineGeometry();
    geometry2.setPositions(positions);

    waveformLine = new Line2(geometry2, materialCyan);
    scene.add(waveformLine);
  };

  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);

  patchConnection?.addAllParameterListener(paramsUpdated);
  for (let i = 0; i < NUMBER_OF_POINTS; i++) {
    patchConnection?.requestParameterValue(`${pointPrefix}_${i}`);
  }

  return {
    setBoundingBox: (b) => {
      boundingBox = b;
      clipPlanes[0].set(new THREE.Vector3(1, 0, 0), -boundingBox.left);
      clipPlanes[1].set(new THREE.Vector3(-1, 0, 0), boundingBox.right);
      clipPlanes[2].set(new THREE.Vector3(0, -1, 0), boundingBox.top);
      clipPlanes[3].set(new THREE.Vector3(0, 1, 0), -boundingBox.bottom);

      midpointY = (boundingBox.top + boundingBox.bottom) / 2;
      startPoint.set(boundingBox.left, midpointY, 0);
      endPoint.set(boundingBox.right, midpointY, 0);

      lineGeometry.setPositions([
        startPoint.x,
        startPoint.y,
        startPoint.z,
        endPoint.x,
        endPoint.y,
        endPoint.z,
      ]);

      displayWaveform();
    },
    setVisible: (v) => {
      if (v == isVisible) {
        return;
      }
      isVisible = v;

      if (isVisible) {
        scene.add(horizontalLine);
        displayWaveform();
      } else {
        scene.remove(horizontalLine);
        if (waveformLine) {
          scene.remove(waveformLine);
          waveformLine.geometry.dispose();
        }
      }
    },
  };
};
