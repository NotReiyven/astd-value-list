import React, { useRef, useState } from "react";

export function SpotlightCard({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsHovering(true);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovering(false)}
      className={`bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] duration-300 ${className}`}
    >
      <div 
        className="absolute pointer-events-none transition-opacity duration-300 z-0 mix-blend-screen"
        style={{
          top: mousePos.y - 150, left: mousePos.x - 150, width: 300, height: 300,
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