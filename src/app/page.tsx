"use client";

import { useState, useEffect } from "react";
import { Desktop } from "@/components/desktop/Desktop";
import { MobileView } from "@/components/mobile/MobileView";
import { ChatButton } from "@/components/chatbot/ChatButton";

export default function Home() {
  const [desktopLoaded, setDesktopLoaded] = useState(false);
  
  // Only show chatbot in production where API keys are configured
  const showChatbot = process.env.NODE_ENV === 'production';

  useEffect(() => {
    // Wait for loading screen + desktop reveal + windows to open
    // Loading screen: ~2.8s + desktop reveal: ~0.5s + windows open: ~0.3s = ~3.6s
    const timer = setTimeout(() => {
      setDesktopLoaded(true);
    }, 4000); // 4 seconds to be safe
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Desktop: fictional artifact OS (hidden on small screens) */}
      <div className="hidden md:block h-screen w-screen overflow-hidden">
        <Desktop />
      </div>

      {/* Mobile: guided proof feed (hidden on md+ screens) */}
      <div className="md:hidden">
        <MobileView />
      </div>

      {/* AI Chatbot - Behind windows (z-50) but clickable when visible */}
      {showChatbot && desktopLoaded && <ChatButton />}
    </>
  );
}
