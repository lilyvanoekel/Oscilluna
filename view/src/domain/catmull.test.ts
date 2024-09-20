import { describe, it, expect } from "vitest";
import {
  NUMBER_OF_POINTS,
  generateCatmullRomControlPoints,
  interpolateCatmullRom,
  decodeCatmullRom,
} from "./catmull";

describe("catmull", () => {
  describe("generateCatmullRomControlPoints", () => {
    it("should generate the correct number of control points", () => {
      const waveform = Array(100)
        .fill(0)
        .map((_, i) => i);
      const controlPoints = generateCatmullRomControlPoints(waveform);
      expect(controlPoints.length).toBe(NUMBER_OF_POINTS);
    });
  });

  describe("interpolateCatmullRom", () => {
    it("should correctly interpolate between points", () => {
      const p0 = 0,
        p1 = 1,
        p2 = 2,
        p3 = 3;
      const t = 0.5;

      const result = interpolateCatmullRom(p0, p1, p2, p3, t);
      expect(result).toBeCloseTo(1.5);
    });

    it("should return p1 when t = 0", () => {
      const p0 = 0,
        p1 = 1,
        p2 = 2,
        p3 = 3;
      const result = interpolateCatmullRom(p0, p1, p2, p3, 0);
      expect(result).toBe(p1);
    });

    it("should return p2 when t = 1", () => {
      const p0 = 0,
        p1 = 1,
        p2 = 2,
        p3 = 3;
      const result = interpolateCatmullRom(p0, p1, p2, p3, 1);
      expect(result).toBe(p2);
    });
  });

  describe("decodeCatmullRom", () => {
    it("should decode control points into a waveform of the correct length", () => {
      const controlPoints = [10, 20, 30, 40];
      const length = 1024;

      const decodedWaveform = decodeCatmullRom(controlPoints, length);
      expect(decodedWaveform.length).toBe(length);
    });
  });
});
