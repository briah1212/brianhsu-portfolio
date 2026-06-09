"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Wifi } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

function formatTime(date: Date) {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function MenuBar() {
  const [time, setTime] = useState("");
  const theme = useWindowStore((s) => s.theme);
  const toggleTheme = useWindowStore((s) => s.toggleTheme);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const windows = useWindowStore((s) => s.windows);
  const activeWindow = windows.find((w) => w.id === activeWindowId);

  useEffect(() => {
    setTime(formatTime(new Date()));
    const interval = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="menu-bar fixed top-0 left-0 right-0 z-[9999] flex h-7 items-center justify-between px-4 text-xs font-medium select-none">
      <div className="flex items-center gap-4">
        <span className="menu-bar-label font-semibold tracking-tight">
          Brian Hsu
        </span>
        <nav className="menu-bar-nav hidden items-center gap-3 sm:flex">
          {["File", "Edit", "View", "Window", "Help"].map((item) => (
            <span key={item} className="menu-bar-item cursor-default">
              {item}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {activeWindow && (
          <span className="menu-bar-subtle hidden max-w-[200px] truncate md:inline">
            {activeWindow.title}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="menu-bar-icon-btn rounded p-0.5 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <Wifi size={13} className="menu-bar-muted" />
        <time className="menu-bar-label tabular-nums" suppressHydrationWarning>
          {time}
        </time>
      </div>
    </header>
  );
}
