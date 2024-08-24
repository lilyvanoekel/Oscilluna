import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

const NUMBER_OF_POINTS = 24;

function generateCatmullRomControlPoints(waveform) {
  const controlPoints = [];
  const segmentCount = NUMBER_OF_POINTS - 1;
  const segmentLength = Math.floor(waveform.length / segmentCount);

  // Generate control points with circular wrap-around
  for (let i = 0; i <= segmentCount; i++) {
    let pointIndex = (i * segmentLength) % waveform.length;
    controlPoints.push(waveform[pointIndex]);
  }

  return controlPoints;
}

function interpolateCatmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function decodeCatmullRom(controlPoints, length) {
  const decodedWaveform = new Array(length).fill(0);
  const segmentCount = controlPoints.length;
  const segmentLength = length / segmentCount;

  for (let i = 0; i < length; i++) {
    const t = (i % segmentLength) / segmentLength;
    const segmentIndex = Math.floor(i / segmentLength);

    // Circular control point indexing
    const p0 = controlPoints[(segmentIndex - 1 + segmentCount) % segmentCount];
    const p1 = controlPoints[segmentIndex % segmentCount];
    const p2 = controlPoints[(segmentIndex + 1) % segmentCount];
    const p3 = controlPoints[(segmentIndex + 2) % segmentCount];

    decodedWaveform[i] = interpolateCatmullRom(p0, p1, p2, p3, t);
  }

  return decodedWaveform;
}

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
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Effect Composer and Bloom setup
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
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
      // patchConnection?.sendEventOrValue("wavetableIn", waveform);
      // patchConnection?.sendStoredStateValue("wavetableIn", waveform);

      const controlPoints = generateCatmullRomControlPoints(waveform);
      for (let i = 0; i < NUMBER_OF_POINTS; i++) {
        patchConnection?.sendEventOrValue(`point${i}`, controlPoints[i]);
      }

      // This is super janky, chatgpt didn't scale the waveform properly between -1 and 1.
      // After normalizing the drawing logic is having a fit.
      // Dividing by 2 here seems to fix it for now.
      displayWaveform(waveform.map((x) => x / 2));
    }
  };

  let currentWavetable = [];
  const storedValueUpdated = ({ key, value }) => {
    if (key === "wavetableIn" && !arraysAreEqual(currentWavetable, value)) {
      currentWavetable = value;
      if (waveformLine) {
        scene.remove(waveformLine);
        waveformLine.geometry.dispose();
      }
      displayWaveform(value.map((x) => x / 2));
    }
  };

  useEffect(() => {
    patchConnection?.addStoredStateValueListener(storedValueUpdated);
    return () => {
      patchConnection?.removeStoredStateValueListener(storedValueUpdated);
    };
  }, [patchConnection]);

  const onMouseMove = (event) => {
    if (isDrawing) {
      const mouseX = event.clientX - window.innerWidth / 2;
      const mouseY = window.innerHeight / 2 - event.clientY;
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

  function normalizeWaveform(waveform) {
    const mean =
      waveform.reduce((sum, value) => sum + value, 0) / waveform.length;
    const waveform2 = waveform.map((value) => value - mean);
    const maxAbsValue = Math.max(...waveform2.map(Math.abs));
    return waveform2.map((value) => value / maxAbsValue);
  }

  const generateWaveform = (points) => {
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

  const displayWaveform = (waveform) => {
    const positions = [];
    const numPoints = waveform.length;

    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * window.innerWidth - window.innerWidth / 2;
      const y = waveform[i] * window.innerHeight;
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
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    composer.render(); // Use composer to render the scene with effects
  };

  return <div ref={mountRef} />;
};

export default DrawShapeToWaveform;
