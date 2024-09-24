import * as THREE from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { BoundingBox } from "../domain/layout";
import { xUnits } from "../domain/layout";

export const BuildSlider = (
  labelText: string,
  scene: THREE.Scene,
  root: HTMLElement,
  ctx: CanvasRenderingContext2D,
  boundingBox: BoundingBox,
  onValueChanged: (value: number) => void,
  value: number,
  min: number,
  max: number,
  step: number,
  visible: boolean = true,
  debugBoundingBox: boolean = false
) => {
  let currentValue = value;
  let handleObject: any = null;
  let sliderTrack: any = null;
  let isDragging = false;
  let isVisible = visible;

  const materialCyan = new LineMaterial({
    color: 0x00ffff,
    linewidth: 3,
    dashed: false,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
  });

  const materialMagenta = new THREE.MeshBasicMaterial({ color: 0xff00ff });

  const drawSlider = () => {
    if (!isVisible) return;

    const { labelHeight } = calculateLabelHeight();
    const sliderHeight =
      boundingBox.top - boundingBox.bottom - labelHeight - 30;
    const centerX = (boundingBox.left + boundingBox.right) / 2;

    if (handleObject) {
      scene.remove(handleObject);
      handleObject.geometry.dispose();
      handleObject.material.dispose();
    }

    if (sliderTrack) {
      scene.remove(sliderTrack);
      sliderTrack.geometry.dispose();
    }

    const geometry = new LineGeometry();
    geometry.setPositions([
      centerX,
      boundingBox.bottom + 15,
      0,
      centerX,
      boundingBox.top - labelHeight - 15,
      0,
    ]);

    sliderTrack = new Line2(geometry, materialCyan);
    sliderTrack.computeLineDistances();
    scene.add(sliderTrack);

    const handleY =
      boundingBox.bottom +
      ((currentValue - min) / (max - min)) * sliderHeight +
      15;

    const circleGeometry = new THREE.CircleGeometry(10, 32);
    const circle = new THREE.Mesh(circleGeometry, materialMagenta);
    circle.position.set(centerX, handleY, 0);
    scene.add(circle);
    handleObject = circle;
  };

  const calculateLabelHeight = () => {
    const fontSize = Math.round(xUnits(22));
    const margin = xUnits(8);
    const textHeightAdjustment = fontSize * 0.75;
    const line1Y = textHeightAdjustment + margin;
    const line2Y = line1Y + fontSize + margin;
    const labelHeight = line2Y + margin;

    return { fontSize, line1Y, line2Y, labelHeight };
  };

  const drawLabelText = () => {
    if (!isVisible) return;
    const { fontSize, line1Y, line2Y } = calculateLabelHeight();

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const centerX = (boundingBox.left + boundingBox.right) / 2;
    const centerY = boundingBox.top;

    const textX = canvasWidth / 2 + centerX;
    const textY = canvasHeight / 2 - centerY;
    const left = canvasWidth / 2 + boundingBox.left;
    const right = canvasWidth / 2 + boundingBox.right;
    const top = canvasHeight / 2 - centerY;
    const bottom = canvasHeight / 2 - boundingBox.bottom;

    if (debugBoundingBox) {
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right, top);
      ctx.lineTo(left, top);
      ctx.stroke();
    }

    const t = labelText.split("\n");

    ctx.font = `${fontSize}px Consolas, monospace`;

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(t[0], textX, textY + line1Y);

    if (t.length > 1) {
      ctx.fillText(t[1], textX, textY + line2Y);
    }
  };

  const clear = () => {
    if (handleObject) {
      scene.remove(handleObject);
      handleObject.geometry.dispose();
      handleObject.material.dispose();
      handleObject = null;
    }

    if (sliderTrack) {
      scene.remove(sliderTrack);
      sliderTrack.geometry.dispose();
      sliderTrack = null;
    }
  };

  const moveKnobToPosition = (mousePos: THREE.Vector3) => {
    const { labelHeight } = calculateLabelHeight();
    const oldValue = currentValue;
    const sliderHeight =
      boundingBox.top - boundingBox.bottom - labelHeight - 30;

    currentValue = THREE.MathUtils.clamp(
      (mousePos.y - boundingBox.bottom - 15) / sliderHeight,
      0,
      1
    );
    currentValue = min + currentValue * (max - min);
    currentValue = Math.round(currentValue / step) * step;
    drawSlider();
    if (currentValue != oldValue) {
      onValueChanged(currentValue);
    }
  };

  const onMouseDown = (event: any) => {
    if (!isVisible) return;

    const mousePos = getMousePosition(event);

    const centerX = (boundingBox.left + boundingBox.right) / 2;
    if (
      mousePos.x >= centerX - 15 &&
      mousePos.x <= centerX + 15 &&
      mousePos.y >= boundingBox.bottom &&
      mousePos.y <= boundingBox.top
    ) {
      const distance = mousePos.distanceTo(handleObject.position);

      if (distance >= 15) {
        moveKnobToPosition(mousePos);
      }
      isDragging = true;
    }
  };

  const onMouseMove = (event: any) => {
    if (!isDragging || !isVisible) return;

    const mousePos = getMousePosition(event);
    moveKnobToPosition(mousePos);
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const getMousePosition = (event: any) => {
    const rect = root.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - window.innerWidth / 2;
    const mouseY = window.innerHeight / 2 - (event.clientY - rect.top);
    return new THREE.Vector3(mouseX, mouseY, 0);
  };

  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("mouseup", onMouseUp, false);

  drawSlider();

  return {
    setValue: (value: number) => {
      currentValue = value;
      drawSlider();
    },
    setVisible: (v: boolean) => {
      if (v === isVisible) return;

      isVisible = v;

      if (isVisible) {
        drawSlider();
      } else {
        clear();
      }
    },
    setBoundingBox: (newBoundingBox: BoundingBox) => {
      boundingBox = newBoundingBox;
      drawSlider();
    },
    draw: () => {
      drawLabelText();
    },
  };
};
