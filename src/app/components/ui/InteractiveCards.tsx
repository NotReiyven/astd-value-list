import React, { useState, useRef } from "react";
import { Check } from "lucide-react";

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

export function TiltCard({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) {
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

export function CreditBadge({ name, color }: { name: string; color: string }) {
  const [copied, setCopied] = useState(false);
  const [sparks, setSparks] = useState<{id: number, tx: number, ty: number}[]>([]);

  const handleCopy = (e: React.MouseEvent) => {
    navigator.clipboard.writeText(name);
    setCopied(true);
    
    // Generate burst particles
    const newSparks = Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 45) + (Math.random() * 20);
      const distance = 25 + Math.random() * 15;
      return {
        id: Date.now() + i,
        tx: Math.cos((angle * Math.PI) / 180) * distance,
        ty: Math.sin((angle * Math.PI) / 180) * distance,
      };
    });
    
    setSparks(newSparks);
    setTimeout(() => setCopied(false), 1500);
    setTimeout(() => setSparks([]), 600); // clear sparks after animation
  };

  return (
    <button
      onClick={handleCopy}
      title="Click to copy name"
      className="relative bg-[#1E1F22] border px-2.5 py-1 rounded-[6px] text-[12px] font-semibold shadow-sm transition-all duration-300 ease-out active:scale-95 flex items-center justify-center min-w-[60px]"
      style={{
        color: copied ? color : '#DBDEE1',
        borderColor: copied ? color : 'rgba(255,255,255,0.04)',
        boxShadow: copied ? `0 4px 16px ${color}40` : 'none',
        zIndex: copied ? 10 : 1
      }}
    >
      {sparks.map(s => (
        <span 
          key={s.id}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none animate-spark"
          style={{ 
            backgroundColor: color, 
            '--tx': `${s.tx}px`, 
            '--ty': `${s.ty}px`,
            left: '50%',
            top: '50%',
            marginLeft: '-3px',
            marginTop: '-3px'
          } as any}
        />
      ))}
      <span className={`flex items-center gap-1.5 transition-transform duration-300 ${copied ? 'scale-105' : 'scale-100'}`}>
        {copied && <Check className="w-3.5 h-3.5" />}
        {name}
      </span>
    </button>
  );
}