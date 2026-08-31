import { useState, useEffect } from "react";

export function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only open manually via global event from the Tutorial tab
    const handleOpen = () => {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    };

    window.addEventListener("open-welcome-modal", handleOpen);
    return () => window.removeEventListener("open-welcome-modal", handleOpen);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("astd_welcome_acknowledged", "true");
    setIsVisible(false);
    document.body.style.overflow = "auto";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 animate-fade-in">
      <div className="bg-[#313338] w-full max-w-[500px] rounded-[8px] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-[rgba(255,255,255,0.05)]">
        
        <div className="pt-6 px-6 pb-5 bg-[#2B2D31] border-b border-[rgba(255,255,255,0.04)]">
          <h2 className="text-[18px] font-bold text-[#F2F3F5] tracking-tight">
            ASTD Value List Overview
          </h2>
          <p className="text-[13px] text-[#B5BAC1] mt-1.5 leading-relaxed">
            A quick guide on how to navigate the platform, interpret unit values, and use the built-in trading tools.
          </p>
        </div>

        <div className="flex flex-col gap-3 px-6 py-5 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          <div className="bg-[#2B2D31] p-4 rounded-[6px] border border-[rgba(255,255,255,0.03)]">
            <span className="block text-[14px] font-semibold text-[#DBDEE1] mb-1.5">1. Navigation</span>
            <span className="block text-[13px] text-[#949BA4] leading-relaxed">
              Use the left sidebar to switch between the <strong className="text-[#F2F3F5] font-medium">Main Value List</strong>, <strong className="text-[#F2F3F5] font-medium">Patch Notes</strong>, and <strong className="text-[#F2F3F5] font-medium">Extra Notices</strong>. On mobile devices, swipe right to open the channel menu.
            </span>
          </div>

          <div className="bg-[#2B2D31] p-4 rounded-[6px] border border-[rgba(255,255,255,0.03)]">
            <span className="block text-[14px] font-semibold text-[#DBDEE1] mb-1.5">2. Values & Market Tags</span>
            <span className="block text-[13px] text-[#949BA4] leading-relaxed">
              Unit values are estimations based on active community trades. Always check a unit's status tag (e.g., <strong className="text-[#F2F3F5] font-medium">Rising</strong>, <strong className="text-[#F2F3F5] font-medium">Dropping</strong>, or <strong className="text-[#F2F3F5] font-medium">Unstable</strong>) to understand its current market trajectory before evaluating a trade.
            </span>
          </div>

          <div className="bg-[#2B2D31] p-4 rounded-[6px] border border-[rgba(255,255,255,0.03)]">
            <span className="block text-[14px] font-semibold text-[#DBDEE1] mb-1.5">3. Using the Calculator</span>
            <span className="block text-[13px] text-[#949BA4] leading-relaxed">
              Open the Trade Analyzer panel to compare offers. <strong className="text-[#F2F3F5] font-medium">Left-Click</strong> any unit on the list to add it to your "Give" section, or <strong className="text-[#F2F3F5] font-medium">Right-Click</strong> to add it to your "Get" section. You can also drag and drop units directly into the panel.
            </span>
          </div>

        </div>

        <div className="p-4 bg-[#2B2D31] border-t border-[rgba(255,255,255,0.04)] flex justify-end">
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-[4px] text-[13px] font-medium transition-all active:scale-[0.98]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}