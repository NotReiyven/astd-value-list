// src/app/components/TutorialChannel/SandboxTab.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap, Award, MousePointerClick, Hand, ArrowDownToLine,
  ChevronRight, ChevronLeft, Pin, Hash, Info
} from "lucide-react";
import { PopupUnit } from "../../../types";
import { GuideType } from "../guides/AquaGuideOverlay";
import { useTradeStore } from "../../../store/useTradeStore";
import { MissionCard } from "./TutorialUI";

interface SandboxTabProps {
  godModeActive: boolean;
  godModeClicks: number;
  handleHeaderSecret: () => void;
  setComboPoints: React.Dispatch<React.SetStateAction<number>>;
  onAddGive: (u: PopupUnit) => void;
  onAddGet: (u: PopupUnit) => void;
  onToggleAnalyzer: () => void;
  startGuide: (type: GuideType) => void;
}

export function SandboxTab({
  godModeActive,
  godModeClicks,
  handleHeaderSecret,
  setComboPoints,
  onAddGive,
  onAddGet,
  onToggleAnalyzer,
  startGuide
}: SandboxTabProps) {
  const [viewModeDemo, setViewModeDemo] = useState<"grid" | "list">("grid");
  const [dragOverReceptor, setDragOverReceptor] = useState(false);
  const [droppedSuccessfully, setDroppedSuccessfully] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; tx: number; ty: number; color: string }[]>([]);

  const { giveItems, getItems, pinnedIds, togglePin } = useTradeStore();
  const [hasOpenedAnalyzer, setHasOpenedAnalyzer] = useState(false);
  const [hasTriggeredGraduation, setHasTriggeredGraduation] = useState(false);

  const hasGive = giveItems.length > 0;
  const hasGet = getItems.length > 0;
  const hasPinned = pinnedIds.length > 0;
  const completedCount = (hasGive ? 1 : 0) + (hasGet ? 1 : 0) + (hasOpenedAnalyzer ? 1 : 0) + (hasPinned ? 1 : 0);
  const allTasksDone = completedCount === 4;

  useEffect(() => {
    if (allTasksDone && !hasTriggeredGraduation) {
      setHasTriggeredGraduation(true);
      startGuide("academy_grad");
    }
  }, [allTasksDone, hasTriggeredGraduation, startGuide]);

  // Make opening the analyzer a deliberate action for the tutorial check
  const handleToggleWrap = () => {
    setHasOpenedAnalyzer(true);
    onToggleAnalyzer();
  };

  const demoUnit: PopupUnit = useMemo(() => ({
    id: "tut-demo-unit",
    name: godModeActive ? "🔥 GOD MODE DUMMY 🔥" : "Practice Dummy",
    subtitle: godModeActive ? "Level 999 Trading God" : "Standard Training Unit",
    value: godModeActive ? 999999 : 45000,
    demand: 4.5
  }), [godModeActive]);

  const spawnSparks = (x: number, y: number, color: string) => {
    const newSparks = Array.from({ length: 10 }).map((_, i) => {
      const angle = i * 36 + Math.random() * 20;
      const distance = 25 + Math.random() * 25;
      return {
        id: Date.now() + i,
        x, y,
        tx: Math.cos((angle * Math.PI) / 180) * distance,
        ty: Math.sin((angle * Math.PI) / 180) * distance,
        color
      };
    });
    setSparks(prev => [...prev, ...newSparks]);
    setTimeout(() => {
      setSparks(prev => prev.filter(s => !newSparks.some(ns => ns.id === s.id)));
    }, 600);
  };

  const handleDummyClick = (e: React.MouseEvent, type: "give" | "get") => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = type === "give" ? "#FAA61A" : "#5865F2";

    if (type === "give") onAddGive(demoUnit);
    else onAddGet(demoUnit);

    spawnSparks(x, y, color);
    setComboPoints(p => p + 1);
  };

  const handleDummyPinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin("give", demoUnit.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("unit", JSON.stringify(demoUnit));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleReceptorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverReceptor(false);
    onAddGive(demoUnit);
    setDroppedSuccessfully(true);
    setTimeout(() => setDroppedSuccessfully(false), 2000);

    const rect = e.currentTarget.getBoundingClientRect();
    spawnSparks(rect.width / 2, rect.height / 2, "#23a559");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-8">
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes sparkOut {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .animate-spark {
          animation: sparkOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* QUEST PROTOCOL BOARD */}
      <div className="bg-[#2B2D31] border border-[rgba(255,255,255,0.04)] rounded-[12px] p-5 md:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[rgba(255,255,255,0.04)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shadow-inner">
              <GraduationCap className="w-5 h-5 text-[#5865F2]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#949BA4]">Field Protocol</span>
              <h2 className="text-[17px] font-black text-[#F2F3F5] tracking-tight">Trading Cadet Certification</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#80848E] block mb-1">Progress</span>
              <span className="text-[13px] font-mono font-black text-[#DBDEE1]">{completedCount}/4 Completed</span>
            </div>
            <div className="w-28 h-2 bg-[#1E1F22] rounded-full overflow-hidden border border-[rgba(255,255,255,0.04)] shadow-inner">
              <div
                className="h-full bg-[#5865F2] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Interactive Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MissionCard
            title="Acquisition Directive"
            instruction="Left-click or tap the Practice Dummy below."
            hint="Registers item to [You Give]"
            isDone={hasGive}
            accent="#FAA61A"
          />
          <MissionCard
            title="Counter-Offer Directive"
            instruction="Right-click the Practice Dummy below."
            hint="Registers item to [You Get]"
            isDone={hasGet}
            accent="#5865F2"
          />
          <MissionCard
            title="Telemetry Deployment"
            instruction="Launch the Trade Analyzer using the button."
            hint="Toggles the right valuation drawer"
            isDone={hasOpenedAnalyzer}
            accent="#00A8FC"
            action={
              <button
                onClick={handleToggleWrap}
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[4px] bg-[#4E5058] hover:bg-[#5865F2] text-white transition-all active:scale-95 shadow-sm"
              >
                Launch
              </button>
            }
          />
          <MissionCard
            title="Vault Lockout (Pin)"
            instruction="Pin an active card inside Give or Get."
            hint="Prevents loss during board wipe"
            isDone={hasPinned}
            accent="#a855f7"
          />
        </div>

        {allTasksDone && (
          <div className="mt-4 p-4 rounded-[8px] bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(35,165,89,0.15)] flex items-center justify-center text-[#23a559] border border-[rgba(35,165,89,0.3)]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[13px] font-black text-[#F2F3F5] uppercase tracking-wide block">Evaluation Complete</span>
                <span className="text-[12px] text-[#949BA4]">You have mastered the physical interface of the server.</span>
              </div>
            </div>
            <button
              onClick={() => startGuide("academy_grad")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[4px] bg-[#5865F2] hover:bg-[#4752C4] text-white text-[12px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 shrink-0"
            >
              View Honors
            </button>
          </div>
        )}
      </div>

      {/* INTERACTIVE TRAINING LAB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Combat Dummy Pod (Left Column) */}
        <div className="lg:col-span-6 bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.04)] pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#949BA4]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">Active Subject</span>
            </div>
            <button
              onClick={handleHeaderSecret}
              className="text-[10px] font-mono text-[#80848E] hover:text-[#DBDEE1] transition-colors"
            >
              REF_ID: 994-TUT
            </button>
          </div>

          {/* Interactive Card Body */}
          <div
            draggable
            onDragStart={handleDragStart}
            onClick={(e) => handleDummyClick(e, "give")}
            onContextMenu={(e) => handleDummyClick(e, "get")}
            className="bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] hover:border-[#5865F2] rounded-[8px] p-4 cursor-grab active:cursor-grabbing transition-all duration-300 relative group overflow-hidden shadow-sm"
          >
            {/* Particle emission layer */}
            {sparks.map(s => (
              <span
                key={s.id}
                className="absolute w-2 h-2 rounded-full pointer-events-none animate-spark"
                style={{
                  backgroundColor: s.color,
                  "--tx": `${s.tx}px`,
                  "--ty": `${s.ty}px`,
                  left: s.x,
                  top: s.y,
                  marginLeft: "-4px",
                  marginTop: "-4px"
                } as React.CSSProperties}
              />
            ))}

            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[6px] bg-[#111214] border border-[rgba(255,255,255,0.06)] flex items-center justify-center font-black text-[#5865F2] text-xl shadow-inner">
                  {godModeActive ? "🔥" : "PD"}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#80848E] uppercase tracking-wider block">{demoUnit.subtitle}</span>
                  <h3 className="text-[15px] font-black text-[#F2F3F5] tracking-tight">{demoUnit.name}</h3>
                </div>
              </div>

              <button
                onClick={handleDummyPinToggle}
                title="Test Pin mechanic"
                className={`p-1.5 rounded-[4px] transition-colors ${
                  pinnedIds.includes(`give-${demoUnit.id}`)
                    ? "bg-[#5865F2] text-white"
                    : "text-[#80848E] hover:text-[#DBDEE1] bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                <Pin className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-3 mb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#80848E] block">Simulated Value</span>
                <span className="text-[16px] font-mono font-black text-[#23a559]">{demoUnit.value.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#80848E] block">Demand Grade</span>
                <span className="text-[13px] font-mono font-bold text-[#DBDEE1]">4.5 / 5.0</span>
              </div>
            </div>

            {/* Operational controls footer (Discord style buttons) */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[rgba(255,255,255,0.04)]">
              <button
                onClick={(e) => { e.stopPropagation(); handleDummyClick(e, "give"); }}
                className="py-2 px-2 rounded-[4px] bg-[#4E5058] hover:bg-[#6D6F78] text-white text-[12px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <MousePointerClick className="w-3.5 h-3.5" /> L-Click (Give)
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDummyClick(e, "get"); }}
                className="py-2 px-2 rounded-[4px] bg-[#5865F2] hover:bg-[#4752C4] text-white text-[12px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <MousePointerClick className="w-3.5 h-3.5" /> R-Click (Get)
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[#80848E] text-[11px] bg-[#1E1F22] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.02)]">
            <Hand className="w-3.5 h-3.5 text-[#DBDEE1]" />
            <span>Drag this card directly into the Drop Receptor or Calculator panel.</span>
          </div>
        </div>

        {/* Drop Receptor & Gesture Radar (Right Column) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOverReceptor(true); }}
            onDragLeave={() => setDragOverReceptor(false)}
            onDrop={handleReceptorDrop}
            className={`h-36 rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center text-center p-5 transition-all duration-300 relative overflow-hidden ${
              droppedSuccessfully
                ? "bg-[rgba(35,165,89,0.1)] border-[#23a559]"
                : dragOverReceptor
                ? "bg-[rgba(88,101,242,0.1)] border-[#5865F2] scale-[1.01]"
                : "bg-[#2B2D31] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"
            }`}
          >
            <ArrowDownToLine className={`w-8 h-8 mb-2 transition-transform duration-300 ${
              dragOverReceptor ? "translate-y-1 text-[#5865F2]" : droppedSuccessfully ? "text-[#23a559]" : "text-[#4E5058]"
            }`} />
            <span className={`text-[13px] font-black uppercase tracking-wide ${droppedSuccessfully ? "text-[#23a559]" : "text-[#F2F3F5]"}`}>
              {droppedSuccessfully ? "Drop Registered to [You Give]!" : "Drop Receptor Zone"}
            </span>
            <p className="text-[11px] text-[#80848E] mt-1 max-w-xs leading-relaxed">
              Drop the Practice Dummy here to verify your browser's drag-and-drop pipeline.
            </p>
          </div>

          {/* Gesture cheat-sheet & live view preview */}
          <div className="bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-5 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.04)] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">View Modes & Gestures</span>
              <div className="flex bg-[#1E1F22] rounded-[4px] p-0.5 border border-[rgba(255,255,255,0.04)]">
                <button
                  onClick={() => setViewModeDemo("grid")}
                  className={`px-3 py-1 rounded-[3px] text-[10px] font-bold uppercase transition-all ${
                    viewModeDemo === "grid" ? "bg-[#4e5058] text-white" : "text-[#80848E] hover:text-[#DBDEE1]"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewModeDemo("list")}
                  className={`px-3 py-1 rounded-[3px] text-[10px] font-bold uppercase transition-all ${
                    viewModeDemo === "list" ? "bg-[#4e5058] text-white" : "text-[#80848E] hover:text-[#DBDEE1]"
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Live Demo Render */}
            <div className="bg-[#1E1F22] rounded-[8px] p-4 border border-[rgba(255,255,255,0.04)] shadow-inner mb-4 min-h-[90px] flex items-center justify-center">
              {viewModeDemo === "grid" ? (
                <div className="grid grid-cols-2 gap-2 w-full max-w-[240px]">
                  {["Kaido", "Aqua"].map((name) => (
                    <div key={name} className="bg-[#2B2D31] rounded-[6px] p-2 border border-[rgba(255,255,255,0.04)] text-center shadow-sm">
                      <div className="w-full aspect-square bg-[#111214] rounded-[4px] mb-1.5 flex items-center justify-center"><Hash className="w-3 h-3 text-[#4e5058]" /></div>
                      <span className="text-[10px] font-bold text-[#DBDEE1] truncate block">{name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 w-full">
                  {["Kaido", "Aqua"].map((name) => (
                    <div key={name} className="flex items-center justify-between bg-[#2B2D31] rounded-[6px] px-3 py-2 border border-[rgba(255,255,255,0.04)] shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-[#111214] rounded-[4px] flex items-center justify-center shrink-0"><Hash className="w-2.5 h-2.5 text-[#4e5058]" /></div>
                        <span className="text-[12px] font-bold text-[#DBDEE1]">{name}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#949BA4]">O/C</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-[#B5BAC1]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold text-[#F2F3F5]">
                  <ChevronRight className="w-3.5 h-3.5 text-[#DBDEE1]" /> Swipe Right
                </div>
                <span className="text-[#80848E] pl-5">Opens left sidebar.</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold text-[#F2F3F5]">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#DBDEE1]" /> Swipe Left
                </div>
                <span className="text-[#80848E] pl-5">Opens calculator.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}