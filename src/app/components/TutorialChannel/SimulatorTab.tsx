// src/app/components/TutorialChannel/SimulatorTab.tsx
import React, { useState, useEffect } from "react";
import { Target, Zap, Timer, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { StaticStatusBadge } from "./TutorialUI";

const SCENARIOS = [
  {
    id: 1,
    title: "The Multi-Trash Offer",
    desc: "A desperate player offers quantity over quality.",
    give: { name: "S-Tier Legend", value: "150,000", status: "stable" },
    get: { name: "8x C-Tier Trash", value: "180,000", status: "dropping" },
    correct: "L" as const,
    hint: "Raw value isn't everything. 8 dropping units will be worth nothing tomorrow.",
    explanation: "Never trade a stable S-tier for a pile of dropping, low-demand units. You will never be able to trade them away."
  },
  {
    id: 2,
    title: "The Shiny Tax",
    desc: "Trading a highly sought-after normal unit for a shiny variant.",
    give: { name: "High-Demand Meta", value: "40,000", status: "stable" },
    get: { name: "Low-Demand Shiny", value: "45,000", status: "varies" },
    correct: "L" as const,
    hint: "Shinies look cool, but check the demand. Who is going to buy it from you?",
    explanation: "Shinies of bad units have terrible demand. You are trading a liquid asset for a complete brick."
  },
  {
    id: 3,
    title: "The Panic Sell",
    desc: "An update just nerfed a hyped unit. The owner is panic selling.",
    give: { name: "Classic Pure", value: "75,000", status: "stable" },
    get: { name: "Nerfed Meta Unit", value: "90,000", status: "dropping" },
    correct: "L" as const,
    hint: "Catching a falling knife is dangerous. Why are they selling so cheap?",
    explanation: "The value hasn't updated yet to reflect the nerf. It's crashing. Hold onto your stable pure."
  },
  {
    id: 4,
    title: "The Long-Term Play",
    desc: "Trading slightly down in raw value for extreme scarcity.",
    give: { name: "Common S-Tier", value: "220,000", status: "unstable" },
    get: { name: "20-Copy Legend", value: "200,000", status: "stable" },
    correct: "W" as const,
    hint: "Supply is practically 0. Raw value might be lower, but it will never drop.",
    explanation: "Extremely low supply units have infinite leverage. You can essentially name your price later."
  }
];

export function SimulatorTab() {
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [simScore, setSimScore] = useState(0);
  const [simCombo, setSimCombo] = useState(0);
  const [simTimeLeft, setSimTimeLeft] = useState(100);
  const [aquaHint, setAquaHint] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [guessResult, setGuessResult] = useState<"none" | "correct" | "incorrect">("none");
  const [selectedGuess, setSelectedGuess] = useState<"W" | "F" | "L" | "TIME_OUT" | null>(null);

  useEffect(() => {
    if (!isSimulatorRunning || guessResult !== "none") return;
    const timer = setInterval(() => {
      setSimTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGuess("TIME_OUT");
          return 0;
        }
        return prev - 1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isSimulatorRunning, guessResult]);

  const startSimulator = () => {
    setIsSimulatorRunning(true);
    setSimScore(0);
    setSimCombo(0);
    setSimTimeLeft(100);
    setCurrentScenario(0);
    setGuessResult("none");
    setSelectedGuess(null);
    setAquaHint(null);
  };

  const handleGuess = (guess: "W" | "F" | "L" | "TIME_OUT") => {
    setSelectedGuess(guess);
    if (guess === SCENARIOS[currentScenario].correct) {
      setGuessResult("correct");
      const timeBonus = Math.floor(1000 * (simTimeLeft / 100));
      const comboBonus = simCombo * 200;
      setSimScore(prev => prev + 500 + timeBonus + comboBonus);
      setSimCombo(prev => prev + 1);
    } else {
      setGuessResult("incorrect");
      setSimCombo(0);
    }
  };

  const nextScenario = () => {
    if (currentScenario >= SCENARIOS.length - 1) {
      setIsSimulatorRunning(false);
    } else {
      setGuessResult("none");
      setSelectedGuess(null);
      setAquaHint(null);
      setSimTimeLeft(100);
      setCurrentScenario(prev => prev + 1);
    }
  };

  return (
    <div className="animate-fade-in pb-4 max-w-4xl mx-auto">
      <style>{`
        @keyframes strikeShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-8px, 8px); }
          40% { transform: translate(8px, -8px); }
          60% { transform: translate(-4px, 4px); }
          80% { transform: translate(4px, -4px); }
        }
        .animate-strike-shake { animation: strikeShake 0.3s ease-in-out; }

        @keyframes stamp {
          0% { opacity: 0; transform: scale(3) rotate(-15deg); }
          50% { opacity: 1; transform: scale(0.9) rotate(-15deg); }
          100% { opacity: 1; transform: scale(1) rotate(-15deg); }
        }
        .animate-stamp { animation: stamp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {!isSimulatorRunning && simScore === 0 ? (
        <div className="bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[14px] shadow-2xl p-8 md:p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-[16px] bg-[#5865F2]/20 border border-[#5865F2]/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(88,101,242,0.3)]">
            <Target className="w-10 h-10 text-[#5865F2]" />
          </div>
          <h2 className="text-[28px] font-black text-[#F2F3F5] uppercase tracking-tight mb-3">Market Simulator</h2>
          <p className="text-[14px] text-[#B5BAC1] max-w-lg leading-relaxed mb-8">
            Test your trading intuition against realistic, high-stakes market scenarios. 
            Evaluate the trades as a <strong className="text-[#23a559]">Win</strong>, <strong className="text-[#F1C40F]">Fair</strong>, or <strong className="text-[#ed4245]">Loss</strong> before the timer runs out. 
            Faster guesses yield higher scores!
          </p>
          <button 
            onClick={startSimulator}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-4 rounded-[8px] text-[16px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-[0_8px_20px_rgba(88,101,242,0.4)] hover:shadow-[0_8px_30px_rgba(88,101,242,0.6)] flex items-center gap-3"
          >
            <Zap className="w-5 h-5" /> Start Training
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-[#1E1F22] border border-[rgba(255,255,255,0.04)] rounded-[10px] p-4 shadow-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#80848E] block">Score</span>
                <span className="text-[20px] font-black font-mono text-[#F2F3F5] leading-none">{simScore.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#80848E] block">Combo</span>
                <span className={`text-[20px] font-black font-mono leading-none ${simCombo > 1 ? 'text-[#FAA61A] drop-shadow-[0_0_8px_rgba(250,166,26,0.5)]' : 'text-[#DBDEE1]'}`}>x{simCombo}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-1/3">
              <Timer className={`w-5 h-5 ${simTimeLeft < 30 ? 'text-[#ed4245] animate-pulse' : 'text-[#949BA4]'}`} />
              <div className="flex-1 h-3 bg-[#111214] rounded-full overflow-hidden border border-[rgba(255,255,255,0.06)] shadow-inner">
                <div 
                  className={`h-full transition-all duration-100 ease-linear rounded-full ${simTimeLeft < 30 ? 'bg-[#ed4245]' : 'bg-[#5865F2]'}`}
                  style={{ width: `${simTimeLeft}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`flex-1 bg-[#111214] p-5 md:p-8 rounded-[12px] border relative overflow-hidden transition-colors duration-300 ${
            guessResult === "correct" ? "border-[#23a559] bg-[rgba(35,165,89,0.05)] shadow-[inset_0_0_80px_rgba(35,165,89,0.15)]" : 
            guessResult === "incorrect" ? "border-[#ed4245] bg-[rgba(237,66,69,0.05)] shadow-[inset_0_0_80px_rgba(237,66,69,0.15)] animate-strike-shake" : 
            "border-[rgba(255,255,255,0.06)]"
          }`}>
            {guessResult === "none" && (
              <button 
                onClick={() => setAquaHint(SCENARIOS[currentScenario].hint)} 
                className="absolute top-4 right-4 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors z-20"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ask Aqua
              </button>
            )}

            <div className="text-center mb-8 relative z-10">
              <span className="text-[11px] font-bold text-[#80848E] uppercase tracking-widest bg-[#1E1F22] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.04)] mb-3 inline-block">Scenario {currentScenario + 1} / {SCENARIOS.length}</span>
              <h3 className="text-[20px] font-black text-[#F2F3F5] uppercase tracking-wide">{SCENARIOS[currentScenario].title}</h3>
              <p className="text-[13px] text-[#949BA4] mt-1.5 max-w-lg mx-auto">{SCENARIOS[currentScenario].desc}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-8 relative z-10">
              <div className="flex-1 bg-[#2B2D31] p-6 rounded-[10px] border border-[rgba(255,255,255,0.04)] relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FAA61A]" />
                <h4 className="text-[#FAA61A] font-extrabold text-[12px] uppercase tracking-widest mb-4">You Give</h4>
                <div className="text-[#F2F3F5] font-black text-[22px] tracking-tight mb-3">{SCENARIOS[currentScenario].give.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[#DBDEE1] font-mono font-bold text-[16px]">{SCENARIOS[currentScenario].give.value}</span>
                  <StaticStatusBadge status={SCENARIOS[currentScenario].give.status} />
                </div>
              </div>

              <div className="flex items-center justify-center -my-3 md:my-0 z-20">
                <div className="w-10 h-10 rounded-full bg-[#1E1F22] border border-[rgba(255,255,255,0.08)] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] rotate-90 md:rotate-0">
                  <ArrowRight className="w-5 h-5 text-[#80848E]" />
                </div>
              </div>

              <div className="flex-1 bg-[#2B2D31] p-6 rounded-[10px] border border-[rgba(255,255,255,0.04)] relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5865F2]" />
                <h4 className="text-[#5865F2] font-extrabold text-[12px] uppercase tracking-widest mb-4">You Get</h4>
                <div className="text-[#F2F3F5] font-black text-[22px] tracking-tight mb-3">{SCENARIOS[currentScenario].get.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[#DBDEE1] font-mono font-bold text-[16px]">{SCENARIOS[currentScenario].get.value}</span>
                  <StaticStatusBadge status={SCENARIOS[currentScenario].get.status} />
                </div>
              </div>
            </div>

            {guessResult === "none" ? (
              <div className="flex flex-col items-center relative z-10 animate-fade-in">
                {aquaHint && (
                  <div className="mb-4 bg-[rgba(88,101,242,0.1)] border border-[rgba(88,101,242,0.3)] text-[#DBDEE1] text-[12.5px] px-4 py-2.5 rounded-[8px] max-w-md text-center italic">
                    "{aquaHint}"
                  </div>
                )}
                <h4 className="text-[14px] font-black text-[#F2F3F5] mb-5 uppercase tracking-wide">Is this trade a Win, Fair, or Loss?</h4>
                <div className="flex gap-4 w-full max-w-md">
                  <button onClick={() => handleGuess("W")} className="flex-1 bg-[#1E1F22] hover:bg-[#23a559]/20 border border-[rgba(255,255,255,0.06)] hover:border-[#23a559] text-[#F2F3F5] py-4 rounded-[8px] font-black text-[20px] transition-all focus-visible:ring-2 focus-visible:ring-[#23a559] hover:-translate-y-1 shadow-md">W</button>
                  <button onClick={() => handleGuess("F")} className="flex-1 bg-[#1E1F22] hover:bg-[#F1C40F]/20 border border-[rgba(255,255,255,0.06)] hover:border-[#F1C40F] text-[#F2F3F5] py-4 rounded-[8px] font-black text-[20px] transition-all focus-visible:ring-2 focus-visible:ring-[#F1C40F] hover:-translate-y-1 shadow-md">F</button>
                  <button onClick={() => handleGuess("L")} className="flex-1 bg-[#1E1F22] hover:bg-[#ed4245]/20 border border-[rgba(255,255,255,0.06)] hover:border-[#ed4245] text-[#F2F3F5] py-4 rounded-[8px] font-black text-[20px] transition-all focus-visible:ring-2 focus-visible:ring-[#ed4245] hover:-translate-y-1 shadow-md">L</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center relative z-20">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-20 pointer-events-none z-0 animate-stamp ${guessResult === "correct" ? "text-[#23a559]/20" : "text-[#ed4245]/20"}`}>
                  <h1 className="text-[120px] font-black uppercase tracking-tighter leading-none">{guessResult === "correct" ? "CORRECT" : selectedGuess === "TIME_OUT" ? "FAILED" : "WRONG"}</h1>
                </div>

                <div className="bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-6 max-w-2xl w-full shadow-2xl relative z-10 animate-slide-up flex flex-col items-center text-center">
                  {guessResult === "correct" ? (
                    <div className="w-14 h-14 rounded-full bg-[#23a559] flex items-center justify-center text-white mb-4 shadow-[0_0_20px_rgba(35,165,89,0.5)]">
                      <Trophy className="w-7 h-7" />
                    </div>
                  ) : (
                    <img src="https://static.wikia.nocookie.net/allstartd/images/c/c7/Water_Goddess.png" className="w-16 h-16 rounded-full border-2 border-[#ed4245] bg-[#111214] object-cover mb-4 shadow-[0_0_20px_rgba(237,66,69,0.5)]" alt="Aqua" />
                  )}

                  <h3 className={`text-[22px] font-black uppercase tracking-tight mb-2 ${guessResult === "correct" ? "text-[#23a559]" : "text-[#ed4245]"}`}>
                    {guessResult === "correct" ? "Perfect Evaluation!" : selectedGuess === "TIME_OUT" ? "Time's Up!" : "Terrible Trade!"}
                  </h3>
                  
                  <p className="text-[14px] text-[#DBDEE1] leading-relaxed mb-6 px-4">
                    {guessResult === "incorrect" && <strong className="text-[#ed4245] block mb-2 text-[12px] uppercase">Goddess Aqua says:</strong>}
                    "{SCENARIOS[currentScenario].explanation}"
                  </p>

                  <button onClick={nextScenario} className={`px-8 py-3 rounded-[8px] font-black text-[14px] uppercase tracking-wider transition-all active:scale-95 text-white shadow-lg ${guessResult === "correct" ? "bg-[#23a559] hover:bg-[#1f914e]" : "bg-[#ed4245] hover:bg-[#c9383b]"}`}>
                    {currentScenario >= SCENARIOS.length - 1 ? "Finish Training" : "Next Scenario"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}