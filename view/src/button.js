import { xUnits } from "./domain/layout";

export const BuildButton = (canvas, ctx, x, y, drawContent, onClick) => {
  let buttonX;
  let buttonY;
  let buttonWidth;
  let buttonHeight;
  let borderRadius;
  let borderWidth;
  let isHover = false;
  let isActive = false;

  function isMouseOverButton(mouseX, mouseY) {
    return (
      mouseX >= buttonX &&
      mouseX <= buttonX + buttonWidth &&
      mouseY >= buttonY &&
      mouseY <= buttonY + buttonHeight
    );
  }

  window.addEventListener("mousemove", function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const wasHover = isHover;
    isHover = isMouseOverButton(mouseX, mouseY) && !isActive;
    if (wasHover != isHover) {
      if (isHover) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
      draw();
    }
  });

  window.addEventListener("click", function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    if (isMouseOverButton(mouseX, mouseY) && !isActive && onClick) {
      onClick();
    }
  });

  const draw = () => {
    buttonX = xUnits(x);
    buttonY = xUnits(y);
    buttonWidth = xUnits(72);
    buttonHeight = xUnits(72);
    borderRadius = xUnits(20);
    borderWidth = xUnits(5);

    ctx.clearRect(
      buttonX - borderWidth,
      buttonY - borderWidth,
      buttonWidth + borderWidth * 2,
      buttonHeight + borderWidth * 2
    );

    ctx.beginPath();
    ctx.moveTo(buttonX + borderRadius, buttonY);
    ctx.lineTo(buttonX + buttonWidth - borderRadius, buttonY);
    ctx.quadraticCurveTo(
      buttonX + buttonWidth,
      buttonY,
      buttonX + buttonWidth,
      buttonY + borderRadius
    );
    ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - borderRadius);
    ctx.quadraticCurveTo(
      buttonX + buttonWidth,
      buttonY + buttonHeight,
      buttonX + buttonWidth - borderRadius,
      buttonY + buttonHeight
    );
    ctx.lineTo(buttonX + borderRadius, buttonY + buttonHeight);
    ctx.quadraticCurveTo(
      buttonX,
      buttonY + buttonHeight,
      buttonX,
      buttonY + buttonHeight - borderRadius
    );
    ctx.lineTo(buttonX, buttonY + borderRadius);
    ctx.quadraticCurveTo(buttonX, buttonY, buttonX + borderRadius, buttonY);
    ctx.closePath();

    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = isActive ? "rgba(120, 120, 120, 1)" : "white";
    ctx.fillStyle = isHover ? "rgba(40, 40, 40, 1)" : "rgba(0, 0, 0, 0)";

    ctx.fill();
    ctx.stroke();

    drawContent(
      ctx,
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      isHover,
      isActive
    );
  };

  return {
    draw,
    setActive: (a) => {
      isActive = a;
      draw();
    },
  };
};
