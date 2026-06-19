import { describe, expect, it } from "vitest";
import { isPastSundown } from "./clockUtils";

describe("isPastSundown", () => {
  it("is false during daytime hours", () => {
    expect(isPastSundown(6)).toBe(false);
    expect(isPastSundown(12)).toBe(false);
    expect(isPastSundown(17)).toBe(false);
  });

  it("is true after 6 PM and before 6 AM", () => {
    expect(isPastSundown(18)).toBe(true);
    expect(isPastSundown(23)).toBe(true);
    expect(isPastSundown(0)).toBe(true);
    expect(isPastSundown(5)).toBe(true);
  });
});
