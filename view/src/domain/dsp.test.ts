import { describe, it, expect } from "vitest";
import {
  wrapWaveform,
  normalizeWaveform,
  generateWaveform,
  linearToDb,
  dbToLinear,
} from "./dsp";

describe("dsp", () => {
  describe("wrapWaveform", () => {
    it("should shift the waveform correctly", () => {
      const waveform = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = wrapWaveform(waveform, 5);
      expect(result).toEqual([6, 7, 8, 9, 10, 1, 2, 3, 4, 5]);
    });

    it("should handle shiftAmount greater than the waveform length", () => {
      const waveform = [1, 2, 3, 4, 5];
      const result = wrapWaveform(waveform, 7);
      expect(result).toEqual([3, 4, 5, 1, 2]);
    });

    it("should return the waveform unchanged if shiftAmount is 0", () => {
      const waveform = [1, 2, 3, 4, 5];
      const result = wrapWaveform(waveform, 0);
      expect(result).toEqual(waveform);
    });

    it("should handle negative shift amounts correctly", () => {
      const waveform = [1, 2, 3, 4, 5];
      const result = wrapWaveform(waveform, -2);
      expect(result).toEqual([4, 5, 1, 2, 3]);
    });
  });

  describe("normalizeWaveform", () => {
    it("should normalize the waveform so max absolute value is 1 and mean is 0", () => {
      const waveform = [1, 2, 3, 4, 5];
      const result = normalizeWaveform(waveform);

      const maxAbsValue = Math.max(...result.map(Math.abs));
      const mean =
        result.reduce((sum, value) => sum + value, 0) / result.length;

      expect(maxAbsValue).toBeCloseTo(1);
      expect(mean).toBeCloseTo(0);
    });
  });

  describe("generateWaveform", () => {
    const points = [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: 3, y: -10 },
      { x: 4, y: 15 },
    ];

    const boundingBox = {
      left: 0,
      top: 0,
      right: 20,
      bottom: 20,
    };

    it("generates waveforms 1024 values", () => {
      const waveform = generateWaveform(points, boundingBox);
      expect(waveform.length).toEqual(1024);
    });

    it("normalizes the generated waveform", () => {
      const waveform = generateWaveform(points, boundingBox);

      const maxAbsValue = Math.max(...waveform.map(Math.abs));
      const mean =
        waveform.reduce((sum, value) => sum + value, 0) / waveform.length;

      expect(maxAbsValue).toBeCloseTo(1);
      expect(mean).toBeCloseTo(0);
    });
  });

  describe("linearToDb", () => {
    it("should return -85 when linear value is less than or equal to 0", () => {
      expect(linearToDb(0)).toBe(-85);
      expect(linearToDb(-1)).toBe(-85);
    });

    it("should correctly convert positive linear values to dB", () => {
      expect(linearToDb(1)).toBeCloseTo(0);
      expect(linearToDb(0.1)).toBeCloseTo(-20);
      expect(linearToDb(10)).toBeCloseTo(20);
    });
  });

  describe("dbToLinear", () => {
    it("should correctly convert dB values to linear", () => {
      expect(dbToLinear(0)).toBeCloseTo(1);
      expect(dbToLinear(-20)).toBeCloseTo(0.1);
      expect(dbToLinear(20)).toBeCloseTo(10);
    });

    it("should handle very negative dB values", () => {
      expect(dbToLinear(-85)).toBeCloseTo(0);
    });
  });
});
