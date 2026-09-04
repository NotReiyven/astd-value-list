import React, { useRef } from "react";

export function TiltCard({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    cardRef.current.style.zIndex = '30';
    
    glowRef.current.style.top = `${y - 150}px`;
    glowRef.current.style.left = `${x - 150}px`;
    glowRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !glowRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    cardRef.current.style.zIndex = '1';
    glowRef.current.style.opacity = '0';
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bg-[#2B2D31] border border-[rgba(255,255,255,0.06)] rounded-[12px] flex flex-col shadow-sm relative overflow-hidden group transition-transform duration-500 ease-out ${className}`}
      style={{ willChange: 'transform' }}
    >
      <div 
        ref={glowRef}
        className="absolute pointer-events-none transition-opacity duration-300 z-0 mix-blend-screen opacity-0"
        style={{
          width: 300, height: 300,
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[4px] z-20 rounded-t-[12px]" style={{ backgroundColor: color }} />
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0 transition-opacity group-hover:opacity-20 duration-500" style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} />
      {children}
    </div>
  );
}