import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

const FatLine = () => {
  const mountRef = useRef(null);
  let scene, camera, renderer, line;

  useEffect(() => {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Line setup
    const geometry = new LineGeometry();
    geometry.setPositions([
      -10, 0, 0, 0, 10, 0, 10, 0, 0, 0, -10, 0, -10, 0, 0,
    ]);

    const material = new LineMaterial({
      color: 0xff0000,
      linewidth: 50, // in pixels
      dashed: false,
      transparent: true,
      opacity: 0.8,
      blending: THREE.NormalBlending,
    });

    line = new Line2(geometry, material);
    line.computeLineDistances();
    scene.add(line);

    animate();

    // Cleanup on unmount
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return <div ref={mountRef} />;
};

export default FatLine;
