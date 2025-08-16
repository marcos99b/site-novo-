'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface PromotionalBannerProps {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  badgeText: string;
  imageSrc: string;
  imageAlt: string;
  discount?: string;
  highlightColor?: string;
}

export default function PromotionalBanner({
  title,
  subtitle,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  badgeText,
  imageSrc,
  imageAlt,
  discount = "40%",
  highlightColor = "amber"
}: PromotionalBannerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const colorClasses = {
    amber: {
      badge: "from-amber-500 to-orange-600",
      highlight: "text-amber-600",
      gradient: "from-amber-100 to-orange-200"
    },
    blue: {
      badge: "from-blue-500 to-indigo-600",
      highlight: "text-blue-600",
      gradient: "from-blue-100 to-indigo-200"
    },
    purple: {
      badge: "from-purple-500 to-pink-600",
      highlight: "text-purple-600",
      gradient: "from-purple-100 to-pink-200"
    },
    green: {
      badge: "from-green-500 to-emerald-600",
      highlight: "text-green-600",
      gradient: "from-green-100 to-emerald-200"
    }
  };

  const colors = colorClasses[highlightColor as keyof typeof colorClasses] || colorClasses.amber;

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Conteúdo do Banner */}
          <div className="text-center lg:text-left animate-slide-up order-2 lg:order-1">
            <div className="mb-4">
              <span className={`inline-block bg-gradient-to-r ${colors.badge} text-white text-xs sm:text-sm px-3 py-1 rounded-full font-medium tracking-wide shadow-lg`}>
                {badgeText}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-4 leading-tight">
              <span className={`font-normal ${colors.highlight}`}>{subtitle}</span>
              <br />
              {title}
            </h2>
            
            {discount && (
              <div className="mb-4">
                <span className="inline-block bg-gradient-to-r from-red-500 to-pink-600 text-white text-lg sm:text-xl px-4 py-2 rounded-full font-bold shadow-lg">
                  Até {discount} de desconto
                </span>
              </div>
            )}
            
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link 
                href={primaryButtonLink} 
                className="btn-primary px-8 py-3 text-sm sm:text-base font-medium hover:scale-105 transition-transform duration-300 shadow-lg"
              >
                {primaryButtonText}
              </Link>
              <Link 
                href={secondaryButtonLink} 
                className="btn-secondary-dark px-8 py-3 text-sm sm:text-base font-medium hover:scale-105 transition-transform duration-300 shadow-lg"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>

          {/* Imagem do Banner */}
          <div className="relative animate-slide-up order-1 lg:order-2" style={{ animationDelay: '0.1s' }}>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Imagem do Banner */}
              <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] relative">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    className={`object-cover transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🛍️</div>
                      <p className="text-gray-600 text-sm font-medium">Banner Image</p>
                      <p className="text-gray-500 text-xs mt-2">1200x800px (Desktop)</p>
                      <p className="text-gray-500 text-xs">800x600px (Mobile)</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                
                {/* Decoração sutil */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
