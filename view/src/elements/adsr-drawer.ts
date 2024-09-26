import * as THREE from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { BoundingBox } from "../domain/layout";

export const BuildADSRDrawer = (
  patchConnection: any,
  scene: THREE.Scene,
  root: HTMLElement,
  boundingBox: BoundingBox,
  pointPrefix: string,
  exponential = false
) => {
  let currentAttack = 0.1;
  let currentDecay = 0.3;
  let currentSustain = 0.7;
  let currentRelease = 0.2;
  let adsrLine: any = [];
  let selectedSegment: any = null;
  let handleObjects: any = [];
  let isVisible = false;
  let isExponential = exponential;

  const clipPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -boundingBox.left),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), boundingBox.right),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), boundingBox.top),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -boundingBox.bottom),
  ];

  const materialCyan = new LineMaterial({
    color: 0x00ffff,
    linewidth: 3,
    dashed: false,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    clippingPlanes: clipPlanes,
  });

  const materialCyanDashed = new LineMaterial({
    color: 0x00ffff,
    linewidth: 3,
    dashed: true,
    gapSize: 10,
    dashSize: 10,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    clippingPlanes: clipPlanes,
  });

  const materialMagenta = new THREE.MeshBasicMaterial({ color: 0xff00ff });

  const clear = () => {
    if (adsrLine) {
      for (const l of adsrLine) {
        scene.remove(l);
        l.geometry.dispose();
      }
    }

    handleObjects.forEach((handle: any) => {
      scene.remove(handle);
      handle.geometry.dispose();
      handle.material.dispose();
    });
    handleObjects = [];
  };

  const drawADSR = () => {
    if (!isVisible) {
      return;
    }

    const boxWidth = boundingBox.right - boundingBox.left;
    const boxHeight = boundingBox.top - boundingBox.bottom;

    const maxSegmentWidth = boxWidth / 4;

    const attackWidth = currentAttack * maxSegmentWidth;
    const decayWidth = currentDecay * maxSegmentWidth;
    const releaseWidth = currentRelease * maxSegmentWidth;
    const sustainWidth = boxWidth - (attackWidth + decayWidth + releaseWidth);

    const attackX = boundingBox.left + attackWidth;
    const decayX = attackX + decayWidth;
    const sustainX = decayX + sustainWidth;
    const releaseX = boundingBox.right;

    const maxY = boundingBox.top;
    const sustainY = boundingBox.bottom + currentSustain * boxHeight;

    clear();

    const startPoint = new THREE.Vector3(
      boundingBox.left,
      boundingBox.bottom,
      0
    );
    const attackPoint = new THREE.Vector3(attackX, maxY, 0);
    const decayPoint = new THREE.Vector3(decayX, sustainY, 0);
    const releasePoint = new THREE.Vector3(sustainX, sustainY, 0);
    const endPoint = new THREE.Vector3(
      boundingBox.right,
      boundingBox.bottom,
      0
    );

    const exponentialCurve = (t: number) => {
      const exponentFactor = 3;
      return (
        (1 - Math.exp(-exponentFactor * t)) / (1 - Math.exp(-exponentFactor))
      );
    };

    // @todo: replace with identity
    const linearCurve = (t: number) => t;
    const interpolate = isExponential ? exponentialCurve : linearCurve;

    const attackSegments = Math.max(
      Math.floor(startPoint.distanceTo(attackPoint) / 5)
    );

    const attackCurve = [];
    for (let i = 0; i <= attackSegments; i++) {
      const t = i / attackSegments;
      const x = boundingBox.left + t * attackWidth;
      const y =
        boundingBox.bottom + interpolate(t) * (maxY - boundingBox.bottom);
      attackCurve.push([x, y, 0]);
    }

    const decaySegments = Math.max(
      Math.floor(attackPoint.distanceTo(decayPoint) / 5)
    );

    const decayCurve = [];
    for (let i = 0; i <= decaySegments; i++) {
      const t = i / decaySegments;
      const x = attackX + t * decayWidth;
      const y = maxY - interpolate(t) * (maxY - sustainY);
      decayCurve.push([x, y, 0]);
    }

    const releaseSgments = Math.max(
      Math.floor(releasePoint.distanceTo(endPoint) / 5)
    );

    const releaseCurve = [];
    for (let i = 0; i <= releaseSgments; i++) {
      const t = i / releaseSgments;
      const x = sustainX + t * releaseWidth;
      const y = sustainY - interpolate(t) * (sustainY - boundingBox.bottom);
      releaseCurve.push([x, y, 0]);
    }

    const attackGeometry = new LineGeometry();
    attackGeometry.setPositions(attackCurve.flat());
    const attackLine = new Line2(attackGeometry, materialCyan);
    scene.add(attackLine);
    adsrLine.push(attackLine);

    const decayGeometry = new LineGeometry();
    decayGeometry.setPositions(decayCurve.flat());
    const decayLine = new Line2(decayGeometry, materialCyan);
    scene.add(decayLine);
    adsrLine.push(decayLine);

    const sustainGeometry = new LineGeometry();
    sustainGeometry.setPositions([decayX, sustainY, 0, sustainX, sustainY, 0]);
    const sustainLine = new Line2(sustainGeometry, materialCyanDashed);
    sustainLine.computeLineDistances();
    scene.add(sustainLine);
    adsrLine.push(sustainLine);

    const releaseGeometry = new LineGeometry();
    releaseGeometry.setPositions(releaseCurve.flat());
    const releaseLine = new Line2(releaseGeometry, materialCyan);
    scene.add(releaseLine);
    adsrLine.push(releaseLine);

    drawHandles([attackPoint, decayPoint, releasePoint]);
  };

  const drawHandles = (points: any) => {
    points.forEach((point: any) => {
      const circleGeometry = new THREE.CircleGeometry(10, 32);
      const circle = new THREE.Mesh(circleGeometry, materialMagenta);
      circle.position.set(point.x, point.y, 0);
      scene.add(circle);
      handleObjects.push(circle);
    });
  };

  const onMouseDown = (event: any) => {
    if (!isVisible) {
      return;
    }
    const mousePos = getMousePosition(event);
    selectedSegment = findClosestSegment(mousePos);
  };

  const onMouseMove = (event: any) => {
    if (selectedSegment === null) return;

    const mousePos = getMousePosition(event);
    const boxWidth = boundingBox.right - boundingBox.left;
    const boxHeight = boundingBox.top - boundingBox.bottom;

    switch (selectedSegment) {
      case 1:
        updateAttack(mousePos.x, boxWidth);
        break;
      case 2:
        updateDecay(mousePos.x, mousePos.y, boxWidth, boxHeight);
        break;
      case 3:
        updateReleaseAndSustain(mousePos.x, mousePos.y, boxWidth, boxHeight);
        break;
    }

    drawADSR();
  };

  const updateAttack = (mouseX: number, boxWidth: number) => {
    const maxSegmentWidth = boxWidth / 4;
    currentAttack = THREE.MathUtils.clamp(
      (mouseX - boundingBox.left) / maxSegmentWidth,
      0,
      1
    );
  };

  const updateDecay = (
    mouseX: number,
    mouseY: number,
    boxWidth: number,
    boxHeight: number
  ) => {
    const maxSegmentWidth = boxWidth / 4;
    currentDecay = THREE.MathUtils.clamp(
      (mouseX - boundingBox.left) / maxSegmentWidth - currentAttack,
      0,
      1
    );
    currentSustain = THREE.MathUtils.clamp(
      (mouseY - boundingBox.bottom) / boxHeight,
      0,
      1
    );
  };

  const updateReleaseAndSustain = (
    mouseX: number,
    mouseY: number,
    boxWidth: number,
    boxHeight: number
  ) => {
    const maxSegmentWidth = boxWidth / 4;
    currentRelease = THREE.MathUtils.clamp(
      (boundingBox.right - mouseX) / maxSegmentWidth,
      0,
      1
    );
    currentSustain = THREE.MathUtils.clamp(
      (mouseY - boundingBox.bottom) / boxHeight,
      0,
      1
    );
  };

  const onMouseUp = () => {
    if (selectedSegment === null) {
      return;
    }
    selectedSegment = null;
    updateEnvelopeValues();
  };

  const getMousePosition = (event: any) => {
    const rect = root.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - window.innerWidth / 2;
    const mouseY = window.innerHeight / 2 - (event.clientY - rect.top);
    return new THREE.Vector3(mouseX, mouseY, 0);
  };

  const findClosestSegment = (mousePos: any) => {
    const boxWidth = boundingBox.right - boundingBox.left;
    const boxHeight = boundingBox.top - boundingBox.bottom;

    const maxSegmentWidth = boxWidth / 4;
    const selectionThreshold = 20; // Distance in pixels within which selection is allowed

    // Calculate positions of ADSR points
    const attackX = boundingBox.left + currentAttack * maxSegmentWidth;
    const decayX = attackX + currentDecay * maxSegmentWidth;
    const sustainX =
      decayX +
      (boxWidth -
        currentAttack * maxSegmentWidth -
        currentDecay * maxSegmentWidth -
        currentRelease * maxSegmentWidth);

    // Points in 2D space
    const attackPoint = new THREE.Vector3(attackX, boundingBox.top, 0);
    const decayPoint = new THREE.Vector3(
      decayX,
      boundingBox.bottom + currentSustain * boxHeight,
      0
    );
    const sustainPoint = new THREE.Vector3(
      sustainX,
      boundingBox.bottom + currentSustain * boxHeight,
      0
    );

    // Calculate distances from mouse position to the three points
    const distances = [
      mousePos.distanceTo(attackPoint),
      mousePos.distanceTo(decayPoint),
      mousePos.distanceTo(sustainPoint),
    ];

    // Get the index of the closest point
    const closestIndex = distances.indexOf(Math.min(...distances));

    // If the distance is within the threshold, return the index (+1 to map to segment IDs)
    if (distances[closestIndex] <= selectionThreshold) {
      return closestIndex + 1; // 1 for Attack, 2 for Decay, 3 for Sustain/Release
    } else {
      return null;
    }
  };

  const updateEnvelopeValues = () => {
    patchConnection?.sendEventOrValue(`${pointPrefix}_attack`, currentAttack);
    patchConnection?.sendEventOrValue(`${pointPrefix}_decay`, currentDecay);
    patchConnection?.sendEventOrValue(`${pointPrefix}_sustain`, currentSustain);
    patchConnection?.sendEventOrValue(`${pointPrefix}_release`, currentRelease);
  };

  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("mouseup", onMouseUp, false);

  drawADSR();

  const paramsUpdated = ({ endpointID, value }: any) => {
    const actions = {
      [`${pointPrefix}_attack`]: () => {
        currentAttack = value;
      },
      [`${pointPrefix}_decay`]: () => {
        currentDecay = value;
      },
      [`${pointPrefix}_sustain`]: () => {
        currentSustain = value;
      },
      [`${pointPrefix}_release`]: () => {
        currentRelease = value;
      },
    };

    const action = actions[endpointID];
    if (!action) {
      return;
    }

    action();
    drawADSR();
  };

  patchConnection?.addAllParameterListener(paramsUpdated);
  patchConnection?.requestParameterValue(`${pointPrefix}_attack`);
  patchConnection?.requestParameterValue(`${pointPrefix}_decay`);
  patchConnection?.requestParameterValue(`${pointPrefix}_sustain`);
  patchConnection?.requestParameterValue(`${pointPrefix}_release`);

  return {
    setBoundingBox: (b: any) => {
      boundingBox = b;
      clipPlanes[0].set(new THREE.Vector3(1, 0, 0), -boundingBox.left);
      clipPlanes[1].set(new THREE.Vector3(-1, 0, 0), boundingBox.right);
      clipPlanes[2].set(new THREE.Vector3(0, -1, 0), boundingBox.top);
      clipPlanes[3].set(new THREE.Vector3(0, 1, 0), -boundingBox.bottom);

      drawADSR();
    },
    setExponential: (e: boolean) => {
      isExponential = e;
      drawADSR();
    },
    setVisible: (v: boolean) => {
      if (v == isVisible) {
        return;
      }
      isVisible = v;

      if (isVisible) {
        drawADSR();
      } else {
        clear();
      }
    },
  };
};
