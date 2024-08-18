import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const DrawShapeToWaveform = () => {
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
    isDrawing = false;
    if (line) {
      scene.remove(line);
      line.geometry.dispose();
    }
    if (points.length > 2) {
      const waveform = generateWaveform(points);
      displayWaveform(waveform);
    }
  };

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

  const generateWaveform = (points) => {
    const waveform = [];
    const numPoints = points.length;
    for (let i = 0; i < numPoints; i++) {
      waveform.push(points[i].y / window.innerHeight);
    }
    return waveform;
  };

  const displayWaveform = (waveform) => {
    const positions = [];
    const numPoints = waveform.length;
    console.log(numPoints);

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
