"use client";

import { useEffect, useRef } from "react";
import { createTimeline, scrambleText, stagger } from "animejs";
import type { Timeline } from "animejs";

const CURSOR = "░▒▓█";
const SCRAMBLE_CHARS = "01░▒▓█#@";
const MAX_BOOT_MS = 28000;

/** Diamond grid row counts — matches reference layout */
const GRID_ROWS = [2, 3, 4, 5, 4, 3, 2];
const CENTER_ROW_INDEX = 3;

const BOOT_SEQUENCE = [
  { main: "Initializing desktop environment", sub: "kernel: bh-desktop v1.0", hold: 650 },
  { main: "Loading window system", sub: "compositor: active", hold: 600 },
  { main: "Mounting user interface", sub: "dock: ready", hold: 600 },
  { main: "Jumping into Brian Hsu's site", sub: "access granted", hold: 2000 },
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

function addGridIntro(
  tl: Timeline,
  slide: HTMLElement,
  center: HTMLElement,
  outer: HTMLElement[]
) {
  tl.add(slide, {
    opacity: { to: 1, duration: 250, ease: "linear" },
    scale: [{ from: 0.75, to: 1, duration: 1500, ease: "inOut(3.5)" }],
    ease: "inOut(3)",
  });

  tl.add(
    center,
    {
      scale: { from: 3, to: 1, duration: 1500, ease: "inOut(3.5)" },
      color: { from: "#a8ffcc", to: "#00ff66" },
      innerHTML: scrambleText({
        override: " ",
        ease: "inQuad",
        duration: 600,
        from: "center",
        cursor: CURSOR,
      }),
    },
    "<<"
  );

  if (outer.length > 0) {
    tl.add(
      outer,
      {
        scale: { from: 0.75, to: 1, duration: 1200, ease: "out(3)" },
        color: { to: "#00cc55" },
        innerHTML: scrambleText({
          override: " ",
          from: "center",
          duration: 650,
          revealDelay: 300,
          cursor: "░▒▓",
          perturbation: 0.25,
        }),
      },
      stagger([320, 950], { grid: true, from: "center", ease: "out(3)", start: "<<" })
    );

    tl.add(
      [...outer, center],
      {
        scale: { to: 0.85, duration: 700, ease: "in(3)" },
        innerHTML: scrambleText({
          text: "",
          override: false,
          from: "center",
          ease: "outQuad",
          reversed: true,
          duration: 900,
          cursor: "░▒▓",
        }),
      },
      "<+=180"
    );
  }

  tl.add(
    slide,
    {
      opacity: { to: 0, duration: 450, ease: "inOut(2)" },
      scale: { to: 1.06, duration: 450, ease: "inOut(2)" },
    },
    "+=120"
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
    tl.add(mainEl, { innerHTML: scrambleOut(450) });
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
        scale: [{ from: 0.94, to: 1, duration: 700, ease: "out(3)" }],
      }),
      innerHTML: scrambleIn(step.main, step.main.length > 22 ? 1100 : 800),
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

function addFinalTransition(
  tl: Timeline,
  overlay: HTMLElement,
  boot: HTMLElement,
  flash: HTMLElement,
  mainEl: HTMLElement,
  subEl: HTMLElement
) {
  tl.add({ duration: 300 });

  tl.add(flash, {
    opacity: [
      { to: 1, duration: 70, ease: "linear" },
      { to: 0, duration: 130, ease: "out(2)" },
    ],
  });

  tl.add(
    [boot, mainEl, subEl],
    {
      opacity: { to: 0, duration: 180, ease: "in(4)" },
      scale: { to: 1.08, duration: 220, ease: "in(4)" },
      filter: { to: "blur(6px)", duration: 220 },
    },
    "<<"
  );

  tl.add(
    overlay,
    {
      scale: [
        { to: 1.08, duration: 180, ease: "in(4)" },
        { to: 1.14, duration: 160, ease: "in(3)" },
      ],
      opacity: { to: 0, duration: 280, ease: "in(3)" },
      filter: { to: "blur(20px)", duration: 280 },
    },
    "<<+=40"
  );
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const overlay = overlayRef.current;
    const flash = flashRef.current;
    const slide = slideRef.current;
    const boot = bootRef.current;
    const mainEl = mainRef.current;
    const subEl = subRef.current;

    if (!overlay || !flash || !slide || !boot || !mainEl || !subEl) {
      onCompleteRef.current();
      return;
    }

    const center = slide.querySelector<HTMLElement>(".loading-grid-p.center");
    const outer = Array.from(
      slide.querySelectorAll<HTMLElement>(".loading-grid-p:not(.center)")
    );

    if (!center) {
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

    addGridIntro(tl, slide, center, outer);

    tl.add(boot, {
      opacity: { to: 1, duration: 350, ease: "out(2)" },
    });

    BOOT_SEQUENCE.forEach((step, i) => {
      addBootStep(tl, mainEl, subEl, step, i === 0);
    });

    addFinalTransition(tl, overlay, boot, flash, mainEl, subEl);
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
      <div
        ref={flashRef}
        className="loading-flash pointer-events-none absolute inset-0 z-20 bg-white opacity-0"
        aria-hidden
      />
      <div className="loading-scanlines pointer-events-none absolute inset-0" aria-hidden />

      <div ref={slideRef} className="loading-slide relative z-10">
        {GRID_ROWS.map((count, rowIndex) => (
          <div key={rowIndex} className="loading-row">
            {Array.from({ length: count }).map((_, colIndex) => {
              const isCenter =
                rowIndex === CENTER_ROW_INDEX && colIndex === Math.floor(count / 2);
              return (
                <p
                  key={colIndex}
                  className={`loading-grid-p${isCenter ? " center" : ""}`}
                >
                  Loading
                </p>
              );
            })}
          </div>
        ))}
      </div>

      <div
        ref={bootRef}
        className="loading-boot relative z-10 flex flex-col items-center px-6 text-center opacity-0"
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
