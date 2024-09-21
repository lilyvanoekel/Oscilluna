import * as THREE from "three";
import { BoundingBox } from "../domain/layout";
import { xUnits } from "../domain/layout";

export const BuildRadio = (
  options: string[],
  scene: THREE.Scene,
  ctx: CanvasRenderingContext2D,
  boundingBox: BoundingBox,
  onOptionSelected: (index: number) => void,
  selectedOptionIndex: number,
  bottomAlign: boolean = true,
  visible: boolean = true,
  debugBoundingBox: boolean = false
) => {
  let currentIndex = selectedOptionIndex;
  let optionObjects: any[] = [];
  let isVisible = visible;

  const materialCyan = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const materialMagenta = new THREE.MeshBasicMaterial({ color: 0xff00ff });

  const getFontSizeSpacing = () => {
    const fontSize = Math.round(xUnits(22));
    const optionSpacing = fontSize + xUnits(12);

    return { fontSize, optionSpacing };
  };

  const drawBullets = () => {
    if (!isVisible) return;

    clearOptions();

    const { optionSpacing } = getFontSizeSpacing();

    let currentY = boundingBox.top - optionSpacing / 2;
    const leftX = boundingBox.left + xUnits(18);

    const canvasHeight = ctx.canvas.height;
    const centerY = boundingBox.top;
    const top = canvasHeight / 2 - centerY;
    const bottom = canvasHeight / 2 - boundingBox.bottom;

    const bottomAlignAdjust = bottomAlign
      ? bottom - optionSpacing * options.length - top
      : 0;

    options.forEach((option, index) => {
      const bulletRadius = index === currentIndex ? xUnits(10) : xUnits(8);
      const material = index === currentIndex ? materialCyan : materialMagenta;

      const circleGeometry = new THREE.CircleGeometry(bulletRadius, 32);
      const circle = new THREE.Mesh(circleGeometry, material);
      circle.position.set(leftX, currentY - bottomAlignAdjust, 0);
      scene.add(circle);
      optionObjects.push(circle);

      currentY -= optionSpacing;
    });
  };

  const drawLabels = () => {
    if (!isVisible) return;

    const { fontSize, optionSpacing } = getFontSizeSpacing();

    let currentY = boundingBox.top;
    const leftX = boundingBox.left;
    const textHeightAdjustment = fontSize * 0.75;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const centerY = boundingBox.top;
    const left = canvasWidth / 2 + boundingBox.left;
    const right = canvasWidth / 2 + boundingBox.right;
    const top = canvasHeight / 2 - centerY;
    const bottom = canvasHeight / 2 - boundingBox.bottom;

    const bottomAlignAdjust = bottomAlign
      ? bottom - optionSpacing * options.length - top
      : 0;

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

    options.forEach((option, index) => {
      const canvasX = ctx.canvas.width / 2 + leftX;
      const canvasY = ctx.canvas.height / 2 - currentY;

      ctx.font = `${fontSize}px Consolas, monospace`;
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.fillText(
        option,
        canvasX + xUnits(44),
        canvasY + textHeightAdjustment + xUnits(8) + bottomAlignAdjust
      );

      currentY -= optionSpacing;
    });
  };

  const clearOptions = () => {
    optionObjects.forEach((object) => {
      scene.remove(object);
      object.geometry.dispose();
      object.material.dispose();
    });
    optionObjects = [];
  };

  const onMouseDown = (event: any) => {
    if (!isVisible) return;

    const { optionSpacing } = getFontSizeSpacing();

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const centerY = boundingBox.top;
    const left = canvasWidth / 2 + boundingBox.left;
    const right = canvasWidth / 2 + boundingBox.right;
    const top = canvasHeight / 2 - centerY;
    const bottom = canvasHeight / 2 - boundingBox.bottom;

    const bottomAlignAdjust = bottomAlign
      ? bottom - optionSpacing * options.length - top
      : 0;

    if (event.clientX < left || event.clientX > right) {
      return;
    }

    if (event.clientY < top || event.clientY > bottom) {
      return;
    }

    options.forEach((_, index) => {
      const optionTop = top + optionSpacing * index + bottomAlignAdjust;
      const optionBottom = optionTop + optionSpacing + bottomAlignAdjust;

      if (
        event.clientY > optionTop &&
        event.clientY < optionBottom &&
        currentIndex !== index
      ) {
        currentIndex = index;
        drawBullets();
        onOptionSelected(index);
      }
    });
  };

  window.addEventListener("mousedown", onMouseDown, false);

  drawBullets();

  return {
    setValue: (index: number) => {
      currentIndex = index;
      drawBullets();
    },
    setVisible: (v: boolean) => {
      if (v === isVisible) return;

      isVisible = v;

      if (isVisible) {
        drawBullets();
      } else {
        clearOptions();
      }
    },
    setBoundingBox: (newBoundingBox: BoundingBox) => {
      boundingBox = newBoundingBox;
      drawBullets();
    },
    draw: () => {
      drawLabels();
    },
  };
};
