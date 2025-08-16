'use client';

import { useState, useEffect } from 'react';

interface OptimizedHeroImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedHeroImage({
  src,
  alt,
  className = '',
  priority = false
}: OptimizedHeroImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');

  useEffect(() => {
    if (priority) {
      setCurrentSrc(src);
      setImageLoaded(true);
    } else {
      // Lazy loading para imagens não críticas
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      const imgElement = document.querySelector(`img[data-src="${src}"]`);
      if (imgElement) {
        observer.observe(imgElement);
      }

      return () => observer.disconnect();
    }
  }, [src, priority]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  if (priority) {
    // Imagem crítica - carregar imediatamente
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          transition: 'opacity 0.3s ease-in-out',
          willChange: 'opacity'
        }}
      />
    );
  }

  // Imagem não crítica - lazy loading
  return (
    <img
      data-src={src}
      alt={alt}
      className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={handleLoad}
      loading="lazy"
      decoding="async"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{
        transition: 'opacity 0.3s ease-in-out',
        willChange: 'opacity'
      }}
    />
  );
}
