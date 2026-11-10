import { describe, expect, it } from "vitest";
import { DOCK_AREA } from "@/components/window/resizeUtils";
import {
  DESKTOP_FOLDER_LAYOUT,
  clampStoredPositions,
  getDefaultDesktopIconPositions,
  getDefaultFolderPositions,
} from "./desktopLayout";

const allYs = (vh?: number) => [
  ...Object.values(getDefaultFolderPositions(vh)),
  ...Object.values(getDefaultDesktopIconPositions(vh)),
].map((p) => p.y);

describe("default desktop column", () => {
  it("keeps the hand-tuned positions when the viewport is tall enough", () => {
    expect(getDefaultFolderPositions(1080)).toEqual(getDefaultFolderPositions());
    expect(getDefaultDesktopIconPositions(1080)).toEqual(getDefaultDesktopIconPositions());
  });

  it.each([700, 768])("fits every icon above the dock at %ipx tall", (vh) => {
    const maxY = vh - DESKTOP_FOLDER_LAYOUT.itemHeight - DOCK_AREA;
    expect(Math.max(...allYs(vh))).toBeLessThanOrEqual(maxY);
  });

  it("keeps the column order when compressing", () => {
    const folders = getDefaultFolderPositions(700);
    expect(folders.academics.y).toBeLessThan(folders.work.y);
    expect(folders.personal.y).toBeLessThan(getDefaultDesktopIconPositions(700).trash.y);
  });
});

describe("clampStoredPositions", () => {
  it("pulls saved positions back onto a smaller screen and drops bad entries", () => {
    const clamped = clampStoredPositions(
      { work: { x: 1800, y: 1000 }, research: { x: "a" as unknown as number, y: 2 } },
      1024,
      700
    );
    expect(clamped.work).toEqual({
      x: 1024 - DESKTOP_FOLDER_LAYOUT.itemWidth,
      y: 700 - DESKTOP_FOLDER_LAYOUT.itemHeight,
    });
    expect(clamped).not.toHaveProperty("research");
  });
});
