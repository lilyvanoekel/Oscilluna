import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { debounce } from "./common/debounce.js";
import {
  NUMBER_OF_POINTS,
  generateCatmullRomControlPoints,
  decodeCatmullRom,
} from "./common/catmull.js";
import { wrapWaveform, generateWaveform } from "./common/dsp.js";

const DrawShapeToWaveform = ({ patchConnection }) => {
  const mountRef = useRef(null);
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

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
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
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Effect Composer and Bloom setup
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

    window.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mouseup", onMouseUp, false);
    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("resize", onWindowResize, false);

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onWindowResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

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
        patchConnection?.sendEventOrValue(`point${i}`, controlPoints[i]);
        patchConnection?.requestParameterValue(`point${i}`);
      }
    }
  };

  const controlPoints = Array(NUMBER_OF_POINTS).fill(0.0);
  const updateWave = debounce(() => {
    const decodedWaveform = decodeCatmullRom(controlPoints, 1024);
    displayWaveform(wrapWaveform(decodedWaveform.map((x) => x / 2)));
  }, 300);

  const paramsUpdated = ({ endpointID, value }) => {
    const match = endpointID.match(/^point(\d+)/);
    if (match) {
      const index = parseInt(match[1], 10);
      controlPoints[index] = value;
      updateWave();
    }
  };

  useEffect(() => {
    patchConnection?.addAllParameterListener(paramsUpdated);

    for (let i = 0; i < NUMBER_OF_POINTS; i++) {
      patchConnection?.requestParameterValue(`point${i}`);
    }
    return () => {
      patchConnection?.removeAllParameterListener(paramsUpdated);
    };
  }, [patchConnection]);

  const onMouseMove = (event) => {
    if (isDrawing) {
      const rect = mountRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Adjust mouse coordinates to be relative to the mountRef element
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

      const material2 = new LineMaterial({
        color: 0xff00ff,
        linewidth: 10,
        dashed: false,
        transparent: true,
        opacity: 1.0,
        blending: THREE.NormalBlending,
      });

      line = new Line2(geometry2, material2);
      scene.add(line);
    }
  };

  const displayWaveform = (waveform) => {
    if (waveformLine) {
      scene.remove(waveformLine);
      waveformLine.geometry.dispose();
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const positions = [];
    const numPoints = waveform.length;

    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * width - width / 2;
      const y = waveform[i] * height;
      positions.push(x, y, 0);
    }

    const geometry2 = new LineGeometry();
    geometry2.setPositions(positions);

    const material2 = new LineMaterial({
      color: 0x00ffff,
      linewidth: 2,
      dashed: false,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });

    waveformLine = new Line2(geometry2, material2);
    scene.add(waveformLine);
  };

  const onWindowResize = () => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Update camera
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();

    // Update renderer and composer
    renderer.setSize(width, height);
    composer.setSize(width, height);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    composer.render();
  };

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default DrawShapeToWaveform;
