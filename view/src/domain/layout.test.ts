import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { xUnits, getBoundingBoxTop, getBoundingBoxBottom } from "./layout";

describe("layout", () => {
  describe("xUnits", () => {
    it("should return values relative to window width", () => {
      const units = 10;

      vi.spyOn(window, "innerWidth", "get").mockReturnValue(600);
      const resultAtWidth600 = xUnits(units);

      vi.spyOn(window, "innerWidth", "get").mockReturnValue(1200);
      const resultAtWidth1200 = xUnits(units);

      expect(resultAtWidth600 * 2).toBe(resultAtWidth1200);
    });

    it("should handle window width 0", () => {
      const units = 10;

      vi.spyOn(window, "innerWidth", "get").mockReturnValue(0);
      const result = xUnits(units);

      expect(result).toBe(0);
    });
  });

  describe("BoundingBox", () => {
    beforeEach(() => {
      vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
      vi.spyOn(window, "innerHeight", "get").mockReturnValue(768);
      vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
      vi.spyOn(window, "innerHeight", "get").mockReturnValue(768);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return the correct bounding box for the top", () => {
      const boundingBoxTop = getBoundingBoxTop();

      expect(boundingBoxTop.left).toBeCloseTo(-512 + xUnits(100));
      expect(boundingBoxTop.right).toBeCloseTo(512 - xUnits(14));
      expect(boundingBoxTop.top).toBeCloseTo(384 - 18);
      expect(boundingBoxTop.bottom).toBe(18);
    });

    it("should return the correct bounding box for the bottom", () => {
      const boundingBoxBottom = getBoundingBoxBottom();

      expect(boundingBoxBottom.left).toBeCloseTo(-512 + xUnits(100));
      expect(boundingBoxBottom.right).toBeCloseTo(512 - xUnits(14));
      expect(boundingBoxBottom.top).toBeCloseTo(-18);
      expect(boundingBoxBottom.bottom).toBeCloseTo(-384 + 18);
    });
  });
});
