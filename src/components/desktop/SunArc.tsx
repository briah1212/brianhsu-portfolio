"use client";

import { isPastSundown } from "./clockUtils";

interface SunArcProps {
  hour: number;
  minute: number;
}

const CX = 60;
const CY = 52;
const RADIUS = 38;

/** Maps daytime hours (6am → 6pm) to position along the arc. */
function getSunPosition(hour: number, minute: number) {
  const totalMinutes = hour * 60 + minute;
  const dawn = 6 * 60;
  const dusk = 18 * 60;
  const clamped = Math.max(dawn, Math.min(dusk, totalMinutes));
  const t = (clamped - dawn) / (dusk - dawn);
  const angle = Math.PI * (1 - t);
  return {
    x: CX + RADIUS * Math.cos(angle),
    y: CY - RADIUS * Math.sin(angle),
  };
}

/** Maps nighttime hours (6pm → 6am) to position along the arc. */
function getMoonPosition(hour: number, minute: number) {
  const nightMinutes =
    hour >= 18
      ? (hour - 18) * 60 + minute
      : (hour + 6) * 60 + minute;
  const t = nightMinutes / (12 * 60);
  const angle = Math.PI * (1 - t);
  return {
    x: CX + RADIUS * Math.cos(angle),
    y: CY - RADIUS * Math.sin(angle),
  };
}

function MoonGraphic({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={6} fill="#e2e8f0" />
      <circle cx={2.5} cy={-1.5} r={5} fill="var(--clock-sky-bg, #1e1e23)" />
    </g>
  );
}

export function SunArc({ hour, minute }: SunArcProps) {
  const isNight = isPastSundown(hour);

  if (isNight) {
    const moon = getMoonPosition(hour, minute);
    return (
      <svg className="sun-arc sun-arc-night" viewBox="0 0 120 64" aria-hidden>
        <defs>
          <linearGradient id="moon-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M 14 52 A 46 46 0 0 1 106 52"
          fill="none"
          stroke="url(#moon-arc-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="52"
          x2="112"
          y2="52"
          stroke="var(--window-border)"
          strokeWidth="1"
          opacity="0.6"
        />
        {[18, 42, 68, 92].map((sx) => (
          <circle
            key={sx}
            cx={sx}
            cy={20 + (sx % 3) * 4}
            r={0.8}
            fill="#cbd5e1"
            opacity={0.5}
          />
        ))}
        <MoonGraphic x={moon.x} y={moon.y} />
      </svg>
    );
  }

  const sun = getSunPosition(hour, minute);

  return (
    <svg className="sun-arc sun-arc-day" viewBox="0 0 120 64" aria-hidden>
      <defs>
        <linearGradient id="sun-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M 14 52 A 46 46 0 0 1 106 52"
        fill="none"
        stroke="url(#sun-arc-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="8" y1="52" x2="112" y2="52" stroke="var(--window-border)" strokeWidth="1" />
      <circle cx={sun.x} cy={sun.y} r={5} fill="#fbbf24" />
    </svg>
  );
}
