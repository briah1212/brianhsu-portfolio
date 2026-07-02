"use client";

import { motion } from "framer-motion";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[80%] rounded-[12px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? "bg-[#007aff] text-white"
            : "bg-[var(--window-border)] text-[var(--foreground)]"
        }`}
        style={{
          boxShadow: isUser
            ? "0 2px 8px rgba(0, 122, 255, 0.2)"
            : "0 1px 4px rgba(0, 0, 0, 0.08)",
        }}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
