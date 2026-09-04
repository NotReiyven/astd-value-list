import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("astd_cookie_consent");
    if (consent === "granted") {
      // If they already accepted previously, update GA immediately
      window.gtag?.('consent', 'update', { 'analytics_storage': 'granted' });
    } else if (!consent) {
      // If no preference is set, show the banner
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("astd_cookie_consent", "granted");
    window.gtag?.('consent', 'update', { 'analytics_storage': 'granted' });
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("astd_cookie_consent", "denied");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100000] p-4 md:p-6 pointer-events-none flex justify-center animate-slide-up">
      <div className="bg-[#1E1F22] border border-[rgba(255,255,255,0.08)] p-4 md:p-5 rounded-[12px] shadow-[0_20px_40px_rgba(0,0,0,0.6)] pointer-events-auto w-full max-w-4xl flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
        
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[rgba(88,101,242,0.15)] flex items-center justify-center flex-shrink-0 border border-[rgba(88,101,242,0.3)]">
            <Cookie className="w-5 h-5 text-[#5865F2]" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-[#F2F3F5] text-[15px] font-bold tracking-tight">We value your privacy</h3>
            <p className="text-[#949BA4] text-[12px] leading-relaxed">
              We use strictly necessary cookies to make our site work. We'd also like to set optional analytics cookies to help us improve it. We won't set optional cookies unless you enable them. For more detailed information, see our <button onClick={() => window.document.dispatchEvent(new CustomEvent('navigate', { detail: 'privacy-policy' }))} className="text-[#5865F2] hover:underline cursor-pointer">Privacy Policy</button>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-[6px] text-[13px] font-bold text-[#DBDEE1] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-[6px] text-[13px] font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] transition-colors shadow-md"
          >
            Accept All
          </button>
          <button onClick={handleDecline} className="hidden md:flex text-[#80848E] hover:text-[#DBDEE1] p-1 ml-1 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}