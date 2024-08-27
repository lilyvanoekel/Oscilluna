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
import { wrapWaveform, generateWaveform } from "./domain/dsp.js";

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
  const directRender = false;

  const clipPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -boundingBox.left),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), boundingBox.right),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), boundingBox.top),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -boundingBox.bottom),
  ];

  const midpointY = (boundingBox.top + boundingBox.bottom) / 2;
  const startPoint = new THREE.Vector3(boundingBox.left, midpointY, 0);
  const endPoint = new THREE.Vector3(boundingBox.right, midpointY, 0);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    startPoint,
    endPoint,
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const horizontalLine = new THREE.Line(lineGeometry, lineMaterial);
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
    if (!isDrawing) {
      return;
    }
    isDrawing = false;
    if (line) {
      scene.remove(line);
      line.geometry.dispose();
    }
    if (points.length > 2) {
      const waveform = generateWaveform(points, boundingBox);
      const controlPoints = generateCatmullRomControlPoints(waveform);
      for (let i = 0; i < NUMBER_OF_POINTS; i++) {
        patchConnection?.sendEventOrValue(
          `${pointPrefix}_${i}`,
          controlPoints[i]
        );
        patchConnection?.requestParameterValue(`${pointPrefix}_${i}`);
      }

      if (directRender) {
        const decodedWaveform = decodeCatmullRom(controlPoints, 1024);
        displayWaveform(wrapWaveform(decodedWaveform.map((x) => x / 2)));
      }
    }
  };

  const controlPoints = Array(NUMBER_OF_POINTS).fill(0.0);
  const updateWave = debounce(() => {
    const decodedWaveform = decodeCatmullRom(controlPoints, 1024);
    displayWaveform(wrapWaveform(decodedWaveform.map((x) => x / 2)));
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
    if (isDrawing) {
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
    }
  };

  const displayWaveform = (waveform) => {
    if (waveformLine) {
      scene.remove(waveformLine);
      waveformLine.geometry.dispose();
    }

    const boxWidth = boundingBox.right - boundingBox.left;
    const boxHeight = boundingBox.top - boundingBox.bottom;
    const adjustedHeight = boxHeight * 0.9;
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

  return {};
};
