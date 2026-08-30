import { useState, useEffect, useRef, ReactNode, startTransition } from "react";

export function LazyRender({ 
  children, 
  placeholderHeight = "600px",
  forceRender = false 
}: { 
  children: ReactNode, 
  placeholderHeight?: string,
  forceRender?: boolean 
}) {
  const [isRendered, setIsRendered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // FIXED: Instantly force-render if targeted by sidebar navigation
    if (forceRender) {
      startTransition(() => setIsRendered(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isRendered) {
          startTransition(() => {
            setIsRendered(true);
          });
        }
      },
      { rootMargin: "1500px 0px" } 
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isRendered, forceRender]);

  return (
    <div ref={ref} style={{ minHeight: isRendered ? "auto" : placeholderHeight }}>
      {isRendered ? children : null}
    </div>
  );
}