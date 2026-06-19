import { describe, expect, it } from "vitest";
import {
  PROJECT_CATEGORIES,
  getProjectsWindowTitle,
  isProjectCategory,
} from "./categories";

describe("isProjectCategory", () => {
  it("accepts known category ids", () => {
    for (const category of PROJECT_CATEGORIES) {
      expect(isProjectCategory(category.id)).toBe(true);
    }
  });

  it("rejects unknown values", () => {
    expect(isProjectCategory("not-a-category")).toBe(false);
    expect(isProjectCategory("")).toBe(false);
  });
});

describe("getProjectsWindowTitle", () => {
  it('returns "Projects" when route is missing', () => {
    expect(getProjectsWindowTitle()).toBe("Projects");
    expect(getProjectsWindowTitle(undefined)).toBe("Projects");
  });

  it("returns category title for category routes", () => {
    expect(getProjectsWindowTitle("work")).toBe("Work");
    expect(getProjectsWindowTitle("academics")).toBe("Academics");
  });

  it("returns project title for project slug routes", () => {
    expect(getProjectsWindowTitle("distributed-cache")).toBe(
      "Distributed Cache Layer"
    );
  });
});
