import { describe, expect, it } from "vitest";
import {
  DOCK_AREA,
  MENU_BAR_HEIGHT,
  computeResizedWindow,
  getEffectiveDockArea,
  getMaximizedWindowBounds,
  getWindowBoundsTarget,
} from "./resizeUtils";

describe("getEffectiveDockArea", () => {
  it("returns zero so windows can extend behind the dock", () => {
    expect(getEffectiveDockArea()).toBe(0);
  });
});

describe("getMaximizedWindowBounds", () => {
  it("fills viewport below menu bar with dock visible", () => {
    expect(getMaximizedWindowBounds(1200, 800, DOCK_AREA)).toEqual({
      x: 0,
      y: MENU_BAR_HEIGHT,
      width: 1200,
      height: 800 - MENU_BAR_HEIGHT - DOCK_AREA,
    });
  });

  it("extends to bottom when dock is hidden", () => {
    expect(getMaximizedWindowBounds(1200, 800, 0)).toEqual({
      x: 0,
      y: MENU_BAR_HEIGHT,
      width: 1200,
      height: 800 - MENU_BAR_HEIGHT,
    });
  });
});

describe("getWindowBoundsTarget", () => {
  it("uses maximized bounds when window is maximized", () => {
    const target = getWindowBoundsTarget(
      { x: 10, y: 10, width: 400, height: 300, isMaximized: true },
      0
    );
    expect(target).toMatchObject({
      x: 0,
      y: MENU_BAR_HEIGHT,
      radius: 0,
    });
  });

  it("uses pre-maximize bounds during restore animation", () => {
    const target = getWindowBoundsTarget({
      x: 0,
      y: MENU_BAR_HEIGHT,
      width: 1200,
      height: 700,
      isMaximized: false,
      preMaximizeBounds: { x: 120, y: 93, width: 520, height: 420 },
    });
    expect(target).toEqual({
      x: 120,
      y: 93,
      width: 520,
      height: 420,
      radius: 12,
    });
  });
});

describe("computeResizedWindow", () => {
  const start = { x: 100, y: 100, width: 400, height: 300 };

  it("respects dock area when resizing south edge", () => {
    const result = computeResizedWindow({
      direction: "se",
      start,
      dx: 0,
      dy: 10_000,
      viewportWidth: 1200,
      viewportHeight: 800,
      dockArea: DOCK_AREA,
    });
    expect(result.height).toBe(800 - start.y - DOCK_AREA);
  });

  it("allows resize to viewport bottom when dock is hidden", () => {
    const result = computeResizedWindow({
      direction: "se",
      start,
      dx: 0,
      dy: 10_000,
      viewportWidth: 1200,
      viewportHeight: 800,
      dockArea: 0,
    });
    expect(result.height).toBe(800 - start.y);
  });
});
