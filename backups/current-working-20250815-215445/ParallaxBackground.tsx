"use client";

import { useEffect, useRef } from "react";

export default function ParallaxBackground() {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isScrolling = useRef(false);

  useEffect(() => {
    const root = document.documentElement;

    // Throttled mouse move para performance ULTRA MEGA ABSOLUTA (reduzido ao máximo)
    const onMouseMove = (e: MouseEvent) => {
      if (timeoutRef.current) return;
      
      timeoutRef.current = setTimeout(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        
        // Reduzir intensidade ao ABSOLUTO MÁXIMO para performance ULTRA MEGA
        root.style.setProperty("--mx", (dx * 1.5).toFixed(2) + "px");
        root.style.setProperty("--my", (dy * 1.5).toFixed(2) + "px");
        timeoutRef.current = undefined;
      }, 100); // Reduzido para 10fps (performance ABSOLUTA)
    };

    // Throttled scroll para performance ULTRA MEGA ABSOLUTA
    const onScroll = () => {
      if (isScrolling.current) return;
      
      isScrolling.current = true;
      requestAnimationFrame(() => {
        // Reduzir intensidade do scroll ao ABSOLUTO MÁXIMO
        root.style.setProperty("--sy", String((window.scrollY || 0) * 0.1));
        isScrolling.current = false;
      });
    };

    // Usar passive listeners para performance ABSOLUTA
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Inicializar valores
    onScroll();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="parallax-bg" aria-hidden="true">
      <div className="parallax-layer layer-1" />
      <div className="parallax-layer layer-2" />
      <div className="parallax-layer layer-3" />
      <div className="parallax-vignette" />
    </div>
  );
}

