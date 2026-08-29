import { useState, useRef } from "react";
import { Info, BookOpen, TriangleAlert, ShieldAlert, Sparkles, LucideIcon, Calendar, Inbox } from "lucide-react";
import { useUnits } from "../../context/UnitContext";

// --- Interactive 3D Tilt Card --- //
function TiltCard({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    setIsHovering(true);

    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none',
      zIndex: 30
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      zIndex: 1
    });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden group ${className}`}
      style={{ ...style, willChange: 'transform' }}
    >
      {/* Spotlight Follow Effect */}
      <div 
        className="absolute pointer-events-none transition-opacity duration-300 z-0 mix-blend-screen"
        style={{
          top: mousePos.y - 150,
          left: mousePos.x - 150,
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
          opacity: isHovering ? 1 : 0
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[4px] z-20 rounded-t-[12px]" style={{ backgroundColor: color }} />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0 transition-opacity group-hover:opacity-20 duration-500" 
        style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} 
      />
      {children}
    </div>
  );
}

// --- Main Component --- //
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
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <div className="w-16 h-16 bg-[#2B2D31] rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.04)] mb-4">
              <Inbox className="w-8 h-8 text-[#80848E]" />
            </div>
            <p className="text-[#DBDEE1] text-[14px] font-bold">No notices currently active.</p>
            <p className="text-[#80848E] text-[12px] mt-1">Check back later for updates from the Value List Team.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-5 animate-fade-in pb-4">
            {notices.map((notice, idx) => {
              const { icon: Icon, color } = getStyleForNotice(idx);
              return (
                <TiltCard 
                  key={idx} 
                  color={color} 
                  className="break-inside-avoid mb-5"
                >
                  <div className="p-5 flex flex-col h-full relative z-10">
                    <div className="flex items-center gap-3 mb-4 border-b border-[rgba(255,255,255,0.04)] pb-3">
                      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-[18px] h-[18px]" style={{ color }} />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-[#F2F3F5] tracking-tight leading-tight uppercase pr-2">
                        {notice.title}
                      </h3>
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
                          style={{ color, borderColor: `${color}40` }}
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