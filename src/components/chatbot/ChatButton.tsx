"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log("ChatButton clicked! Current state:", isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-[#007aff] text-white shadow-xl transition-all hover:bg-[#0051d5] hover:shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        style={{
          boxShadow:
            "0 8px 24px rgba(0, 122, 255, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15)",
          pointerEvents: "auto",
          cursor: "pointer",
        }}
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
        
        {/* Notification badge (optional - can be used to show unread count) */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white"
          />
        )}
      </motion.button>

      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
