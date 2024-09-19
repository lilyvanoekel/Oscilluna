import { xUnits } from "./domain/layout";

export const buttonIconSine = (
  ctx,
  buttonX,
  buttonY,
  buttonWidth,
  buttonHeight,
  isHover,
  isActive
) => {
  const waveAmplitude = xUnits(16);
  const wavePadding = xUnits(10);
  const waveOffsetY = buttonY + buttonHeight / 2;

  ctx.beginPath();
  ctx.lineWidth = xUnits(6);
  ctx.strokeStyle = isHover ? "cyan" : "magenta";
  if (isActive) {
    ctx.strokeStyle = "rgba(255, 0, 255, .6)";
  }

  const waveStartX = buttonX + wavePadding;
  const waveEndX = buttonX + buttonWidth - wavePadding;
  const availableWidth = waveEndX - waveStartX;
  const waveFrequency = (2 * Math.PI) / availableWidth;

  for (let x = waveStartX; x <= waveEndX; x++) {
    const y =
      waveOffsetY + waveAmplitude * Math.sin((x - waveStartX) * waveFrequency);
    if (x === waveStartX) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
};

export const buttonIconTuningFork = (
  ctx,
  buttonX,
  buttonY,
  buttonWidth,
  buttonHeight,
  isHover,
  isActive
) => {
  const prongWidth = xUnits(10);
  const prongHeight = xUnits(60);
  const handleHeight = xUnits(22);

  const centerX = buttonX + buttonWidth / 2;
  const centerY = buttonY + buttonHeight / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((-45 * Math.PI) / 180);

  ctx.beginPath();
  ctx.lineWidth = xUnits(6);
  ctx.strokeStyle = isHover ? "cyan" : "magenta";
  if (isActive) {
    ctx.strokeStyle = "rgba(255, 0, 255, .6)";
  }

  // Draw the left prong
  ctx.moveTo(-prongWidth / 2, -prongHeight / 2);
  ctx.lineTo(-prongWidth / 2, prongHeight / 2 - handleHeight);

  // Draw the right prong
  ctx.moveTo(prongWidth / 2, -prongHeight / 2);
  ctx.lineTo(prongWidth / 2, prongHeight / 2 - handleHeight);

  // Draw the connecting line between the prongs
  ctx.moveTo(-prongWidth / 2, prongHeight / 2 - handleHeight);
  ctx.lineTo(prongWidth / 2, prongHeight / 2 - handleHeight);

  // Draw the handle
  ctx.moveTo(0, prongHeight / 2 - handleHeight);
  ctx.lineTo(0, prongHeight / 2);

  ctx.stroke();

  ctx.restore();
};

export const buttonIconADSR = (
  ctx,
  buttonX,
  buttonY,
  buttonWidth,
  buttonHeight,
  isHover,
  isActive
) => {
  const paddingX = xUnits(10);
  const paddingY = xUnits(20);
  const curveStartX = buttonX + paddingX;
  const curveEndX = buttonX + buttonWidth - paddingX;
  const curveWidth = curveEndX - curveStartX;
  const curveHeight = buttonHeight - 2 * paddingY;

  const attackEndX = curveStartX + curveWidth * 0.2;
  const decayEndX = curveStartX + curveWidth * 0.4;
  const sustainEndX = curveStartX + curveWidth * 0.7;
  const releaseEndX = curveEndX;

  const sustainLevel = 0.5;

  ctx.beginPath();
  ctx.lineWidth = xUnits(6);
  ctx.strokeStyle = isHover ? "cyan" : "magenta";
  if (isActive) {
    ctx.strokeStyle = "rgba(255, 0, 255, .6)";
  }

  ctx.moveTo(curveStartX, buttonY + buttonHeight - paddingY);
  ctx.lineTo(attackEndX, buttonY + paddingY);
  ctx.lineTo(decayEndX, buttonY + paddingY + curveHeight * sustainLevel);
  ctx.lineTo(sustainEndX, buttonY + paddingY + curveHeight * sustainLevel);
  ctx.lineTo(releaseEndX, buttonY + buttonHeight - paddingY);

  ctx.stroke();
};

export const buttonIconEQ = (
  ctx,
  buttonX,
  buttonY,
  buttonWidth,
  buttonHeight,
  isHover,
  isActive
) => {
  const sliderCount = 3;
  const sliderWidth = xUnits(4);
  const sliderHeight = buttonHeight * 0.6;
  const knobRadius = xUnits(6);
  const xOffset = buttonWidth * 0.05;
  const yOffset = buttonHeight * 0.2;

  const spacing =
    (buttonWidth * 0.9 - sliderCount * sliderWidth) / (sliderCount + 1);

  const sliderPositions = [
    buttonY + sliderHeight * 0.3, // Low slider (30% up)
    buttonY + sliderHeight * 0.7, // Mid slider (70% up)
    buttonY + sliderHeight * 0.5, // High slider (50% up)
  ];

  ctx.strokeStyle = isHover ? "cyan" : "magenta";
  ctx.fillStyle = isHover ? "cyan" : "magenta";
  if (isActive) {
    ctx.strokeStyle = "rgba(255, 0, 255, .6)";
    ctx.fillStyle = "rgba(255, 0, 255, .6)";
  }

  for (let i = 0; i < sliderCount; i++) {
    const sliderX = buttonX + spacing * (i + 1) + sliderWidth * i;
    const knobY = sliderPositions[i];

    ctx.beginPath();
    ctx.lineWidth = sliderWidth;
    ctx.moveTo(xOffset + sliderX + sliderWidth / 2, buttonY + yOffset);
    ctx.lineTo(
      xOffset + sliderX + sliderWidth / 2,
      buttonY + sliderHeight + yOffset
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
      xOffset + sliderX + sliderWidth / 2,
      knobY + yOffset,
      knobRadius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
};

export const buttonIconFX = (
  ctx,
  buttonX,
  buttonY,
  buttonWidth,
  buttonHeight,
  isHover,
  isActive
) => {
  const lineWidth = xUnits(6);
  const size = xUnits(34);
  const centerY = buttonY + buttonHeight / 2;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = isHover ? "cyan" : "magenta";
  if (isActive) {
    ctx.strokeStyle = "rgba(255, 0, 255, .6)";
  }

  ctx.beginPath();

  // Calculate the offset to center the drawing
  const startX = xUnits(29);

  // Draw the "F"
  ctx.moveTo(startX, centerY - size / 2); // vertical line of F
  ctx.lineTo(startX, centerY + size / 2);
  ctx.moveTo(startX, centerY - size / 2); // top horizontal line of F
  ctx.lineTo(startX + xUnits(16), centerY - size / 2);
  ctx.moveTo(startX, centerY); // middle horizontal line of F
  ctx.lineTo(startX + xUnits(10), centerY);

  // Draw the "X"
  const xStartX = startX + xUnits(22);
  ctx.moveTo(xStartX, centerY - size / 2);
  ctx.lineTo(xStartX + size / 2, centerY + size / 2);
  ctx.moveTo(xStartX + size / 2, centerY - size / 2);
  ctx.lineTo(xStartX, centerY + size / 2);

  ctx.stroke();
};
