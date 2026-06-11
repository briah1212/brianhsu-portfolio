"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Moon, Sun, Wifi } from "lucide-react";
import { getAppConfig } from "@/config/apps";
import { useWindowStore } from "@/store/windowStore";
import { MenuDropdown, MenuDivider, MenuItem } from "./MenuDropdown";
import { ShortcutsModal } from "./ShortcutsModal";
import { AboutModal } from "./AboutModal";
import { StatusBarControl } from "./StatusBarControl";
import { SunArc } from "./SunArc";
import {
  formatClockTime,
  formatFullDate,
  formatStatusBarTime,
  getLocalTimeZone,
  getLocalTimeZoneLabel,
} from "./clockUtils";

type MenuId = "file" | "edit" | "view" | "window" | "help";
type StatusPanel = "wifi" | "clock" | null;

const MENUS: { id: MenuId; label: string }[] = [
  { id: "file", label: "File" },
  { id: "edit", label: "Edit" },
  { id: "view", label: "View" },
  { id: "window", label: "Window" },
  { id: "help", label: "Help" },
];

const WIFI_NETWORKS = [
  "Brian's 5G",
  "High Speed Infiniband",
  "UMich Secure",
  "Guest Network",
] as const;

export function MenuBar() {
  const [now, setNow] = useState(() => new Date());
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null);
  const [statusPanel, setStatusPanel] = useState<StatusPanel>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>(WIFI_NETWORKS[0]);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const theme = useWindowStore((s) => s.theme);
  const toggleTheme = useWindowStore((s) => s.toggleTheme);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const windows = useWindowStore((s) => s.windows);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const closeAllWindows = useWindowStore((s) => s.closeAllWindows);
  const openAllApps = useWindowStore((s) => s.openAllApps);
  const bringAllToFront = useWindowStore((s) => s.bringAllToFront);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);

  const openWindows = windows.filter((w) => !w.isMinimized);
  const hasWindows = windows.length > 0;
  const statusBarTime = formatStatusBarTime(now);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const closeMenu = useCallback(() => setActiveMenu(null), []);
  const closeStatusPanel = useCallback(() => setStatusPanel(null), []);
  const closeAllPanels = useCallback(() => {
    setActiveMenu(null);
    setStatusPanel(null);
  }, []);

  const openAbout = useCallback(() => {
    closeAllPanels();
    setAboutOpen(true);
  }, [closeAllPanels]);

  const runAndClose = useCallback(
    (action: () => void) => {
      action();
      closeMenu();
    },
    [closeMenu]
  );

  const handleMenuToggle = (id: MenuId) => {
    setStatusPanel(null);
    setActiveMenu((current) => (current === id ? null : id));
  };

  const handleStatusToggle = (panel: Exclude<StatusPanel, null>) => {
    setActiveMenu(null);
    setStatusPanel((current) => (current === panel ? null : panel));
  };

  const handleThemeToggle = () => {
    closeAllPanels();
    toggleTheme();
  };

  const handleFocusWindow = (id: string, isMinimized: boolean) => {
    if (isMinimized) restoreWindow(id);
    else focusWindow(id);
    closeMenu();
  };

  const renderMenuContent = (id: MenuId): ReactNode => {
    switch (id) {
      case "file":
        return (
          <>
            <MenuItem
              label="Close Window"
              shortcut="⌘W"
              disabled={!activeWindowId}
              onClick={() =>
                runAndClose(() => {
                  if (activeWindowId) closeWindow(activeWindowId);
                })
              }
            />
            <MenuDivider />
            <MenuItem
              label="Close All"
              disabled={!hasWindows}
              onClick={() => runAndClose(closeAllWindows)}
            />
          </>
        );

      case "edit":
        return (
          <>
            <MenuItem label="Undo" shortcut="⌘Z" disabled />
            <MenuItem label="Redo" shortcut="⇧⌘Z" disabled />
            <MenuDivider />
            <MenuItem label="Cut" shortcut="⌘X" disabled />
            <MenuItem label="Copy" shortcut="⌘C" disabled />
            <MenuItem label="Paste" shortcut="⌘V" disabled />
            <MenuItem label="Select All" shortcut="⌘A" disabled />
          </>
        );

      case "view":
        return (
          <MenuItem
            label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            onClick={() => runAndClose(toggleTheme)}
          />
        );

      case "window": {
        const sorted = [...windows].sort((a, b) => a.zIndex - b.zIndex);
        return (
          <>
            {sorted.length > 0 ? (
              sorted.map((win) => {
                const title = getAppConfig(win.appId)?.title ?? win.title;
                return (
                  <MenuItem
                    key={win.id}
                    label={win.isMinimized ? `${title} (Minimized)` : title}
                    active={win.id === activeWindowId}
                    onClick={() => handleFocusWindow(win.id, win.isMinimized)}
                  />
                );
              })
            ) : (
              <MenuItem label="No Open Windows" disabled />
            )}
            <MenuDivider />
            <MenuItem label="Open All" onClick={() => runAndClose(openAllApps)} />
            <MenuItem
              label="Close All"
              disabled={!hasWindows}
              onClick={() => runAndClose(closeAllWindows)}
            />
            <MenuItem
              label="Bring All to Front"
              disabled={openWindows.length === 0}
              onClick={() => runAndClose(bringAllToFront)}
            />
          </>
        );
      }

      case "help":
        return (
          <>
            <MenuItem
              label="Keyboard Shortcuts"
              onClick={() => {
                closeMenu();
                setShortcutsOpen(true);
              }}
            />
            <MenuDivider />
            <MenuItem label="About This Site" onClick={openAbout} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <header className="menu-bar fixed top-0 left-0 right-0 z-[9999] flex h-7 items-center justify-between px-4 text-xs font-medium select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="menu-bar-label font-semibold tracking-tight menu-bar-app-name"
            onClick={openAbout}
            aria-label="About Brian Hsu"
          >
            Brian Hsu
          </button>
          <nav className="menu-bar-nav hidden items-center sm:flex">
            {MENUS.map(({ id, label }) => (
              <MenuBarEntry
                key={id}
                label={label}
                open={activeMenu === id}
                onToggle={() => handleMenuToggle(id)}
                onClose={closeMenu}
              >
                {renderMenuContent(id)}
              </MenuBarEntry>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="menu-bar-status-btn hidden sm:inline-flex"
            onClick={openAbout}
            aria-label="About This Site"
          >
            About
          </button>

          <button
            type="button"
            onClick={handleThemeToggle}
            className="menu-bar-status-btn menu-bar-status-icon"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          <StatusBarControl
            open={statusPanel === "wifi"}
            onToggle={() => handleStatusToggle("wifi")}
            onClose={closeStatusPanel}
            ariaLabel="Wi-Fi networks"
            className="menu-bar-status-icon"
            dropdownClassName="menu-dropdown-wifi"
            dropdownChildren={
              <>
                <div className="menu-dropdown-header">Wi-Fi</div>
                {WIFI_NETWORKS.map((network) => (
                  <MenuItem
                    key={network}
                    label={network}
                    selected={selectedNetwork === network}
                    onClick={() => {
                      setSelectedNetwork(network);
                      closeStatusPanel();
                    }}
                  />
                ))}
              </>
            }
          >
            <Wifi size={13} />
          </StatusBarControl>

          <StatusBarControl
            open={statusPanel === "clock"}
            onToggle={() => handleStatusToggle("clock")}
            onClose={closeStatusPanel}
            ariaLabel="Date and time"
            className="menu-bar-status-clock tabular-nums"
            dropdownClassName="menu-dropdown-clock"
            dropdownChildren={
              <div className="clock-panel">
                <SunArc
                  hour={now.getHours()}
                  minute={now.getMinutes()}
                />
                <p className="clock-panel-date">{formatFullDate(now)}</p>
                <p className="clock-panel-time">{formatClockTime(now)}</p>
                <p className="clock-panel-timezone">
                  {getLocalTimeZoneLabel(now)} · {getLocalTimeZone()}
                </p>
              </div>
            }
          >
            <time suppressHydrationWarning>{statusBarTime}</time>
          </StatusBarControl>
        </div>
      </header>

      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

interface MenuBarEntryProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
}

function MenuBarEntry({
  label,
  open,
  onToggle,
  onClose,
  children,
}: MenuBarEntryProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        type="button"
        className={`menu-bar-item ${open ? "menu-bar-item-active" : ""}`}
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
      </button>
      <MenuDropdown open={open} onClose={onClose} anchorRef={anchorRef}>
        {children}
      </MenuDropdown>
    </div>
  );
}
