"use client";

import { useEffect, useRef } from "react";
import { createTimeline, scrambleText } from "animejs";
import type { Timeline } from "animejs";

const CURSOR = "░▒▓█";
const SCRAMBLE_CHARS = "01░▒▓█#@";
const MAX_BOOT_MS = 24000;
const STEP_GAP_MS = 140;

const BOOT_SEQUENCE = [
  { main: "Loading", sub: "", hold: 720 },
  { main: "Initializing desktop environment", sub: "kernel: bh-desktop v1.0", hold: 680 },
  { main: "Loading window system", sub: "compositor: active", hold: 640 },
  { main: "Mounting user interface", sub: "dock: ready", hold: 640 },
  { main: "Jumping into Brian Hsu's site", sub: "access granted", hold: 2200 },
] as const;

interface LoadingScreenProps {
  desktopRef: React.RefObject<HTMLDivElement | null>;
  onComplete: () => void;
}

function scrambleIn(text: string, duration = 900) {
  return scrambleText({
    text,
    from: "center",
    duration,
    cursor: CURSOR,
    perturbation: 0.32,
    chars: SCRAMBLE_CHARS,
    ease: "inOut(2)",
  });
}

function scrambleOut() {
  return scrambleText({
    text: "",
    override: false,
    from: "center",
    reversed: true,
    duration: 420,
    cursor: "░▒▓",
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
    tl.add({ duration: STEP_GAP_MS });
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
  }

  tl.add(
    mainEl,
    {
      ...(isFirst && {
        opacity: { from: 0, to: 1, duration: 320 },
        scale: [{ from: 0.9, to: 1, duration: 800, ease: "out(3)" }],
      }),
      innerHTML: scrambleIn(step.main, step.main.length > 22 ? 1150 : 880),
    },
    isFirst ? 0 : "+=80"
  );

  if (step.sub) {
    tl.add(
      subEl,
      {
        opacity: { to: 1, duration: 220 },
        innerHTML: scrambleText({
          text: step.sub,
          from: "left",
          duration: 620,
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

export function LoadingScreen({ desktopRef, onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const overlay = overlayRef.current;
    const flash = flashRef.current;
    const content = contentRef.current;
    const mainEl = mainRef.current;
    const subEl = subRef.current;

    if (!overlay || !flash || !content || !mainEl || !subEl) {
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

    BOOT_SEQUENCE.forEach((step, i) => {
      addBootStep(tl, mainEl, subEl, step, i === 0);
    });

    // Pre-climax pause
    tl.add({ duration: 500 });

    // Scramble out final line before entry
    tl.add(mainEl, { innerHTML: scrambleOut() });
    tl.add(
      subEl,
      {
        innerHTML: scrambleText({
          text: "",
          override: false,
          from: "center",
          reversed: true,
          duration: 280,
          cursor: "░▒",
        }),
      },
      "<<"
    );

    tl.add({ duration: 200 });

    // White flash — sole palette break
    tl.add(flash, {
      opacity: [{ from: 0, to: 1, duration: 90 }, { to: 0, duration: 280 }],
      ease: "linear",
    });

    tl.add({ duration: 80 });

    // Pull-in: desktop zooms from center through the screen
    const desktop = desktopRef.current;
    if (desktop) {
      tl.add(desktop, {
        opacity: { from: 0, to: 1, duration: 1100, ease: "out(3)" },
        scale: [
          { from: 0.68, to: 1.06, duration: 1300, ease: "inOut(4)" },
          { to: 1, duration: 400, ease: "out(2)" },
        ],
        filter: [
          { from: "blur(20px)", to: "blur(4px)", duration: 900, ease: "out(3)" },
          { to: "blur(0px)", duration: 500, ease: "out(2)" },
        ],
      });
    }

    // Overlay warps outward as we're drawn in
    tl.add(
      overlay,
      {
        opacity: { to: 0, duration: 1000, ease: "in(2)" },
        scale: { to: 1.22, duration: 1200, ease: "in(3)" },
        filter: { to: "blur(14px)", duration: 900, ease: "in(2)" },
      },
      "<<+=120"
    );

    tl.add(
      content,
      {
        opacity: { to: 0, duration: 400, ease: "out(2)" },
        scale: { to: 1.35, duration: 700, ease: "in(3)" },
      },
      "<<"
    );

    tl.call(finish);

    const fallback = setTimeout(finish, MAX_BOOT_MS);

    return () => {
      clearTimeout(fallback);
      tl.pause();
      tl.revert();
    };
  }, [desktopRef]);

  return (
    <div
      ref={overlayRef}
      className="loading-screen fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-black select-none"
      aria-live="polite"
      aria-busy="true"
      aria-label="System boot sequence"
    >
      <div className="loading-scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-20 bg-white opacity-0"
        aria-hidden
      />
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center px-6 text-center"
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
