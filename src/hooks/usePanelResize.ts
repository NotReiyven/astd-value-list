import { useState, useCallback, useEffect, useRef } from "react";

export function usePanelResize(initialWidth: number = 400, minWidth: number = 400, maxWidth: number = 800) {
  const [panelWidth, setPanelWidth] = useState<number>(initialWidth);
  const panelRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    let newWidth = startWidth;
    let ticking = false;

    const parent1 = panelRef.current?.parentElement;
    const parent2 = parent1?.parentElement;
    
    if (parent2) parent2.style.transition = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
       if (!ticking) {
         window.requestAnimationFrame(() => {
           const delta = startX - moveEvent.clientX; 
           newWidth = Math.min(Math.max(minWidth, startWidth + delta), maxWidth); 
           
           if (panelRef.current) panelRef.current.style.width = `${newWidth}px`;
           if (parent1 && parent2) {
             parent1.style.width = `${newWidth}px`;
             parent1.style.maxWidth = 'none';
             parent2.style.width = `${newWidth}px`;
             parent2.style.maxWidth = 'none';
           }
           ticking = false;
         });
         ticking = true;
       }
    };

    const onMouseUp = () => {
       document.removeEventListener("mousemove", onMouseMove);
       document.removeEventListener("mouseup", onMouseUp);
       document.body.style.cursor = 'default';
       
       if (parent2) parent2.style.transition = ''; 
       setPanelWidth(newWidth);
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panelWidth, minWidth, maxWidth]);

  useEffect(() => {
    return () => { document.body.style.cursor = 'default'; };
  }, []);

  return { panelWidth, setPanelWidth, startResize, panelRef };
}