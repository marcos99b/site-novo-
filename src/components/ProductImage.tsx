'use client';

import { useState, useEffect } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  priority?: boolean;
}

export default function ProductImage({ src, alt, className = "", fallbackText, priority = false }: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || '/placeholder.jpg');
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(src || '/placeholder.jpg');
    setImageLoading(true);
  }, [src]);

  const handleImageError = () => {
    // Fallback silencioso para placeholder local
    if (currentSrc !== '/placeholder.jpg') {
      setCurrentSrc('/placeholder.jpg');
      setImageLoading(false);
    } else {
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`w-full h-full relative overflow-hidden rounded-2xl img-3d ${className}`}
      onMouseMove={(e) => {
        const target = e.currentTarget.querySelector('.img-3d-inner') as HTMLDivElement | null;
        if (!target) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = Math.max(Math.min(-y * 10, 10), -10);
        const ry = Math.max(Math.min(x * 10, 10), -10);
        target.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget.querySelector('.img-3d-inner') as HTMLDivElement | null;
        if (target) target.style.transform = '';
      }}
    >
      <div className="img-3d-shadow" />
      {/* Loading state */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-slate-800/30 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img 
        src={currentSrc}
        srcSet={`${currentSrc} 640w, ${currentSrc} 1024w, ${currentSrc} 1600w`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt || fallbackText || 'Imagem'} 
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' as const : undefined}
        decoding="async"
        className="img-3d-inner absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
