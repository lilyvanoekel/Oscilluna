export const xUnits = (units: number) => {
  return (units * window.innerWidth) / 1024;
};

export type BoundingBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export const getBoundingBoxTop = (): BoundingBox => ({
  left: -window.innerWidth / 2 + xUnits(100),
  right: window.innerWidth / 2 - xUnits(14),
  top: window.innerHeight / 2 - 18,
  bottom: 0 + 18,
});

export const getBoundingBoxBottom = (): BoundingBox => ({
  left: -window.innerWidth / 2 + xUnits(100),
  right: window.innerWidth / 2 - xUnits(14),
  top: 0 - 18,
  bottom: -window.innerHeight / 2 + 18,
});

export const splitBoundingBoxHorizontal = (
  divisions: number,
  boundingBox: BoundingBox
): BoundingBox[] => {
  const width = boundingBox.right - boundingBox.left;
  const sectionWidth = width / divisions;

  const boundingBoxes: BoundingBox[] = [];

  for (let i = 0; i < divisions; i++) {
    boundingBoxes.push({
      left: boundingBox.left + i * sectionWidth,
      right: boundingBox.left + (i + 1) * sectionWidth,
      top: boundingBox.top,
      bottom: boundingBox.bottom,
    });
  }

  return boundingBoxes;
};

export const renderTextInBoundingBox = (
  ctx: CanvasRenderingContext2D,
  boundingBox: BoundingBox,
  text: string,
  align: "left" | "center" = "left"
) => {
  const fontSize = Math.round(xUnits(22));
  const margin = xUnits(8);
  const textHeightAdjustment = fontSize * 0.75;
  const line1Y = textHeightAdjustment + margin;

  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  const centerX = (boundingBox.left + boundingBox.right) / 2;
  const centerY = boundingBox.top;

  const left = canvasWidth / 2 + boundingBox.left;
  const textX = canvasWidth / 2 + centerX;
  const textY = canvasHeight / 2 - centerY;

  ctx.font = `${fontSize}px Consolas, monospace`;
  ctx.fillStyle = "white";
  ctx.textAlign = align;
  ctx.fillText(text, align == "left" ? left : textX, textY + line1Y);
};
