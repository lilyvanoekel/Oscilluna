import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { BuildButton } from "./button.js";
import {
  buttonIconSine,
  buttonIconTuningFork,
  buttonIconADSR,
  buttonIconEQ,
} from "./button-icons.js";
import { BuildWaveDrawer } from "./wave-drawer.js";
import { BuildADSRDrawer } from "./adsr-drawer.js";
import { mockPatchConnection } from "./mock-patch-connection.js";

import "./styles/main.css";

let patchConnection = undefined;
let scene, camera, renderer, composer;
let bloomPass;
let currentTab = 0;

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

const xUnits = (units) => {
  return (units * window.innerWidth) / 1024;
};

const yUnits = (units) => {
  return (units * window.innerHeight) / 1024;
};

const getBoundingBoxTop = () => ({
  left: -window.innerWidth / 2 + xUnits(100),
  right: window.innerWidth / 2 - xUnits(14),
  top: window.innerHeight / 2 - 20,
  bottom: 0 + 20,
});

const getBoundingBoxBottom = () => ({
  left: -window.innerWidth / 2 + xUnits(100),
  right: window.innerWidth / 2 - xUnits(14),
  top: 0 - 20,
  bottom: -window.innerHeight / 2 + 20,
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

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const buttons = [
    BuildButton(canvas, ctx, xUnits, 12, 16, buttonIconSine(xUnits), () => {
      currentTab = 0;
      updateActiveTab();
    }),
    BuildButton(
      canvas,
      ctx,
      xUnits,
      12,
      102,
      buttonIconTuningFork(xUnits),
      () => {
        currentTab = 1;
        updateActiveTab();
      }
    ),
    BuildButton(canvas, ctx, xUnits, 12, 188, buttonIconADSR(xUnits), () => {
      currentTab = 2;
      updateActiveTab();
    }),
    BuildButton(canvas, ctx, xUnits, 12, 274, buttonIconEQ(xUnits), () => {
      currentTab = 3;
      updateActiveTab();
    }),
  ];

  initThree();

  const drawer1 = BuildWaveDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxTop(),
    "point1"
  );

  const drawer2 = BuildWaveDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxBottom(),
    "point2"
  );

  const adsr1 = BuildADSRDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxTop(),
    "potato"
  );

  const adsr2 = BuildADSRDrawer(
    patchConnection,
    scene,
    document.getElementById("root"),
    getBoundingBoxBottom(),
    "potato"
  );

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

    drawer1.setBoundingBox(getBoundingBoxTop());
    drawer2.setBoundingBox(getBoundingBoxBottom());

    adsr1.setBoundingBox(getBoundingBoxTop());
    adsr2.setBoundingBox(getBoundingBoxBottom());

    redraw();
  };

  const updateActiveTab = () => {
    for (const button of buttons) {
      button.setActive(false);
    }

    buttons[currentTab].setActive(true);

    if (currentTab === 0) {
      drawer1.setVisible(true);
      drawer2.setVisible(true);
    } else {
      drawer1.setVisible(false);
      drawer2.setVisible(false);
    }

    if (currentTab === 2) {
      adsr1.setVisible(true);
      adsr2.setVisible(true);
    } else {
      adsr1.setVisible(false);
      adsr2.setVisible(false);
    }
  };

  const redraw = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const button of buttons) {
      button.draw();
    }
  };

  window.addEventListener("resize", onWindowResize, false);
  redraw();
  updateActiveTab();
});
