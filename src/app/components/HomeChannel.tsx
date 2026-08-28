import { useState, useMemo } from "react";
import { ExternalLink, Sparkles, ShieldAlert, Users, FileText, Wrench, ChevronRight, ShieldCheck } from "lucide-react";
import { useUnits } from "../../context/UnitContext";

export function HomeChannel() {
  const [activeHomeTab, setActiveHomeTab] = useState<"info" | "updates" | "credits">("info");
  const { changelog } = useUnits();

  // Smart-groups the raw array by using the "--------" divider line
  const parsedChangelog = useMemo(() => {
    if (!changelog || changelog.length === 0) return [];
    
    const blocks: { title: string; lines: string[] }[] = [];
    let currentBlock = { title: "Recent Changes", lines: [] as string[] };
    
    for (let i = 0; i < changelog.length; i++) {
      const clean = changelog[i].trim();
      
      // Skip empty lines or the divider lines themselves
      if (!clean || clean.match(/^[-_]{3,}$/)) continue;
      
      // Look ahead to see if the immediate next line is a divider
      const isHeader = i + 1 < changelog.length && changelog[i + 1].trim().match(/^[-_]{3,}$/);
      
      if (isHeader) {
        if (currentBlock.lines.length > 0) blocks.push({ ...currentBlock });
        currentBlock = { title: clean, lines: [] };
      } else {
        currentBlock.lines.push(clean);
      }
    }
    if (currentBlock.lines.length > 0) blocks.push(currentBlock);
    
    return blocks;
  }, [changelog]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#313338] h-full select-none">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #2B2D31; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A1B1E; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-[rgba(255,255,255,0.04)] bg-[#2B2D31]">
        <div className="flex bg-[#1E1F22] rounded-[6px] p-1 border border-[rgba(255,255,255,0.04)] w-full md:w-fit">
          <button onClick={() => setActiveHomeTab("info")} className={`flex-1 md:flex-none px-6 py-1.5 rounded-[4px] text-[12px] font-bold transition-all ${activeHomeTab === "info" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>General Info</button>
          <button onClick={() => setActiveHomeTab("updates")} className={`flex-1 md:flex-none px-6 py-1.5 rounded-[4px] text-[12px] font-bold transition-all ${activeHomeTab === "updates" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>Patch Notes</button>
          <button onClick={() => setActiveHomeTab("credits")} className={`flex-1 md:flex-none px-6 py-1.5 rounded-[4px] text-[12px] font-bold transition-all ${activeHomeTab === "credits" ? "bg-[#5865F2] text-white shadow-sm" : "text-[#949BA4] hover:text-[#DBDEE1]"}`}>Credits</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        
        {activeHomeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 animate-fade-in pb-4">
            <div className="bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 group">
              <div className="absolute top-0 left-0 right-0 h-[4px] z-20 bg-[#5865F2]" />
              <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 duration-500 z-0 bg-gradient-to-b from-[#5865F2] to-transparent" />
              <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0"><Sparkles className="w-[18px] h-[18px] text-[#5865F2]" /></div>
                  <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">General Information</h3>
                </div>
                <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-6">Everything shown in this Value List is an estimation from this Value List's Team made from community's trades, our changes can be innacurate sometimes, although, this Value List is currently the most reliable source of values for ASTD.</p>
                <div className="mt-auto flex flex-col gap-3">
                  <a href="https://discord.gg/Q7JTvPUEM" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-[12px] font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2.5 rounded-[6px] transition-colors active:scale-[0.98]">Join the Value List Discord <ExternalLink className="w-3.5 h-3.5" /></a>
                  <p className="text-[11px] text-[#949BA4] text-center">Think any information is wrong? Make a Support Ticket in our Discord!</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 group">
              <div className="absolute top-0 left-0 right-0 h-[4px] z-20 bg-[#FAA61A]" />
              <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 duration-500 z-0 bg-gradient-to-b from-[#FAA61A] to-transparent" />
              <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0"><ShieldAlert className="w-[18px] h-[18px] text-[#FAA61A]" /></div>
                  <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase">Value List Team's Note</h3>
                </div>
                <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-4">Recently, it has been common of traders on win/loss, in our discord server, associating one bad offer/trade, which can come from a multitude of reasons, with the specific unit dropping, creating a trend which other traders follow, causing the unit to be panic traded and dropped.</p>
                <div className="bg-[#111214] p-3.5 rounded-[8px] border border-[rgba(250,166,26,0.2)] mb-4">
                  <p className="text-[11.5px] text-[#FAA61A] font-medium leading-relaxed italic">"We would like to remind such behavior causes the market to be extremely unstable, causing many units to crash without any previous reason, so we from the Value List Team recommend traders to analyse the market before wrongly assuming the situation of the unit."</p>
                </div>
                <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  <span className="text-[11px] font-bold text-[#80848E] uppercase tracking-widest">Recommendation:</span><span className="ml-2 text-[12px] text-[#DBDEE1]">Stay calm and verify trades with the analyzer!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeHomeTab === "updates" && (
          <div className="animate-fade-in pb-4">
            <div className="flex items-center justify-between mb-5 bg-[#2B2D31] p-4 rounded-[10px] border border-[rgba(255,255,255,0.04)] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[rgba(35,165,89,0.1)] flex items-center justify-center border border-[rgba(35,165,89,0.2)]"><FileText className="w-4 h-4 text-[#23a559]" /></div>
                <h3 className="text-[16px] font-black text-[#F2F3F5] tracking-tight uppercase">Latest Patch Notes</h3>
              </div>
            </div>

            {parsedChangelog.length === 0 ? (
              <p className="text-[#80848E] text-sm text-center py-8">No recent updates logged in the spreadsheet.</p>
            ) : (
              <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
                {parsedChangelog.map((block, idx) => {
                  const colors = ["#949BA4", "#dd7e6b", "#a855f7", "#3b82f6", "#9ca3af", "#8b5cf6", "#23a559", "#FAA61A"];
                  const color = colors[idx % colors.length];
                  
                  return (
                    <div key={idx} className="break-inside-avoid mb-4 bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 group">
                      <div className="absolute top-0 left-0 right-0 h-[4px] z-20" style={{ backgroundColor: color }} />
                      <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none z-0 transition-opacity group-hover:opacity-20 duration-500" style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} />
                      <div className="p-5 relative z-10">
                        <h3 className="text-[14px] font-extrabold text-[#F2F3F5] uppercase tracking-wider mb-4 border-b border-[rgba(255,255,255,0.06)] pb-2 flex items-center gap-2">
                          {block.title.toLowerCase().includes("fix") ? <Wrench className="w-4 h-4" style={{ color }} /> : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
                          {block.title}
                        </h3>
                        <ul className="flex flex-col gap-3 text-[12px] text-[#DBDEE1]">
                          {block.lines.map((line, lIdx) => (
                            <li key={lIdx} className="flex gap-2 items-start">
                              <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} /> 
                              <span>{line.replace(/^-\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeHomeTab === "credits" && (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-4 animate-fade-in pb-4">
            
            <div className="break-inside-avoid mb-4 bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 group">
              <div className="absolute top-0 left-0 right-0 h-[4px] z-20 bg-[#FAA61A]" />
              <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none bg-gradient-to-b from-[#FAA61A] to-transparent z-0 transition-opacity group-hover:opacity-20 duration-500" />
              <div className="p-5 relative z-10 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#111214] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-3"><Sparkles className="w-6 h-6 text-[#FAA61A]" /></div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4] mb-2">List Founded By</h4>
                <p className="text-[16px] font-black text-[#F2F3F5] tracking-tight">EpicInfinity & Soupermunki</p>
              </div>
            </div>
            
            <div className="break-inside-avoid mb-4 bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 group">
              <div className="absolute top-0 left-0 right-0 h-[4px] z-20 bg-[#5865F2]" />
              <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none bg-gradient-to-b from-[#5865F2] to-transparent z-0 transition-opacity group-hover:opacity-20 duration-500" />
              <div className="p-5 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#111214] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-3"><ShieldCheck className="w-6 h-6 text-[#5865F2]" /></div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4] mb-3">Value List Team</h4>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["Batata_Uy142", "Gabe", "Goofyismad", "Azking", "Codythechickenman", "Suns_Radiance", "Vex"].map(n => (
                    <span key={n} className="bg-[#1E1F22] border border-[rgba(255,255,255,0.04)] px-2.5 py-1 rounded-[6px] text-[12px] font-semibold text-[#DBDEE1] shadow-sm">{n}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Re-added Ex-Staffs Block */}
            <div className="break-inside-avoid mb-4 bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 group">
              <div className="absolute top-0 left-0 right-0 h-[4px] z-20 bg-[#949BA4]" />
              <div className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none bg-gradient-to-b from-[#949BA4] to-transparent z-0 transition-opacity group-hover:opacity-20 duration-500" />
              <div className="p-5 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#111214] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-[#949BA4]" />
                </div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4] mb-3">Ex-Staff Contributors</h4>
                <p className="text-[12px] text-[#B5BAC1] leading-relaxed">
                  Ded_Sen, Crimson Desire, Brysans, SquidyMotion, Luk, Hero, soupermunki, dennis.67, hopper duper, Poxie, Iridescent Equinox, Pchongle, unobium, Demonfox, GorillaTactics92, MicroJillyWilly, Doggod, kosu, Paker, Kiwami, brogee, Leo, arkss, Trvz, Up Vantagehgc, fortnitekid, Mikoto, En Thobias12, Miro_y, arkysesh, brickz7, Venus, AdamSBDG7, halw, NathanPlayz, orangehairfunnyman, olivia.rodrigo, Felta, VerotObelyn, Kyo
                </p>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}