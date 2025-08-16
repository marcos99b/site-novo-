'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  priority?: boolean;
  rounded?: boolean;
}

export default function ProductImage({ src, alt, className = "", fallbackText, priority = false, rounded = true }: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || '/placeholder.jpg');
  const [imageLoading, setImageLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isHovering = useRef(false);

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

  // Otimizar eventos de mouse com throttling (reduzido ao ABSOLUTO MÁXIMO)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isHovering.current) return;
    
    if (timeoutRef.current) return;
    
    // Verificação de segurança para evitar erro de null
    if (!e.currentTarget) return;
    
    timeoutRef.current = setTimeout(() => {
      // Verificação dupla de segurança
      if (!e.currentTarget || !e.currentTarget.querySelector) return;
      
      const target = e.currentTarget.querySelector('.img-3d-inner') as HTMLDivElement | null;
      if (!target) return;
      
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Reduzir intensidade ao ABSOLUTO MÁXIMO para performance ULTRA MEGA
        const rx = Math.max(Math.min(-y * 0.8, 0.8), -0.8);
        const ry = Math.max(Math.min(x * 0.8, 0.8), -0.8);
        
        target.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.001)`;
      } catch (error) {
        // Silenciar erros de DOM para evitar crashes
        console.warn('Erro ao aplicar transform 3D:', error);
      }
      
      timeoutRef.current = undefined;
    }, 100); // Reduzido para 10fps (performance ABSOLUTA)
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHovering.current = true;
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    isHovering.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    // Verificação de segurança para evitar erro de null
    if (!e.currentTarget) return;
    
    const target = e.currentTarget.querySelector('.img-3d-inner') as HTMLDivElement | null;
    if (target) target.style.transform = '';
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`w-full h-full relative overflow-hidden ${rounded ? 'rounded-2xl' : ''} img-3d ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="img-3d-shadow" />
      
      {/* Loading state otimizado */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-slate-800/30 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
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
