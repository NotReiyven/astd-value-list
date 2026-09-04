import { useState, useMemo } from "react";
import { Info, BookOpen, TriangleAlert, ShieldAlert, Sparkles, LucideIcon, Calendar, Inbox, Search, Pin } from "lucide-react";
import { useUnits } from "../../context/UnitContext";
import { TiltCard } from "./ui/TiltCard";

export function ExtraNoticesChannel() {
  const { notices } = useUnits();
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedTitles, setPinnedTitles] = useState<Record<string, boolean>>({});

  const togglePin = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedTitles(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Filter and sort notices (pinned items float to top)
  const processedNotices = useMemo(() => {
    if (!notices) return [];
    
    const filtered = notices.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aPinned = pinnedTitles[a.title] ? 1 : 0;
      const bPinned = pinnedTitles[b.title] ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [notices, searchQuery, pinnedTitles]);

  const getStyleForNotice = (idx: number): { icon: LucideIcon, color: string } => {
    const styles = [
      { icon: BookOpen, color: "#5865F2" },
      { icon: Info, color: "#00A8FC" },
      { icon: ShieldAlert, color: "#ed4245" },
      { icon: TriangleAlert, color: "#FAA61A" },
      { icon: Info, color: "#F1C40F" },
      { icon: TriangleAlert, color: "#FAA61A" },
      { icon: Info, color: "#949BA4" },
      { icon: Sparkles, color: "#23a559" }
    ];
    return styles[idx % styles.length];
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#313338] h-full select-none">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #2B2D31; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A1B1E; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* SEARCH FILTER BAR HEADER */}
      {notices.length > 0 && (
        <div className="flex-shrink-0 px-4 md:px-6 pt-4 pb-2 bg-[#313338]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80848E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices by keyword..."
              className="w-full bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] rounded-[8px] pl-9 pr-4 py-2 text-[12px] text-[#DBDEE1] placeholder-[#80848E] focus:outline-none focus:border-[#5865F2] transition-colors shadow-inner"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        {processedNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <div className="w-16 h-16 bg-[#2B2D31] rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.04)] mb-4">
              <Inbox className="w-8 h-8 text-[#80848E]" />
            </div>
            <p className="text-[#DBDEE1] text-[14px] font-bold">
              {notices.length === 0 ? "No notices currently active." : "No matching notices found."}
            </p>
            <p className="text-[#80848E] text-[12px] mt-1">
              {notices.length === 0 ? "Check back later for updates from the Value List Team." : "Try adjusting your search query."}
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-5 animate-fade-in pb-4">
            {processedNotices.map((notice, idx) => {
              const { icon: Icon, color } = getStyleForNotice(idx);
              const isPinned = pinnedTitles[notice.title];

              return (
                <TiltCard 
                  key={idx} 
                  color={isPinned ? "#FAA61A" : color} 
                  className="break-inside-avoid mb-5"
                >
                  <div className="p-5 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-3 mb-4 border-b border-[rgba(255,255,255,0.04)] pb-3">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-[18px] h-[18px]" style={{ color: isPinned ? "#FAA61A" : color }} />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase pr-2">
                        {notice.title}
                      </h3>
                      <button
                        onClick={(e) => togglePin(notice.title, e)}
                        title={isPinned ? "Unpin notice" : "Pin notice to top"}
                        className={`ml-auto p-1.5 rounded-[6px] transition-all ${
                          isPinned 
                            ? "bg-[#FAA61A]/15 text-[#FAA61A] border border-[#FAA61A]/30" 
                            : "text-[#80848E] hover:text-[#DBDEE1] hover:bg-[#1E1F22]"
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    
                    <p className="text-[13px] text-[#DBDEE1] leading-relaxed mb-5 whitespace-pre-wrap">
                      {notice.content}
                    </p>

                    {notice.date && (
                      <div className="mt-auto pt-3 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-[#80848E] uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Logged
                        </span>
                        <span 
                          className="text-[10.5px] font-bold px-2.5 py-1 rounded-[6px] bg-[#1E1F22] border shadow-inner" 
                          style={{ color: isPinned ? "#FAA61A" : color, borderColor: `${isPinned ? "#FAA61A" : color}40` }}
                        >
                          {notice.date}
                        </span>
                      </div>
                    )}
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}