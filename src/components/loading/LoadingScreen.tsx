"use client";

import { useEffect, useRef } from "react";
import { createTimeline, scrambleText, stagger } from "animejs";
import type { Timeline } from "animejs";

const CURSOR = "░▒▓█";
const SCRAMBLE_CHARS = "01░▒▓█#@";
const MAX_BOOT_MS = 28000;

/** Symmetric diamond grid — matches reference row counts */
const INTRO_ROWS = [2, 3, 4, 5, 4, 3, 2] as const;
const INTRO_CENTER_ROW = 3;

const BOOT_SEQUENCE = [
  { main: "Loading", sub: "", hold: 650 },
  { main: "Initializing desktop environment", sub: "kernel: bh-desktop v1.0", hold: 580 },
  { main: "Loading window system", sub: "compositor: active", hold: 520 },
  { main: "Mounting user interface", sub: "dock: ready", hold: 520 },
  { main: "Jumping into Brian Hsu's site", sub: "access granted", hold: 1600 },
] as const;

interface LoadingScreenProps {
  onComplete: () => void;
}

function scrambleIn(text: string, duration = 850) {
  return scrambleText({
    text,
    from: "center",
    duration,
    cursor: CURSOR,
    perturbation: 0.3,
    chars: SCRAMBLE_CHARS,
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
    ease: "outQuad",
  });
}

function addIntroducingGrid(tl: Timeline, slide: HTMLElement) {
  const centerEl = slide.querySelector("p.center");
  const otherEls = slide.querySelectorAll("p:not(.center)");

  tl.add(slide, {
    opacity: { to: 1, duration: 280, ease: "linear" },
    scale: [{ from: 0.72, to: 1, duration: 1400, ease: "inOut(3.5)" }],
    ease: "inOut(3)",
  });

  if (centerEl) {
    tl.add(
      centerEl,
      {
        scale: { from: 3, to: 1, duration: 1200, ease: "inOut(3)" },
        innerHTML: scrambleText({
          text: "Introducing",
          override: " ",
          ease: "inQuad",
          duration: 620,
          from: "center",
          cursor: CURSOR,
          chars: SCRAMBLE_CHARS,
        }),
      },
      "<<"
    );
  }

  tl.add(
    otherEls,
    {
      scale: [{ from: 0.6, to: 1, duration: 900, ease: "out(3)" }],
      innerHTML: scrambleText({
        text: "Introducing",
        override: " ",
        from: "center",
        duration: 580,
        revealDelay: 280,
        cursor: "░▒▓",
        perturbation: 0.25,
        chars: SCRAMBLE_CHARS,
      }),
    },
    stagger([180, 720], { grid: true, from: "center", ease: "out(3)", start: "<<" })
  );

  tl.add({ duration: 700 });
}

function exitIntroducingGrid(tl: Timeline, slide: HTMLElement) {
  const allPs = slide.querySelectorAll("p");

  tl.add(
    allPs,
    {
      innerHTML: scrambleText({
        text: "",
        override: false,
        from: "center",
        reversed: true,
        duration: 520,
        cursor: "░▒▓",
        ease: "outQuad",
      }),
    },
    stagger([40, 280], { grid: true, from: "center", ease: "out(3)" })
  );

  tl.add(
    slide,
    {
      opacity: { to: 0, duration: 450, ease: "in(2)" },
      scale: { to: 1.06, duration: 500, ease: "in(2)" },
      filter: { to: "blur(6px)", duration: 450 },
    },
    "<<+=120"
  );
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
        }),
      },
      "<<"
    );
    tl.add({ duration: 120 });
  }

  tl.add(
    mainEl,
    {
      ...(isFirst && {
        opacity: { from: 0, to: 1, duration: 280 },
        scale: [{ from: 0.9, to: 1, duration: 700, ease: "out(3)" }],
      }),
      innerHTML: scrambleIn(step.main, step.main.length > 22 ? 1100 : 820),
    },
    isFirst ? 0 : "+=100"
  );

  if (step.sub) {
    tl.add(
      subEl,
      {
        opacity: { to: 1, duration: 200 },
        innerHTML: scrambleText({
          text: step.sub,
          from: "left",
          duration: 580,
          cursor: "░▒▓",
          perturbation: 0.2,
          ease: "inOut(2)",
        }),
      },
      "<<+=220"
    );
  }

  tl.add({ duration: step.hold });
}

function addCinematicExit(
  tl: Timeline,
  overlay: HTMLElement,
  bootPanel: HTMLElement,
  flash: HTMLElement
) {
  tl.add({ duration: 200 });

  tl.add(flash, {
    opacity: [
      { to: 0.92, duration: 70, ease: "out(4)" },
      { to: 0, duration: 220, ease: "in(4)" },
    ],
  });

  tl.add(
    bootPanel,
    {
      scale: [{ to: 1.1, duration: 260, ease: "in(4)" }],
      opacity: { to: 0, duration: 280, ease: "in(4)" },
      filter: [{ to: "blur(14px)", duration: 260, ease: "in(4)" }],
    },
    "<<"
  );

  tl.add(
    overlay,
    {
      scale: [{ to: 1.14, duration: 300, ease: "in(4)" }],
      opacity: { to: 0, duration: 340, ease: "in(3)" },
      filter: [{ to: "blur(18px)", duration: 300, ease: "in(4)" }],
      backgroundColor: { to: "#000000", duration: 340 },
    },
    "<<+=40"
  );
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const introSlideRef = useRef<HTMLDivElement>(null);
  const bootPanelRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const overlay = overlayRef.current;
    const introSlide = introSlideRef.current;
    const bootPanel = bootPanelRef.current;
    const mainEl = mainRef.current;
    const subEl = subRef.current;
    const flash = flashRef.current;

    if (!overlay || !introSlide || !bootPanel || !mainEl || !subEl || !flash) {
      onCompleteRef.current();
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onCompleteRef.current();
    };

    const tl = createTimeline({ autoplay: true });

    addIntroducingGrid(tl, introSlide);

    tl.set(bootPanel, { opacity: 1 });
    exitIntroducingGrid(tl, introSlide);

    BOOT_SEQUENCE.forEach((step, i) => {
      addBootStep(tl, mainEl, subEl, step, i === 0);
    });

    addCinematicExit(tl, overlay, bootPanel, flash);
    tl.call(finish);

    const fallback = setTimeout(finish, MAX_BOOT_MS);

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
      aria-live="polite"
      aria-busy="true"
      aria-label="System boot sequence"
    >
      <div className="loading-scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div ref={flashRef} className="loading-flash pointer-events-none absolute inset-0 bg-white opacity-0" aria-hidden />

      <div
        ref={introSlideRef}
        className="loading-intro-slide absolute inset-0 flex flex-col items-center justify-center opacity-0"
      >
        {INTRO_ROWS.map((count, rowIdx) => (
          <div key={rowIdx} className="loading-intro-row flex flex-nowrap items-center justify-center">
            {Array.from({ length: count }).map((_, colIdx) => (
              <p
                key={colIdx}
                className={
                  rowIdx === INTRO_CENTER_ROW && colIdx === Math.floor(count / 2)
                    ? "center"
                    : undefined
                }
              >
                Introducing
              </p>
            ))}
          </div>
        ))}
      </div>

      <div
        ref={bootPanelRef}
        className="loading-boot-panel relative z-10 flex flex-col items-center px-6 text-center opacity-0"
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
