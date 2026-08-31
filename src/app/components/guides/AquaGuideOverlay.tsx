import { useState, useEffect } from "react";

export type GuideType = "main" | "channels" | "advanced" | "developer" | null;

export const AQUA_DIALOGUES: Record<string, string[]> = {
  main: [
    "",
    "Listen up, you shut-in NEET! I, the beautiful and wise Goddess Aqua, have descended to save you from getting completely scammed! You'd be helpless without me. First, click the **Value List** channel in the sidebar so we can begin!",
    "Hmph, even someone with your pitiful intelligence stat can do this part. Let's build a mock trade. If you're on a PC, **Left-click** a unit for your *Give* side, or **Right-click** for your *Get* side! On mobile? Just **tap** or **swipe** the card! Don't mess this up!",
    "W-Wait! Don't just accept a trade blindly! Are you trying to lose all your value?! Use the divine tool I've graciously bestowed upon you! Click that glowing **Calculator** button right now to open the Analyzer!",
    "See?! It instantly breaks down the value differences and market momentum for you! I just saved you from financial ruin, so you should be on your knees thanking me! Now get out there and trade, and don't forget to praise your Goddess!"
  ],
  channels: [
    "",
    "Lost, are we? Typical. Pay attention to the sidebar on the left! **Home** has patch notes, and **Extra Notices** has crucial market rules you probably ignored! Don't just stare at the Value List all day!"
  ],
  advanced: [
    "",
    "Too lazy to type? Click the **Wand** in the calculator to paste whole paragraphs and let my divine magic sort the units! Also, keep an eye on the **Trade Notices** below the calculator—they'll tell you if a unit is Inflated or dropping!"
  ],
  developer: [
    "",
    "Oh, you want to know who built this shrine to my greatness? It was my loyal head developer, Reiyven! He spent way too much time coding this instead of going outside. Be sure to appreciate his hard work!"
  ]
};

export function AquaGuideOverlay({ 
  guideState, 
  onEndGuide 
}: { 
  guideState: { type: GuideType; step: number }; 
  onEndGuide: () => void 
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!guideState.type || guideState.step === 0) return;
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const fullText = AQUA_DIALOGUES[guideState.type]?.[guideState.step] || "";
    const interval = setInterval(() => {
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [guideState]);

  const handleSkipTyping = () => {
    if (isTyping && guideState.type && guideState.step > 0) {
      setDisplayedText(AQUA_DIALOGUES[guideState.type]?.[guideState.step] || "");
      setIsTyping(false);
    }
  };

  const renderDialogue = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] tracking-wide">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="text-[#00A8FC] font-bold not-italic">{part.slice(1, -1)}</em>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (!guideState.type) return null;

  const isMainStep4 = guideState.type === "main" && guideState.step === 4;

  return (
    <>
      <div className="fixed inset-0 z-[99998] bg-black/75 transition-opacity backdrop-blur-sm pointer-events-auto" onClick={handleSkipTyping} />
      <div className="fixed inset-0 z-[100005] pointer-events-none flex items-end justify-center pb-6 md:pb-12 px-4">
        <div className="relative w-full max-w-[800px] flex items-end drop-shadow-2xl animate-slide-up pointer-events-auto" onClick={handleSkipTyping}>
           <div className="hidden md:block w-[180px] shrink-0 relative z-20 pointer-events-none">
              <img 
                 src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" 
                 className="absolute bottom-[-10px] right-[-20px] w-[260px] max-w-none drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] object-contain"
                 alt="Aqua"
              />
           </div>
           <div className="bg-[#111214]/95 backdrop-blur-xl border-2 border-[#5865F2] p-5 md:p-6 rounded-[12px] flex-1 relative z-10 shadow-[0_0_40px_rgba(88,101,242,0.25)] min-h-[140px] flex flex-col cursor-pointer transition-all hover:bg-[#111214]">
             <div className="flex items-center gap-3 mb-3 md:mb-4 border-b border-[rgba(255,255,255,0.06)] pb-3">
               <img 
                 src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" 
                 className="md:hidden w-10 h-10 rounded-full border border-[#5865F2] object-cover bg-[#2B2D31] shadow-md"
                 alt="Aqua"
               />
               <span className="text-[#5865F2] font-black text-[16px] md:text-[18px] uppercase tracking-wider drop-shadow-md">Goddess Aqua</span>
             </div>
             <p className="text-[#B5BAC1] text-[14px] md:text-[16px] leading-relaxed font-medium min-h-[60px]">
               {renderDialogue(displayedText)}
               {isTyping && <span className="animate-pulse text-[#5865F2] font-black">|</span>}
             </p>
             {(!isTyping && (isMainStep4 || guideState.type !== "main")) && (
               <button onClick={(e) => { e.stopPropagation(); onEndGuide(); }} className="mt-5 self-start bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2.5 px-6 rounded-[6px] transition-all active:scale-95 shadow-md border border-[rgba(255,255,255,0.1)]">
                 Praise Aqua! (Finish)
               </button>
             )}
             <button onClick={(e) => { e.stopPropagation(); onEndGuide(); }} className="absolute bottom-3 right-4 text-[#80848E] hover:text-[#DBDEE1] text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors z-30 bg-[#1E1F22] px-2 py-1 rounded border border-[rgba(255,255,255,0.04)]">
               Skip
             </button>
           </div>
        </div>
      </div>
    </>
  );
}