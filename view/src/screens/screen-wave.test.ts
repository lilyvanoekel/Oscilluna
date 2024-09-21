import { describe, it, expect, vi } from "vitest";
import { BuildScreenWave } from "./screen-wave";
import { BoundingBox } from "../domain/layout";
import * as waveDrawerModule from "../elements/wave-drawer";

const mockScene = {};

const boundingBoxTop: BoundingBox = {
  left: 0,
  right: 100,
  top: 50,
  bottom: 0,
};

const boundingBoxBottom: BoundingBox = {
  left: 0,
  right: 100,
  top: 0,
  bottom: -50,
};

const mockWaveDrawer = {
  setBoundingBox: vi.fn(),
  setVisible: vi.fn(),
};

vi.spyOn(waveDrawerModule, "BuildWaveDrawer").mockImplementation(
  () => mockWaveDrawer
);

describe("BuildScreenWave", () => {
  it("should initialize two wave drawers with the correct bounding boxes", () => {
    const patchConnection = {};
    const root = document.createElement("div");
    const getBoundingBoxTop = vi.fn().mockReturnValue(boundingBoxTop);
    const getBoundingBoxBottom = vi.fn().mockReturnValue(boundingBoxBottom);

    const screenWave = BuildScreenWave(
      patchConnection,
      mockScene as any,
      root,
      getBoundingBoxTop,
      getBoundingBoxBottom
    );

    expect(waveDrawerModule.BuildWaveDrawer).toHaveBeenCalledWith(
      patchConnection,
      mockScene,
      root,
      boundingBoxTop,
      "point1"
    );
    expect(waveDrawerModule.BuildWaveDrawer).toHaveBeenCalledWith(
      patchConnection,
      mockScene,
      root,
      boundingBoxBottom,
      "point2"
    );
  });

  it("should update bounding boxes when resize is called", () => {
    const patchConnection = {};
    const root = document.createElement("div");
    const getBoundingBoxTop = vi.fn().mockReturnValue(boundingBoxTop);
    const getBoundingBoxBottom = vi.fn().mockReturnValue(boundingBoxBottom);

    const screenWave = BuildScreenWave(
      patchConnection,
      mockScene as any,
      root,
      getBoundingBoxTop,
      getBoundingBoxBottom
    );

    screenWave.resize();

    expect(mockWaveDrawer.setBoundingBox).toHaveBeenCalledWith(boundingBoxTop);
    expect(mockWaveDrawer.setBoundingBox).toHaveBeenCalledWith(
      boundingBoxBottom
    );
  });

  it("should set visibility when setVisible is called", () => {
    const patchConnection = {};
    const root = document.createElement("div");
    const getBoundingBoxTop = vi.fn().mockReturnValue(boundingBoxTop);
    const getBoundingBoxBottom = vi.fn().mockReturnValue(boundingBoxBottom);

    const screenWave = BuildScreenWave(
      patchConnection,
      mockScene as any,
      root,
      getBoundingBoxTop,
      getBoundingBoxBottom
    );

    screenWave.setVisible(true);
    expect(mockWaveDrawer.setVisible).toHaveBeenCalledWith(true);

    screenWave.setVisible(false);
    expect(mockWaveDrawer.setVisible).toHaveBeenCalledWith(false);
  });
});
