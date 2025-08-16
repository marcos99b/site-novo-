'use client';

import { useState, useEffect, useRef } from 'react';

interface UltraOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function UltraOptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: UltraOptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      // Imagem crítica - carregar imediatamente
      setCurrentSrc(src);
      setImageLoaded(true);
      
      // Preload crítico
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    } else {
      // Imagem não crítica - lazy loading ultra otimizado
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { 
          threshold: 0.01, // ABSOLUTO MÍNIMO
          rootMargin: '10px' // ABSOLUTO MÍNIMO
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [src, priority]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  if (priority) {
    // Imagem crítica para LCP
    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        sizes={sizes}
        style={{
          transition: 'opacity 0.2s ease-in-out',
          willChange: 'opacity',
          contentVisibility: 'auto'
        }}
      />
    );
  }

  // Imagem não crítica - lazy loading ultra otimizado
  return (
    <img
      ref={imgRef}
      data-src={src}
      alt={alt}
      className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={handleLoad}
      loading="lazy"
      decoding="async"
      sizes={sizes}
      style={{
        transition: 'opacity 0.2s ease-in-out',
        willChange: 'opacity',
        contentVisibility: 'auto'
      }}
    />
  );
}
