import { Info, BookOpen, TriangleAlert, ShieldAlert, Sparkles, LucideIcon } from "lucide-react";
import { useUnits } from "../../context/UnitContext";

export function ExtraNoticesChannel() {
  const { notices } = useUnits();

  // Deterministic styling based on index since Google Sheets doesn't store icons/colors
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

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        
        {notices.length === 0 ? (
           <p className="text-[#80848E] text-sm text-center py-8">No notices available.</p>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-4 animate-fade-in pb-4">
            {notices.map((notice, idx) => {
              const { icon: Icon, color } = getStyleForNotice(idx);
              return (
                <div 
                  key={idx} 
                  className="break-inside-avoid mb-4 bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 group"
                >
                  <div className="absolute top-0 left-0 right-0 h-[4px] z-20" style={{ backgroundColor: color }} />
                  <div 
                    className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 duration-500 z-0" 
                    style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} 
                  />
                  
                  <div className="p-5 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0">
                        <Icon className="w-[18px] h-[18px]" style={{ color }} />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight">
                        {notice.title}
                      </h3>
                    </div>
                    
                    <p className="text-[13px] text-[#DBDEE1] leading-[1.65] mb-5 whitespace-pre-wrap">
                      {notice.content}
                    </p>

                    {notice.date && (
                      <div className="mt-auto pt-3 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#80848E] uppercase tracking-widest">Added</span>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-[4px] bg-[#1E1F22] border border-[rgba(255,255,255,0.03)] shadow-inner" style={{ color }}>
                          {notice.date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}