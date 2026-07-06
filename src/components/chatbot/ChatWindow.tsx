"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Trash2 } from "lucide-react";
import { ChatMessage, Message } from "./ChatMessage";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  "What did Brian do at LANL?",
  "Tell me about the HPC cluster project",
  "What are Brian's main technical skills?",
  "Show me projects related to distributed systems",
];

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatbot-messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatbot-messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatbot-messages");
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-24 right-6 z-[9998] flex flex-col rounded-[12px] border border-[var(--window-border)] bg-[var(--window-bg)] shadow-2xl"
        style={{
          width: "min(420px, calc(100vw - 48px))",
          height: "min(600px, calc(100vh - 160px))",
          boxShadow:
            "0 20px 56px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-[var(--window-border)] bg-[var(--title-bar-bg)] px-4 py-3 rounded-t-[12px]">
          <div className="flex items-center gap-2">
            <div className="text-[15px] font-semibold text-[var(--foreground)]">
              Portfolio Assistant
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="rounded-md p-1.5 text-[var(--menu-bar-fg-muted)] transition-colors hover:bg-[var(--menu-bar-hover)] hover:text-[var(--foreground)]"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-[var(--menu-bar-fg-muted)] transition-colors hover:bg-[var(--menu-bar-hover)] hover:text-[var(--foreground)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">👋</div>
                <div className="text-sm font-medium text-[var(--foreground)] mb-1">
                  Ask me about Brian!
                </div>
                <div className="text-xs text-[var(--menu-bar-fg-muted)]">
                  Try one of these questions:
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {SUGGESTED_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full rounded-lg border border-[var(--window-border)] bg-[var(--window-bg)] px-3 py-2 text-left text-xs text-[var(--foreground)] transition-all hover:border-[#007aff] hover:shadow-md"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-[var(--menu-bar-fg-muted)] text-xs">
              <Loader2 size={14} className="animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[var(--window-border)] p-3"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Brian's work..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-[var(--window-border)] bg-[var(--window-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--menu-bar-fg-muted)] focus:border-[#007aff] focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-[#007aff] p-2 text-white transition-all hover:bg-[#0051d5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
