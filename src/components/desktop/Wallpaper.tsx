"use client";

import { useWindowStore } from "@/store/windowStore";
import { DESKTOP_ASSETS } from "@/config/assets";

export function Wallpaper() {
  const theme = useWindowStore((s) => s.theme);

  return (
    <div
      className="absolute inset-0 transition-colors duration-500"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(145deg, #0f0c29 0%, #1a1a2e 35%, #16213e 70%, #0f3460 100%)"
            : "linear-gradient(145deg, #e8f4fc 0%, #d4e8f7 30%, #c9dff5 60%, #b8d4f0 100%)",
      }}
    >
      {/* Subtle mesh overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(90, 200, 250, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(175, 82, 222, 0.15) 0%, transparent 40%)
          `,
        }}
      />
      {theme === "dark" && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
      )}
      <div className="wallpaper-scene" aria-hidden>
        <img
          src={DESKTOP_ASSETS.homeScene}
          alt=""
          className="wallpaper-scene-img"
          draggable={false}
        />
      </div>
    </div>
  );
}
