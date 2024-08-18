import React from "react";
import { createRoot } from "react-dom/client";
import View from "./View";
import * as THREE from "three";

// (async () => {
//   let CmajorSingletonPatchConnection = undefined;

//   if (window.frameElement && window.frameElement.CmajorSingletonPatchConnection)
//     CmajorSingletonPatchConnection =
//       window.frameElement.CmajorSingletonPatchConnection;

//   const container = document.getElementById("root");
//   const root = createRoot(container);
//   root.render(<View patchConnection={CmajorSingletonPatchConnection} />);
// })();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.TorusKnotGeometry(100, 90, 200, 64);
var material = new THREE.MeshNormalMaterial({
  /* color: 0xffaa00, */ wireframe: true,
  /* shading: THREE.SmoothShading, */
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 200;
/*camera.position.x = 10;
camera.position.y = 10;*/

function render() {
  requestAnimationFrame(render);

  mesh.rotation.x += 0.0025;
  mesh.rotation.y += 0.0025;

  renderer.render(scene, camera);
}
render();
