import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { mockPatchConnection } from "./mock-patch-connection";

import { getBoundingBoxTop, getBoundingBoxBottom } from "./domain/layout";

import { BuildMenu } from "./menu/menu";
import { BuildScreenWave } from "./screens/screen-wave";
import { BuildScreenTune } from "./screens/screen-tune";
import { BuildScreenAdsr } from "./screens/screen-adsr";

import "./styles/main.css";

declare global {
  interface Element {
    CmajorSingletonPatchConnection?: any;
  }
}

let patchConnection: any = undefined;

const params = {
  threshold: 0,
  strength: 1.5,
  radius: 0,
};

const initThree = (
  root: HTMLElement
): [
  THREE.Scene,
  THREE.OrthographicCamera,
  THREE.WebGLRenderer,
  EffectComposer,
] => {
  const width = root.clientWidth;
  const height = root.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000
  );
  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.localClippingEnabled = true;
  root.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    params.strength,
    params.radius,
    params.threshold
  );
  composer.addPass(bloomPass);
  animate(composer)();
  return [scene, camera, renderer, composer];
};

const animate = (composer: EffectComposer) => () => {
  requestAnimationFrame(animate(composer));
  composer.render();
};

document.addEventListener("DOMContentLoaded", () => {
  if (
    window.frameElement &&
    window.frameElement.CmajorSingletonPatchConnection
  ) {
    patchConnection = window.frameElement.CmajorSingletonPatchConnection;
  } else {
    patchConnection = mockPatchConnection;
  }

  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  const [scene, camera, renderer, composer] = initThree(root);

  const screenWave = BuildScreenWave(
    patchConnection,
    scene,
    root,
    getBoundingBoxTop,
    getBoundingBoxBottom
  );

  const screenTune = BuildScreenTune(patchConnection);

  const screenAdsr = BuildScreenAdsr(
    patchConnection,
    scene,
    root,
    getBoundingBoxTop,
    getBoundingBoxBottom
  );

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D; // @todo: get away with this casting
  const menu = BuildMenu(canvas, ctx, (currentTab: number) => {
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
    if (!canvas || !ctx) {
      return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    menu.draw();
  };

  window.addEventListener("resize", onWindowResize, false);
  redraw();
  menu.triggerTabUpdate();
});
