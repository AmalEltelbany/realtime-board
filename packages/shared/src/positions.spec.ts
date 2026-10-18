import { describe, expect, it } from "vitest";
import { comparePositions, positionBetween } from "./positions.js";

describe("positionBetween", () => {
  it("creates keys that sort between their neighbours", () => {
    const a = positionBetween(null, null);
    const c = positionBetween(a, null);
    const b = positionBetween(a, c);
    expect([c, a, b].map((position) => ({ position })).sort(comparePositions).map((p) => p.position)).toEqual([a, b, c]);
  });

  it("keeps working after many inserts at the same spot", () => {
    let low = positionBetween(null, null);
    const high = positionBetween(low, null);
    for (let i = 0; i < 500; i++) {
      const mid = positionBetween(low, high);
      expect(mid > low && mid < high).toBe(true);
      low = mid;
    }
  });

  it("rejects neighbours given in the wrong order", () => {
    const a = positionBetween(null, null);
    const b = positionBetween(a, null);
    expect(() => positionBetween(b, a)).toThrow();
  });
});
