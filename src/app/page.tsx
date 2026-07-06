import { Desktop } from "@/components/desktop/Desktop";
import { MobileView } from "@/components/mobile/MobileView";
import { ChatButton } from "@/components/chatbot/ChatButton";

export default function Home() {
  // Only show chatbot in production (Vercel) where API keys are configured
  const showChatbot = process.env.NODE_ENV === 'production';

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

      {/* AI Chatbot - Only in production where env vars are set */}
      {showChatbot && <ChatButton />}
    </>
  );
}
