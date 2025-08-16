'use client';

import Link from 'next/link';
import React from 'react';

export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center group ${className}`} aria-label="Reliet Home">
      {/* Nome da marca com tipografia elegante e sofisticada */}
      <div className="flex flex-col">
        <span className="text-lg sm:text-xl lg:text-2xl font-light text-gray-800 tracking-[0.3em] group-hover:text-gray-900 transition-all duration-500 group-hover:tracking-[0.4em] group-active:scale-95">
          RELIET
        </span>
        <span className="text-[10px] text-gray-600 font-medium tracking-[0.35em] opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-700">
          ELEGANCE MADE MODERN
        </span>
      </div>
    </Link>
  );
}
