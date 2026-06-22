import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MobileView } from "./MobileView";

describe("MobileView (guided proof feed)", () => {
  afterEach(() => {
    cleanup();
  });

  it("surfaces the thesis and positioning statement", () => {
    render(<MobileView />);
    expect(screen.getAllByText(/Brian Hsu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/high-performance systems|systems engineering/i).length).toBeGreaterThan(0);
  });

  it("shows the primary proof paths (Infrastructure Systems, Data & Analytics, Research)", () => {
    render(<MobileView />);
    expect(screen.getAllByText(/Infrastructure Systems/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Data.*Analytics/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Research/i).length).toBeGreaterThan(0);
  });

  it("surfaces the flagship HPC cluster case study with its proof claim", () => {
    render(<MobileView />);
    expect(screen.getAllByText(/HPC Cluster/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bare.metal|InfiniBand|provisioning|from.scratch/i).length).toBeGreaterThan(0);
  });

  it("exposes contact links and resume download", () => {
    render(<MobileView />);
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:hsubrian1212@gmail.com"
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/brianhsuu"
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/brianhsu"
    );
    expect(
      screen.getByRole("link", { name: /resume/i })
    ).toHaveAttribute("href", "/Resume.pdf");
  });
});
