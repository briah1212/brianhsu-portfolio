"use client";

import { useEffect, useRef } from "react";
import { createTimeline, scrambleText, stagger } from "animejs";
import type { Timeline } from "animejs";

const CURSOR = "░▒▓█";
const SCRAMBLE_CHARS = "01░▒▓█#@";
const MAX_BOOT_MS = 24000;

/** Symmetric row layout — center row is the focal 5-wide line */
const GRID_ROWS = [2, 2, 3, 5, 3, 2, 2] as const;

const BOOT_SEQUENCE = [
  {
    main: "Initializing desktop environment",
    sub: "kernel: bh-desktop v1.0",
    hold: 700,
  },
  { main: "Loading window system", sub: "compositor: active", hold: 650 },
  { main: "Mounting user interface", sub: "dock: ready", hold: 650 },
  {
    main: "Jumping into Brian Hsu's site",
    sub: "access granted",
    hold: 2000,
  },
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

function addIntroGrid(tl: Timeline, gridSlide: HTMLElement) {
  const center = gridSlide.querySelector<HTMLElement>(".loading-center");
  const outerCells = gridSlide.querySelectorAll<HTMLElement>(
    ".loading-grid p:not(.loading-center)"
  );
  const allCells = gridSlide.querySelectorAll<HTMLElement>(".loading-grid p");

  if (!center) return;

  tl.add(gridSlide, {
    opacity: { to: 1, duration: 280 },
    scale: [{ from: 0.82, to: 1, duration: 1200, ease: "out(3)" }],
  });

  tl.add(center, {
    opacity: { to: 1, duration: 220 },
    scale: [{ from: 2.8, to: 1, duration: 1100, ease: "out(3.5)" }],
    innerHTML: scrambleText({
      text: "Loading",
      from: "center",
      duration: 720,
      cursor: CURSOR,
      perturbation: 0.2,
      chars: SCRAMBLE_CHARS,
      ease: "inQuad",
    }),
  });

  tl.add(
    outerCells,
    {
      opacity: { to: 1, duration: 200 },
      scale: [{ from: 0.7, to: 1, duration: 800, ease: "out(3)" }],
      innerHTML: scrambleText({
        override: " ",
        from: "center",
        duration: 620,
        revealDelay: 320,
        cursor: "░▒▓█",
        perturbation: 0.28,
        chars: SCRAMBLE_CHARS,
      }),
    },
    stagger([300, 900], {
      grid: true,
      from: "center",
      ease: "out(3)",
      start: "<<+=120",
    })
  );

  tl.add({ duration: 900 });

  tl.add(
    allCells,
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
    stagger([100, 450], { grid: true, from: "center", ease: "out(3)" })
  );

  tl.add(
    gridSlide,
    {
      opacity: { to: 0, duration: 450, ease: "in(2)" },
      scale: { to: 0.88, duration: 450, ease: "in(2)" },
      filter: { to: "blur(6px)", duration: 400 },
    },
    "+=100"
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
    tl.add(mainEl, { innerHTML: scrambleOut(480) });
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
    isFirst ? "+=200" : "+=140"
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
          perturbation: 0.22,
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
  flash: HTMLElement,
  sequenceSlide: HTMLElement
) {
  tl.add(flash, {
    opacity: [{ to: 1, duration: 55, ease: "in(4)" }, { to: 0, duration: 160, ease: "out(4)" }],
  }, "+=180");

  tl.add(
    sequenceSlide,
    {
      scale: [{ to: 1.08, duration: 160, ease: "in(3)" }, { to: 1.12, duration: 100, ease: "in(4)" }],
      opacity: { to: 0, duration: 220, ease: "in(3)" },
      filter: { to: "blur(10px)", duration: 180, ease: "in(2)" },
    },
    "<<+=30"
  );

  tl.add(
    overlay,
    {
      scale: [{ to: 1.06, duration: 200, ease: "in(3)" }, { to: 1.1, duration: 140, ease: "in(4)" }],
      opacity: { to: 0, duration: 260, ease: "in(3)" },
      filter: { to: "blur(16px)", duration: 220, ease: "in(2)" },
    },
    "<<"
  );
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const gridSlideRef = useRef<HTMLDivElement>(null);
  const sequenceSlideRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const overlay = overlayRef.current;
    const gridSlide = gridSlideRef.current;
    const sequenceSlide = sequenceSlideRef.current;
    const flash = flashRef.current;
    const mainEl = mainRef.current;
    const subEl = subRef.current;

    if (!overlay || !gridSlide || !sequenceSlide || !flash || !mainEl || !subEl) {
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

    addIntroGrid(tl, gridSlide);

    tl.add(
      sequenceSlide,
      { opacity: { to: 1, duration: 350 }, scale: { from: 0.96, to: 1, duration: 500 } },
      "+=120"
    );

    BOOT_SEQUENCE.forEach((step, i) => {
      addBootStep(tl, mainEl, subEl, step, i === 0);
    });

    addCinematicExit(tl, overlay, flash, sequenceSlide);
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
      className="loading-screen fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-black select-none"
      aria-live="polite"
      aria-busy="true"
      aria-label="System boot sequence"
    >
      <div className="loading-scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div ref={flashRef} className="loading-flash pointer-events-none absolute inset-0 z-20 bg-white opacity-0" aria-hidden />

      {/* Intro grid — symmetric data-bloom */}
      <div
        ref={gridSlideRef}
        className="loading-grid-slide absolute inset-0 z-10 flex items-center justify-center opacity-0"
      >
        <div className="loading-grid">
          {GRID_ROWS.map((count, rowIndex) => {
            const centerRow = rowIndex === 3;
            const centerIndex = centerRow ? Math.floor(count / 2) : -1;
            return (
              <div key={rowIndex} className="loading-row">
                {Array.from({ length: count }).map((_, colIndex) => (
                  <p
                    key={colIndex}
                    className={
                      colIndex === centerIndex ? "loading-center loading-cell" : "loading-cell"
                    }
                  >
                    Loading
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Boot log sequence */}
      <div
        ref={sequenceSlideRef}
        className="loading-sequence relative z-10 flex flex-col items-center px-6 text-center opacity-0"
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
