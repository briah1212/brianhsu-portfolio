"use client";

import { useEffect, useRef } from "react";
import { createTimeline, scrambleText } from "animejs";
import type { Timeline } from "animejs";

const CURSOR = "░▒▓█";
const SCRAMBLE_CHARS = "01░▒▓█#@";
const MAX_BOOT_MS = 22000;
const STEP_GAP_MS = 220;

const BOOT_SEQUENCE = [
  { main: "Loading", sub: "", hold: 650 },
  { main: "Initializing desktop environment", sub: "kernel: bh-desktop v1.0", hold: 580 },
  { main: "Loading window system", sub: "compositor: active", hold: 550 },
  { main: "Mounting user interface", sub: "dock: ready", hold: 550 },
  { main: "Jumping into Brian Hsu's site", sub: "access granted", hold: 1800 },
] as const;

interface LoadingScreenProps {
  /** Mount desktop UI underneath before the overlay finishes exiting */
  onRevealDesktop: () => void;
  /** Remove loading screen from the tree */
  onExitComplete: () => void;
}

function scrambleIn(text: string, duration = 900) {
  return scrambleText({
    text,
    from: "center",
    duration,
    cursor: CURSOR,
    perturbation: 0.28,
    chars: SCRAMBLE_CHARS,
    settleDuration: 480,
    ease: "inOut(2)",
  });
}

function scrambleOut(duration = 420) {
  return scrambleText({
    text: "",
    override: false,
    from: "center",
    reversed: true,
    duration,
    cursor: "░▒▓",
    settleDuration: 280,
    ease: "outQuad",
  });
}

function addBootStep(
  tl: Timeline,
  mainEl: HTMLElement,
  subEl: HTMLElement,
  step: (typeof BOOT_SEQUENCE)[number],
  isFirst: boolean
) {
  if (!isFirst) {
    tl.add(mainEl, { innerHTML: scrambleOut() });
    tl.add(
      subEl,
      {
        innerHTML: scrambleText({
          text: "",
          override: false,
          from: "right",
          reversed: true,
          duration: 300,
          cursor: "░▒",
          settleDuration: 200,
        }),
      },
      "<<"
    );
    tl.add({ duration: STEP_GAP_MS });
  }

  tl.add(
    mainEl,
    {
      ...(isFirst && {
        opacity: { from: 0, to: 1, duration: 280 },
        scale: [{ from: 0.9, to: 1, duration: 750, ease: "out(3)" }],
      }),
      innerHTML: scrambleIn(step.main, step.main.length > 22 ? 1200 : 900),
    },
    isFirst ? 0 : undefined
  );

  if (step.sub) {
    tl.add(
      subEl,
      {
        opacity: { to: 1, duration: 200 },
        innerHTML: scrambleText({
          text: step.sub,
          from: "left",
          duration: 620,
          cursor: "░▒▓",
          perturbation: 0.18,
          settleDuration: 420,
          ease: "inOut(2)",
        }),
      },
      "<<+=240"
    );
  }

  tl.add({ duration: step.hold });
}

function addCinematicExit(
  tl: Timeline,
  overlay: HTMLElement,
  content: HTMLElement,
  flash: HTMLElement,
  onRevealDesktop: () => void,
  onExitComplete: () => void
) {
  let revealed = false;
  let exited = false;

  const revealDesktop = () => {
    if (revealed) return;
    revealed = true;
    onRevealDesktop();
  };

  const exitComplete = () => {
    if (exited) return;
    exited = true;
    onExitComplete();
  };

  // Beat after final line resolves
  tl.add({ duration: 350 });

  // White flash — system unlock burst
  tl.add(flash, {
    opacity: [{ to: 0.72, duration: 120, ease: "out(2)" }, { to: 0, duration: 220, ease: "inOutExpo" }],
  });

  // Pull into screen — content zooms forward
  tl.add(
    content,
    {
      scale: [{ to: 1.1, duration: 520, ease: "inOutExpo" }],
      opacity: { to: 0, duration: 480, ease: "inOut(2)" },
      filter: { to: "blur(6px)", duration: 480, ease: "inOut(2)" },
    },
    "<<+=40"
  );

  // Mount desktop underneath at flash peak
  tl.call(revealDesktop, "<<+=80");

  // Overlay dissolves — camera passes through
  tl.add(
    overlay,
    {
      scale: { to: 1.06, duration: 650, ease: "inOutExpo" },
      opacity: { to: 0, duration: 650, ease: "inOutExpo" },
      filter: { to: "blur(12px)", duration: 650, ease: "inOut(2)" },
    },
    "<<"
  );

  tl.call(exitComplete);
}

export function LoadingScreen({ onRevealDesktop, onExitComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const onRevealRef = useRef(onRevealDesktop);
  const onExitRef = useRef(onExitComplete);
  onRevealRef.current = onRevealDesktop;
  onExitRef.current = onExitComplete;

  useEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const flash = flashRef.current;
    const mainEl = mainRef.current;
    const subEl = subRef.current;

    if (!overlay || !content || !flash || !mainEl || !subEl) {
      onRevealRef.current();
      onExitRef.current();
      return;
    }

    let finished = false;
    const forceExit = () => {
      if (finished) return;
      finished = true;
      onRevealRef.current();
      onExitRef.current();
    };

    const tl = createTimeline({ autoplay: true });

    BOOT_SEQUENCE.forEach((step, i) => {
      addBootStep(tl, mainEl, subEl, step, i === 0);
    });

    addCinematicExit(
      tl,
      overlay,
      content,
      flash,
      () => onRevealRef.current(),
      () => {
        if (finished) return;
        finished = true;
        onExitRef.current();
      }
    );

    const fallback = setTimeout(forceExit, MAX_BOOT_MS);

    return () => {
      clearTimeout(fallback);
      tl.pause();
      tl.revert();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="loading-screen fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-black select-none"
      style={{ transformOrigin: "center center" }}
      aria-live="polite"
      aria-busy="true"
      aria-label="System boot sequence"
    >
      <div
        ref={flashRef}
        className="loading-flash pointer-events-none absolute inset-0 z-20 bg-white opacity-0"
        aria-hidden
      />
      <div className="loading-scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{ transformOrigin: "center center" }}
      >
        <p
          ref={mainRef}
          className="loading-line font-mono text-xl font-medium tracking-[0.2em] text-[#00ff66] sm:text-2xl md:text-3xl"
        />
        <p
          ref={subRef}
          className="loading-sub mt-5 min-h-[1.25rem] font-mono text-[11px] tracking-[0.35em] text-[#00cc55]/75 uppercase sm:text-xs"
        />
      </div>
    </div>
  );
}
