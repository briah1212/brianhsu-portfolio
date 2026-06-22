import { Desktop } from "@/components/desktop/Desktop";
import { MobileView } from "@/components/mobile/MobileView";

export default function Home() {
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
    </>
  );
}
