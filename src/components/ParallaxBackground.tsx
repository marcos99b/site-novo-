"use client";

import { useEffect } from "react";

export default function ParallaxBackground() {
  useEffect(() => {
    const root = document.documentElement;

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1 .. 1
      const dy = (e.clientY - cy) / cy; // -1 .. 1
      root.style.setProperty("--mx", (dx * 20).toFixed(2) + "px");
      root.style.setProperty("--my", (dy * 20).toFixed(2) + "px");
    };

    const onScroll = () => {
      root.style.setProperty("--sy", String(window.scrollY || 0));
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
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

