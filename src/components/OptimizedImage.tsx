'use client';

import { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.jpg',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=='
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder);
  const [imageLoaded, setImageLoaded] = useState(priority);
  const [hasError, setHasError] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const [containerRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  useEffect(() => {
    if (isVisible && !imageLoaded && !hasError) {
      setCurrentSrc(src);
    }
  }, [isVisible, src, imageLoaded, hasError]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder enquanto carrega */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse" />
      )}
      
      {/* Imagem otimizada */}
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading spinner para imagens não prioritárias */}
      {!priority && !imageLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
