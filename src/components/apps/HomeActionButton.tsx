"use client";

import { motion } from "framer-motion";

interface HomeActionButtonProps {
  label: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

export function HomeActionButton({
  label,
  subtitle,
  color,
  onClick,
}: HomeActionButtonProps) {
  const top = shade(color, 36);
  const edge = shade(color, -48);

  return (
    <motion.button
      type="button"
      className="home-action-btn"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ y: 4, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      style={
        {
          "--btn-top": top,
          "--btn-mid": color,
          "--btn-edge": edge,
        } as React.CSSProperties
      }
    >
      <span className="home-action-btn-shine" aria-hidden />
      <span className="home-action-btn-label">{label}</span>
      <span className="home-action-btn-sub">{subtitle}</span>
    </motion.button>
  );
}
