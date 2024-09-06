import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { mockPatchConnection } from "./mock-patch-connection.js";

import { xUnits } from "./domain/layout.js";

import { BuildMenu } from "./menu.js";
import { BuildScreenWave } from "./screens/screen-wave.js";
import { BuildScreenTune } from "./screens/screen-tune.js";
import { BuildScreenAdsr } from "./screens/screen-adsr.js";

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
};

const animate = () => {
  requestAnimationFrame(animate);
  composer.render();
};

const getBoundingBoxTop = () => ({
  left: -window.innerWidth / 2 + xUnits(100),
  right: window.innerWidth / 2 - xUnits(14),
  top: window.innerHeight / 2 - 18,
  bottom: 0 + 18,
});

const getBoundingBoxBottom = () => ({
  left: -window.innerWidth / 2 + xUnits(100),
  right: window.innerWidth / 2 - xUnits(14),
  top: 0 - 18,
  bottom: -window.innerHeight / 2 + 18,
});

document.addEventListener("DOMContentLoaded", () => {
  if (
    window.frameElement &&
    window.frameElement.CmajorSingletonPatchConnection
  ) {
    patchConnection = window.frameElement.CmajorSingletonPatchConnection;
  } else {
    patchConnection = mockPatchConnection;
  }

  initThree();

  const screenWave = BuildScreenWave(
    patchConnection,
    scene,
    getBoundingBoxTop,
    getBoundingBoxBottom
  );

  const screenTune = BuildScreenTune();

  const screenAdsr = BuildScreenAdsr(
    patchConnection,
    scene,
    getBoundingBoxTop,
    getBoundingBoxBottom
  );

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const menu = BuildMenu(canvas, ctx, (currentTab) => {
    if (currentTab === 0) {
      screenWave.setVisible(true);
    } else {
      screenWave.setVisible(false);
    }

    if (currentTab === 1) {
      screenTune.setVisible(true);
    } else {
      screenTune.setVisible(false);
    }

    if (currentTab === 2) {
      screenAdsr.setVisible(true);
    } else {
      screenAdsr.setVisible(false);
    }
  });

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

    screenWave.resize();
    screenTune.resize();
    screenAdsr.resize();

    redraw();
  };

  const redraw = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    menu.draw();
  };

  window.addEventListener("resize", onWindowResize, false);
  redraw();
  menu.triggerTabUpdate();
});
