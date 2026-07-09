export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export const RESIZE_EDGE = 8;
export const RESIZE_CORNER = 12;

export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 240;
export const MENU_BAR_HEIGHT = 28;
export const DOCK_AREA = 90;

export function getEffectiveDockArea(): number {
  // Windows may extend behind the dock, so it reserves no layout area.
  // Kept as a function so a future dock-avoidance mode has one seam.
  return 0;
}

export function getMaximizedWindowBounds(
  viewportWidth = globalThis.innerWidth,
  viewportHeight = globalThis.innerHeight,
  dockArea: number = DOCK_AREA
): ResizeRect {
  return {
    x: 0,
    y: MENU_BAR_HEIGHT,
    width: viewportWidth,
    height: viewportHeight - MENU_BAR_HEIGHT - dockArea,
  };
}

interface BoundsTargetInput {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  preMaximizeBounds?: { x: number; y: number; width: number; height: number };
}

/** Visual target for window bounds — keeps maximized store size during restore animation. */
export function getWindowBoundsTarget(
  win: BoundsTargetInput,
  dockArea: number = DOCK_AREA
): ResizeRect & { radius: number } {
  if (win.isMaximized) {
    return { ...getMaximizedWindowBounds(undefined, undefined, dockArea), radius: 0 };
  }
  if (win.preMaximizeBounds) {
    return { ...win.preMaximizeBounds, radius: 12 };
  }
  return { x: win.x, y: win.y, width: win.width, height: win.height, radius: 12 };
}

export const RESIZE_CURSORS: Record<ResizeDirection, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  sw: "nesw-resize",
};

interface ResizeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ComputeResizeInput {
  direction: ResizeDirection;
  start: ResizeRect;
  dx: number;
  dy: number;
  viewportWidth: number;
  viewportHeight: number;
  dockArea?: number;
}

export function computeResizedWindow({
  direction,
  start,
  dx,
  dy,
  viewportWidth,
  viewportHeight,
  dockArea = DOCK_AREA,
}: ComputeResizeInput): ResizeRect {
  let x = start.x;
  let y = start.y;
  let width = start.width;
  let height = start.height;

  const affectsX = direction.includes("w");
  const affectsY = direction.includes("n");
  const affectsW = direction.includes("e") || direction.includes("w");
  const affectsH = direction.includes("s") || direction.includes("n");

  if (direction.includes("e")) {
    width = start.width + dx;
  }
  if (direction.includes("w")) {
    width = start.width - dx;
    x = start.x + dx;
  }
  if (direction.includes("s")) {
    height = start.height + dy;
  }
  if (direction.includes("n")) {
    height = start.height - dy;
    y = start.y + dy;
  }

  if (affectsW && width < MIN_WINDOW_WIDTH) {
    if (affectsX) {
      x = start.x + start.width - MIN_WINDOW_WIDTH;
    }
    width = MIN_WINDOW_WIDTH;
  }

  if (affectsH && height < MIN_WINDOW_HEIGHT) {
    if (affectsY) {
      y = start.y + start.height - MIN_WINDOW_HEIGHT;
    }
    height = MIN_WINDOW_HEIGHT;
  }

  if (affectsX && x < 0) {
    width += x;
    x = 0;
    width = Math.max(MIN_WINDOW_WIDTH, width);
  }

  if (affectsY && y < MENU_BAR_HEIGHT) {
    height += y - MENU_BAR_HEIGHT;
    y = MENU_BAR_HEIGHT;
    height = Math.max(MIN_WINDOW_HEIGHT, height);
  }

  const maxWidth = viewportWidth - x;
  const maxHeight = viewportHeight - y - dockArea;

  if (affectsW) {
    width = Math.min(width, maxWidth);
    if (affectsX) {
      x = Math.max(0, start.x + start.width - width);
    }
  }

  if (affectsH) {
    height = Math.min(height, maxHeight);
    if (affectsY) {
      y = Math.max(MENU_BAR_HEIGHT, start.y + start.height - height);
    }
  }

  return { x, y, width, height };
}
