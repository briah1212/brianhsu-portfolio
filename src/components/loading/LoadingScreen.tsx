"use client";

import { useEffect, useRef } from "react";
import { createTimeline, scrambleText } from "animejs";
import type { Timeline } from "animejs";

const CURSOR = "░▒▓█";
const SCRAMBLE_CHARS = "01░▒▓█#@";
const MAX_BOOT_MS = 18000;

const BOOT_SEQUENCE = [
  { main: "Loading", sub: "", hold: 500 },
  { main: "Initializing desktop environment", sub: "kernel: bh-desktop v1.0", hold: 450 },
  { main: "Loading window system", sub: "compositor: active", hold: 400 },
  { main: "Mounting user interface", sub: "dock: ready", hold: 400 },
  { main: "Syncing projects", sub: "data: 4 entries loaded", hold: 400 },
  { main: "Establishing cognitive layer", sub: "cogsci: online", hold: 400 },
  { main: "Jumping into Brian Hsu's site", sub: "access granted", hold: 1400 },
] as const;

interface LoadingScreenProps {
  onComplete: () => void;
}

function scrambleIn(text: string, duration = 700) {
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

function scrambleOut(duration = 320) {
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
          duration: 220,
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
        opacity: { from: 0, to: 1, duration: 200 },
        scale: [{ from: 0.92, to: 1, duration: 600, ease: "out(3)" }],
      }),
      innerHTML: scrambleIn(step.main, step.main.length > 22 ? 950 : 650),
    },
    isFirst ? 0 : "+=60"
  );

  if (step.sub) {
    tl.add(
      subEl,
      {
        opacity: { to: 1, duration: 150 },
        innerHTML: scrambleText({
          text: step.sub,
          from: "left",
          duration: 480,
          cursor: "░▒▓",
          perturbation: 0.2,
          ease: "inOut(2)",
        }),
      },
      "<<+=180"
    );
  }

  tl.add({ duration: step.hold });
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const overlay = overlayRef.current;
    const mainEl = mainRef.current;
    const subEl = subRef.current;

    if (!overlay || !mainEl || !subEl) {
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

    tl.add(overlay, {
      opacity: { to: 0, duration: 800, ease: "inOut(3)" },
      filter: { to: "blur(8px)", duration: 800, ease: "inOut(2)" },
    });

    tl.add(
      mainEl,
      {
        opacity: { to: 0, duration: 500, ease: "out(2)" },
        scale: { to: 1.04, duration: 500, ease: "out(2)" },
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
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
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
