import * as THREE from "three";

import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { debounce } from "./domain/debounce.js";
import {
  NUMBER_OF_POINTS,
  generateCatmullRomControlPoints,
  decodeCatmullRom,
} from "./domain/catmull.js";
import { wrapWaveform, generateWaveform } from "./domain/dsp.js";

import "./styles/main.css";

let patchConnection = undefined;

let isDrawing = false;
let points = [];
let line, waveformLine;
let scene, camera, renderer, composer;
let bloomPass;
const params = {
  threshold: 0,
  strength: 1.5,
  radius: 0,
};

const materialCyan = new LineMaterial({
  color: 0x00ffff,
  linewidth: 2,
  dashed: false,
  transparent: true,
  opacity: 1.0,
  blending: THREE.AdditiveBlending,
});

const materialPurple = new LineMaterial({
  color: 0xff00ff,
  linewidth: 10,
  dashed: false,
  transparent: true,
  opacity: 1.0,
  blending: THREE.NormalBlending,
});

const initThree = () => {
  const root = document.getElementById("root");
  const width = root.clientWidth;
  const height = root.clientHeight;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000
  );
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  root.appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    params.strength,
    params.radius,
    params.threshold
  );
  composer.addPass(bloomPass);

  animate();

  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);
};

const onWindowResize = () => {
  const root = document.getElementById("root");
  const width = root.clientWidth;
  const height = root.clientHeight;

  camera.left = width / -2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = height / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
};

const animate = () => {
  requestAnimationFrame(animate);
  composer.render();
};

const onMouseDown = () => {
  isDrawing = true;
  points = [];
  if (waveformLine) {
    scene.remove(waveformLine);
    waveformLine.geometry.dispose();
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
    const waveform = generateWaveform(points);
    const controlPoints = generateCatmullRomControlPoints(waveform);
    for (let i = 0; i < NUMBER_OF_POINTS; i++) {
      patchConnection?.sendEventOrValue(`point1_${i}`, controlPoints[i]);
      patchConnection?.requestParameterValue(`point1_${i}`);
    }
  }
};

const controlPoints = Array(NUMBER_OF_POINTS).fill(0.0);
const updateWave = debounce(() => {
  const decodedWaveform = decodeCatmullRom(controlPoints, 1024);
  displayWaveform(wrapWaveform(decodedWaveform.map((x) => x / 2)));
}, 300);

const paramsUpdated = ({ endpointID, value }) => {
  const match = endpointID.match(/^point1_(\d+)/);
  if (match) {
    const index = parseInt(match[1], 10);
    controlPoints[index] = value;
    updateWave();
  }
};

const onMouseMove = (event) => {
  if (isDrawing) {
    const root = document.getElementById("root");
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

  const root = document.getElementById("root");
  const width = root.clientWidth;
  const height = root.clientHeight;

  const positions = [];
  const numPoints = waveform.length;

  for (let i = 0; i < numPoints; i++) {
    const x = (i / numPoints) * width - width / 2;
    const y = waveform[i] * height;
    positions.push(x, y, 0);
  }

  const geometry2 = new LineGeometry();
  geometry2.setPositions(positions);

  waveformLine = new Line2(geometry2, materialCyan);
  scene.add(waveformLine);
};

document.addEventListener("DOMContentLoaded", function () {
  if (
    window.frameElement &&
    window.frameElement.CmajorSingletonPatchConnection
  ) {
    patchConnection = window.frameElement.CmajorSingletonPatchConnection;
  }

  patchConnection?.addAllParameterListener(paramsUpdated);
  for (let i = 0; i < NUMBER_OF_POINTS; i++) {
    patchConnection?.requestParameterValue(`point1_${i}`);
  }

  initThree();
});
