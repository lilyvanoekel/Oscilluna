import { describe, it, expect, vi } from "vitest";
import { BuildScreenAdsr } from "./screen-adsr";
import { BoundingBox } from "../domain/layout";
import * as adsrDrawerModule from "../adsr-drawer";

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

const mockADSRDrawer = {
  setBoundingBox: vi.fn(),
  setVisible: vi.fn(),
};

vi.spyOn(adsrDrawerModule, "BuildADSRDrawer").mockImplementation(
  () => mockADSRDrawer
);

describe("BuildScreenAdsr", () => {
  it("should initialize two ADSR drawers with the correct bounding boxes", () => {
    const patchConnection = {};
    const root = document.createElement("div");
    const getBoundingBoxTop = vi.fn().mockReturnValue(boundingBoxTop);
    const getBoundingBoxBottom = vi.fn().mockReturnValue(boundingBoxBottom);

    const screenAdsr = BuildScreenAdsr(
      patchConnection,
      mockScene as any,
      root,
      getBoundingBoxTop,
      getBoundingBoxBottom
    );

    expect(adsrDrawerModule.BuildADSRDrawer).toHaveBeenCalledWith(
      patchConnection,
      mockScene,
      root,
      boundingBoxTop,
      "adsr1"
    );
    expect(adsrDrawerModule.BuildADSRDrawer).toHaveBeenCalledWith(
      patchConnection,
      mockScene,
      root,
      boundingBoxBottom,
      "adsr2"
    );
  });

  it("should update bounding boxes when resize is called", () => {
    const patchConnection = {};
    const root = document.createElement("div");
    const getBoundingBoxTop = vi.fn().mockReturnValue(boundingBoxTop);
    const getBoundingBoxBottom = vi.fn().mockReturnValue(boundingBoxBottom);

    const screenAdsr = BuildScreenAdsr(
      patchConnection,
      mockScene as any,
      root,
      getBoundingBoxTop,
      getBoundingBoxBottom
    );

    screenAdsr.resize();

    expect(mockADSRDrawer.setBoundingBox).toHaveBeenCalledWith(boundingBoxTop);
    expect(mockADSRDrawer.setBoundingBox).toHaveBeenCalledWith(
      boundingBoxBottom
    );
  });

  it("should set visibility when setVisible is called", () => {
    const patchConnection = {};
    const root = document.createElement("div");
    const getBoundingBoxTop = vi.fn().mockReturnValue(boundingBoxTop);
    const getBoundingBoxBottom = vi.fn().mockReturnValue(boundingBoxBottom);

    const screenAdsr = BuildScreenAdsr(
      patchConnection,
      mockScene as any,
      root,
      getBoundingBoxTop,
      getBoundingBoxBottom
    );

    screenAdsr.setVisible(true);
    expect(mockADSRDrawer.setVisible).toHaveBeenCalledWith(true);

    screenAdsr.setVisible(false);
    expect(mockADSRDrawer.setVisible).toHaveBeenCalledWith(false);
  });
});
