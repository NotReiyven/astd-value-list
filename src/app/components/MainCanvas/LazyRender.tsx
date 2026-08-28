import { useState, useEffect, useRef, ReactNode, startTransition } from "react";

export function LazyRender({ children, placeholderHeight = "600px" }: { children: ReactNode, placeholderHeight?: string }) {
  const [isRendered, setIsRendered] = useState(false);
  const [actualHeight, setActualHeight] = useState<string>(placeholderHeight);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // OPTIMIZATION: startTransition tells React to build the DOM in the background without locking the scroll wheel
          startTransition(() => {
            setIsRendered(true);
          });
        } else {
          // Save the height before unmounting to prevent scrollbar jumping
          if (ref.current && ref.current.offsetHeight > 0) {
            setActualHeight(`${ref.current.offsetHeight}px`);
          }
          // Also unmount in the background
          startTransition(() => {
            setIsRendered(false);
          });
        }
      },
      // OPTIMIZATION: Increased buffer to 1500px so React has more time to background-render before the user actually sees it
      { rootMargin: "1500px 0px" } 
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: isRendered ? "auto" : actualHeight }}>
      {isRendered ? children : null}
    </div>
  );
}