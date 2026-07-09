import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Desktop } from "./Desktop";
import { useWindowStore } from "@/store/windowStore";
import {
  getDefaultDesktopIconPositions,
  getDefaultFolderPositions,
} from "@/config/desktopLayout";

vi.mock("animejs", () => ({
  createTimeline: () => ({
    add: vi.fn().mockReturnThis(),
    call(callback: () => void) {
      callback();
      return this;
    },
    pause: vi.fn(),
    revert: vi.fn(),
  }),
  scrambleText: ({ text }: { text?: string }) => text ?? "",
}));

function resetWindowStore() {
  useWindowStore.setState({
    windows: [],
    activeWindowId: null,
    topZIndex: 10,
    theme: "dark",
    dockPositions: {
      home: null,
      about: null,
      projects: null,
      contact: null,
      terminal: null,
      calculator: null,
      photos: null,
      trash: null,
    },
    genieOrigin: null,
    genieAppId: null,
    dockVisible: true,
    folderPositions: getDefaultFolderPositions(),
    desktopIconPositions: getDefaultDesktopIconPositions(),
  });
}

async function renderReadyDesktop() {
  render(<Desktop />);

  await waitFor(() => {
    expect(screen.queryByLabelText("System boot sequence")).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText("Welcome to my desktop")).toBeInTheDocument();
    expect(screen.getByText("About Me")).toBeInTheDocument();
  });
}

describe("Desktop website", () => {
  beforeEach(() => {
    localStorage.clear();
    resetWindowStore();
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("boots into a proof-of-work desktop with primary orientation windows", async () => {
    await renderReadyDesktop();

    expect(screen.getAllByText("Brian Hsu").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/high-performance systems/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Systems" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Projects" })).toBeInTheDocument();
  });

  it("opens the contact path from the home window and exposes real links", async () => {
    await renderReadyDesktop();

    fireEvent.click(screen.getByText("Say hello").closest("button")!);

    expect(await screen.findByText("Get in Touch")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:hsubrian1212@gmail.com"
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/brianhsu"
    );
    expect(screen.getByRole("link", { name: /download resume/i })).toHaveAttribute(
      "href",
      "/Resume.pdf"
    );
  });

  it("opens a project folder, drills into a case study, and returns to the folder", async () => {
    await renderReadyDesktop();

    fireEvent.keyDown(screen.getByRole("button", { name: "Systems" }), {
      key: "Enter",
    });

    expect(await screen.findByText("Projects in this category — more coming soon.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Work-Stealing Thread Pool/i }));

    expect(await screen.findByRole("heading", { name: "Work-Stealing Thread Pool" })).toBeInTheDocument();
    expect(screen.getByText("Problem")).toBeInTheDocument();
    expect(screen.getByText("Approach")).toBeInTheDocument();
    expect(screen.getByText("What I Learned")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All Projects" }));

    expect(await screen.findByText("Projects in this category — more coming soon.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Work-Stealing Thread Pool/i })).toBeInTheDocument();
  });

  it("surfaces the flagship HPC cluster case study in the Systems folder", async () => {
    await renderReadyDesktop();

    fireEvent.keyDown(screen.getByRole("button", { name: "Systems" }), {
      key: "Enter",
    });

    // Flagship project card visible in the category list — pick the first match
    const flagshipCards = await screen.findAllByRole("button", { name: /HPC Cluster/i });
    expect(flagshipCards.length).toBeGreaterThan(0);

    // Click the one inside the Systems window (last opened window's card list)
    fireEvent.click(flagshipCards[0]);

    // Deep case study content — architecture and tradeoffs are only in the case study view
    expect((await screen.findAllByRole("heading", { name: /HPC Cluster/i })).length).toBeGreaterThan(0);
    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText("Tradeoffs")).toBeInTheDocument();
    expect(screen.getAllByText("Problem").length).toBeGreaterThan(0);
    expect(screen.getAllByText("What I Learned").length).toBeGreaterThan(0);
  });

  it("case study cards surface the proof claim tagline so a reviewer can decide which to open", async () => {
    await renderReadyDesktop();

    fireEvent.keyDown(screen.getByRole("button", { name: "Systems" }), {
      key: "Enter",
    });

    await screen.findAllByRole("button", { name: /HPC Cluster/i });

    // The HPC tagline (proof claim preview) is visible as text
    expect(
      screen.getAllByText(/bare.metal|InfiniBand|provisioning|from.scratch/i).length
    ).toBeGreaterThan(0);
  });
});
