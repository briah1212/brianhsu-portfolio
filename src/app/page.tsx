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
    // Listen for desktop loaded event from Desktop component
    const handleDesktopLoaded = () => {
      setDesktopLoaded(true);
    };

    window.addEventListener('desktopLoaded', handleDesktopLoaded);
    
    return () => {
      window.removeEventListener('desktopLoaded', handleDesktopLoaded);
    };
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

      {/* AI Chatbot - Shows after loading screen completes */}
      {showChatbot && desktopLoaded && <ChatButton />}
    </>
  );
}
