import { useState, useEffect, useRef } from "react";
import { Sparkles, Star, ChevronRight, Zap } from "lucide-react";

export type GuideType = "main" | "channels" | "advanced" | "developer" | "filters" | "dictionary" | "stats" | "management" | "annoyed" | null;

export const AQUA_DIALOGUES: Record<string, string[]> = {
  main: [
    "",
    "Listen up, you shut-in NEET! I, the beautiful and wise Goddess Aqua, have descended to save you from getting !!completely scammed!!! You'd be helpless without me. First, click the ^^Value List^^ channel in the sidebar so we can begin!",
    "Hmph, even someone with your pitiful intelligence stat can do this part. Let's build a mock trade. If you're on a PC, ^^Left-click^^ a unit for your *Give* side, or ^^Right-click^^ for your *Get* side! On mobile? Just ^^tap^^ or ^^swipe^^ the card! !!Don't mess this up!!!",
    "!!W-Wait! Don't just accept a trade blindly!!! Are you trying to lose all your value?! Use the divine tool I've graciously bestowed upon you! Click that glowing ^^Calculator^^ button right now to open the Analyzer!",
    "See?! It instantly breaks down the value differences and market momentum for you! I just saved you from financial ruin, so you should be on your knees thanking me! Now get out there and trade, and don't forget to ^^praise your Goddess!^^"
  ],
  channels: [
    "",
    "Lost, are we? Typical. Pay attention to the sidebar on the left! ^^Home^^ has patch notes, and ^^Extra Notices^^ has crucial market rules you probably ignored! !!Don't just stare at the Value List all day!!!"
  ],
  advanced: [
    "",
    "Too lazy to type? Click the ^^Wand^^ in the calculator to paste whole paragraphs and let my divine magic sort the units! Also, keep an eye on the ^^Trade Notices^^ below the calculator—they'll tell you if a unit is !!Inflated!! or dropping!"
  ],
  developer: [
    "",
    "Oh, you want to know who built this shrine to my greatness? It was my loyal head developer, ^^Reiyven!^^ He spent way too much time coding this instead of going outside. Be sure to appreciate his hard work!"
  ],
  filters: [
    "",
    "Don't just blindly trade! Open the ^^Status Dropdown^^ and filter out the trash! Holding onto !!Dropping!! or !!Inflated!! units is a one-way ticket to being as broke as I am!"
  ],
  dictionary: [
    "",
    "I'm a Goddess, not a mind reader! Click the ^^Wand^^ icon in the Calculator to open the Smart Parser. Teach me your weird abbreviations so I can actually understand your messy trades!"
  ],
  stats: [
    "",
    "Stop staring at the raw value like an idiot! Open the ^^R / S / D Stats^^ tab in the Tutorial. High value means nothing if the unit has terrible Demand. !!Nobody wants your overpriced garbage!!!"
  ],
  management: [
    "",
    "Listen closely! When testing offers, click the ^^Pin^^ icon on your 'Give' units. That way, when you clear the board, your core inventory stays put! Even you can't mess that up... probably."
  ],
  annoyed: [
    "",
    "!!Stop poking me!!! Figure it out yourself or go bother ^^Reiyven^^ with a support ticket! I have Goddess things to do!"
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
  const [boxShake, setBoxShake] = useState(false);
  const fullTextRef = useRef("");

  useEffect(() => {
    if (!guideState.type || guideState.step === 0) return;
    
    if ((guideState.type === "main" && guideState.step === 3) || guideState.type === "annoyed") {
      setBoxShake(true);
      setTimeout(() => setBoxShake(false), 500);
    }

    const fullText = AQUA_DIALOGUES[guideState.type]?.[guideState.step] || "";
    fullTextRef.current = fullText;
    setDisplayedText("");
    setIsTyping(true);
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 22);
    
    return () => clearInterval(interval);
  }, [guideState]);

  const handleSkipOrFastForward = () => {
    if (isTyping) {
      setDisplayedText(fullTextRef.current);
      setIsTyping(false);
    }
  };

  const renderDialogue = (text: string) => {
    const parts = text.split(/(!!.*?!!|\^\^.*?\^\^|\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('!!') && part.endsWith('!!')) {
        return <strong key={idx} className="text-[#ed4245] font-black tracking-wide animate-text-shake drop-shadow-[0_0_10px_rgba(237,66,69,0.7)]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('^^') && part.endsWith('^^')) {
        return <strong key={idx} className="text-[#00A8FC] font-black tracking-wide drop-shadow-[0_0_10px_rgba(0,168,252,0.9)] animate-text-float">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] tracking-wide">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="text-[#5865F2] font-bold not-italic">{part.slice(1, -1)}</em>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  if (!guideState.type) return null;

  const isMainStep4 = guideState.type === "main" && guideState.step === 4;

  let actionPrompt = "";
  if (!isTyping && guideState.type === "main") {
    if (guideState.step === 1) actionPrompt = "Click 'Value List' in the sidebar";
    if (guideState.step === 2) actionPrompt = "Add any unit to your trade";
    if (guideState.step === 3) actionPrompt = "Click the Calculator button";
  }

  const auraColor = boxShake ? "rgba(237, 66, 69, 0.3)" : "rgba(0, 168, 252, 0.25)";
  const borderColor = boxShake ? "#ed4245" : "#00A8FC";

  return (
    <>
      <style>{`
        @keyframes textShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px) translateY(-1px); }
          50% { transform: translateX(2px) translateY(1px); }
          75% { transform: translateX(-2px) translateY(1px); }
        }
        .animate-text-shake { display: inline-block; animation: textShake 0.15s infinite; }
        
        @keyframes textFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-text-float { display: inline-block; animation: textFloat 2s ease-in-out infinite; }
        
        @keyframes aquaFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1.5deg); }
        }
        .animate-aqua-float { animation: aquaFloat 4s ease-in-out infinite; }

        @keyframes boxShake {
          0%, 100% { transform: translateX(0) rotate(0); }
          20% { transform: translateX(-7px) rotate(-1.5deg); }
          40% { transform: translateX(7px) rotate(1.5deg); }
          60% { transform: translateX(-7px) rotate(-1.5deg); }
          80% { transform: translateX(7px) rotate(1.5deg); }
        }
        .animate-box-shake { animation: boxShake 0.4s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
      `}</style>

      {/* Cinematic Backdrop */}
      <div 
        className={`fixed inset-0 z-[99998] transition-opacity duration-500 backdrop-blur-[4px] ${actionPrompt && !isTyping ? 'pointer-events-none bg-black/50' : 'pointer-events-auto bg-[#030213]/85'}`} 
        onClick={handleSkipOrFastForward} 
      />
      
      <div className="fixed inset-0 z-[100005] pointer-events-none flex items-end justify-center pb-8 md:pb-16 px-4">
        <div className={`relative w-full max-w-[880px] flex items-end drop-shadow-2xl animate-slide-up ${actionPrompt && !isTyping ? 'pointer-events-none' : 'pointer-events-auto'}`} onClick={handleSkipOrFastForward}>
           
           {/* DIVINE GODDESS AURA & SPRITE */}
           <div className="hidden md:block w-[210px] shrink-0 relative z-20 pointer-events-none animate-aqua-float">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-[60px] transition-colors duration-500 animate-pulse-glow" style={{ backgroundColor: boxShake ? '#ed4245' : '#00A8FC' }} />
              <img 
                 src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" 
                 className="absolute bottom-[-20px] right-[-30px] w-[310px] max-w-none drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] object-contain"
                 alt="Aqua"
              />
           </div>

           {/* JRPG VISUAL NOVEL DIALOGUE BOX */}
           <div 
             className={`bg-[#1E1F22]/95 backdrop-blur-2xl border-[2px] p-6 md:p-8 rounded-[16px] flex-1 relative z-10 min-h-[170px] flex flex-col transition-all duration-300 pointer-events-auto shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${boxShake ? 'animate-box-shake' : ''}`}
             style={{ borderColor: borderColor, boxShadow: `0 12px 50px ${auraColor}, inset 0 0 25px ${auraColor}` }}
           >
             
             {/* FLOATING JRPG NAMEPLATE (OVERLAPS TOP BORDER) */}
             <div className="absolute -top-4 left-6 bg-[#111214] border-2 px-4 py-1 rounded-[8px] shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center gap-2.5 z-20" style={{ borderColor: borderColor }}>
               <span className={`font-black text-[15px] md:text-[17px] uppercase tracking-wider drop-shadow-md transition-colors ${boxShake ? 'text-[#ed4245]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#00A8FC] to-[#5865F2]'}`}>
                 Goddess Aqua
               </span>
               <span className="w-max px-1.5 py-0.5 bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40 text-[8px] uppercase font-extrabold tracking-widest rounded-[3px] flex items-center gap-0.5">
                 <Sparkles className="w-2 h-2" /> GODDESS
               </span>
             </div>

             {/* QUEST OBJECTIVE BANNER (ACTION GATE) */}
             {actionPrompt && !isTyping && (
               <div className="absolute -top-5 right-6 md:right-8 bg-gradient-to-r from-[#FAA61A] to-[#F59E0B] text-white px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest animate-pulse shadow-[0_4px_20px_rgba(250,166,26,0.6)] flex items-center gap-1.5 border border-[#FDE68A]/50 z-20">
                 <Star className="w-3.5 h-3.5 fill-current" />
                 {actionPrompt}
               </div>
             )}

             {/* MOBILE AVATAR FALLBACK */}
             <div className="flex items-center gap-3 mb-2 md:hidden pt-2">
               <img 
                 src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" 
                 className="w-10 h-10 rounded-full border-2 border-[#00A8FC] object-cover bg-[#111214] shadow-md"
                 alt="Aqua"
               />
               <span className="text-xs font-bold text-[#00A8FC] uppercase tracking-widest">Goddess Aqua</span>
             </div>

             {/* DIALOGUE TEXT */}
             <p className="text-[#F2F3F5] text-[15px] md:text-[17px] leading-[1.75] font-medium min-h-[75px] pt-3 drop-shadow-sm select-none">
               {renderDialogue(displayedText)}
               {isTyping && <span className="inline-block w-2 h-4 bg-[#00A8FC] animate-pulse ml-1 align-middle" />}
             </p>
             
             {/* FOOTER ACTIONS */}
             <div className="mt-6 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
               
               <div className="flex-1 flex items-center gap-3">
                 {!actionPrompt && !isTyping && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); onEndGuide(); }} 
                     className="group flex items-center gap-2 bg-gradient-to-r from-[#5865F2] to-[#00A8FC] hover:from-[#4752C4] hover:to-[#008ecf] text-white font-bold py-2.5 px-6 rounded-[8px] transition-all duration-300 active:scale-95 shadow-[0_4px_20px_rgba(0,168,252,0.4)] hover:shadow-[0_6px_25px_rgba(0,168,252,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white animate-fade-in"
                   >
                     <span>{isMainStep4 ? "Praise Aqua! (Finish)" : "Got it!"}</span>
                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                 )}
                 
                 {isTyping && (
                   <span className="text-[11px] font-mono text-[#80848E] animate-pulse flex items-center gap-1">
                     <Zap className="w-3 h-3 text-[#00A8FC]" /> Click text to skip animation...
                   </span>
                 )}
               </div>

               {!actionPrompt && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); onEndGuide(); }} 
                   className="text-[#949BA4] hover:text-[#F2F3F5] text-[11px] md:text-[12px] font-bold uppercase tracking-widest transition-colors z-30 px-3 py-2 rounded-[6px] hover:bg-[rgba(255,255,255,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2]"
                 >
                   Skip
                 </button>
               )}
             </div>
             
           </div>
        </div>
      </div>
    </>
  );
}