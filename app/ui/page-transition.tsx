"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "left" | "right";

interface PageTransitionProps {
  children: React.ReactNode;
  direction?: Direction;
}

export default function PageTransition({
  children,
  direction = "left",
}: PageTransitionProps) {
  const [phase, setPhase] = useState<"enter" | "idle">("enter");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Force browser to register the start frame before switching to idle
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("idle"));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const enterX = direction === "left" ? "60px" : "-60px";

  return (
    <div
      ref={ref}
      style={{
        opacity: phase === "enter" ? 0 : 1,
        transform:
          phase === "enter"
            ? `translateX(${enterX}) scale(0.97)`
            : "translateX(0) scale(1)",
        transition:
          "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
