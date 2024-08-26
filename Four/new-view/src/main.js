import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { BuildWaveDrawer } from "./wave-drawer.js";

import "./styles/main.css";

let patchConnection = undefined;

let scene, camera, renderer, composer;
let bloomPass;
const params = {
  threshold: 0,
  strength: 1.5,
  radius: 0,
};

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
  renderer.localClippingEnabled = true;
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

document.addEventListener("DOMContentLoaded", function () {
  if (
    window.frameElement &&
    window.frameElement.CmajorSingletonPatchConnection
  ) {
    patchConnection = window.frameElement.CmajorSingletonPatchConnection;
  }

  initThree();

  const boundingBoxTop = {
    left: -window.innerWidth / 2,
    right: window.innerWidth / 2,
    top: window.innerHeight / 2,
    bottom: 0,
  };

  const boundingBoxBottom = {
    left: -window.innerWidth / 2,
    right: window.innerWidth / 2,
    top: 0,
    bottom: -window.innerHeight / 2,
  };

  BuildWaveDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    boundingBoxTop,
    "point1"
  );

  BuildWaveDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    boundingBoxBottom,
    "point2"
  );
});
