'use client';

import { useState } from 'react';
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import AddToCartButton from "@/components/AddToCartButton";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number;
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  stock: number;
  available: boolean;
  featured: boolean;
}

interface ProductCard3DProps {
  product: Product;
}

export default function ProductCard3D({ product }: ProductCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setMousePosition({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className="group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={`relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6 transition-all duration-700 transform-gpu ${
          isHovered 
            ? 'border-white/30 shadow-2xl shadow-blue-500/20' 
            : 'hover:border-white/20'
        }`}
        style={{
          transform: isHovered 
            ? `rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg) scale(1.05) translateZ(20px)` 
            : 'rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Background Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur transition-opacity duration-700 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className={`absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full transition-all duration-700 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`} style={{ animationDelay: '0ms' }} />
          <div className={`absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full transition-all duration-700 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`} style={{ animationDelay: '100ms' }} />
          <div className={`absolute top-1/2 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full transition-all duration-700 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`} style={{ animationDelay: '200ms' }} />
        </div>

        <div className="relative">
          {/* Imagem do Produto com Efeito 3D */}
          <div className="relative w-full h-64 mb-6 overflow-hidden rounded-2xl transform-gpu">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl" />
            <div 
              className="relative w-full h-full transform-gpu transition-transform duration-700"
              style={{
                transform: isHovered ? 'scale(1.1) rotateY(5deg)' : 'scale(1) rotateY(0deg)'
              }}
            >
              <ProductImage 
                src={product.images?.[0]?.src || `/cj/${product.id}/img-1.jpg` || "/placeholder.jpg"} 
                alt={product.name} 
                className="w-full h-full" 
                fallbackText={product.name}
              />
            </div>
            
            {/* Overlay com informações */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-700 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {product.short_description}
                </p>
              </div>
            </div>
          </div>

          {/* Badge de Desconto com Animação */}
          {product.compare_at_price && product.price < product.compare_at_price && (
            <div className={`absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transition-all duration-700 transform ${
              isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
            }`}>
              -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
            </div>
          )}

          {/* Informações do Produto */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold text-white transition-all duration-700 ${
              isHovered ? 'text-blue-300' : 'text-white'
            }`}>
              {product.name}
            </h3>
            
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
              {product.short_description}
            </p>

            {/* Preços com Animação */}
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold transition-all duration-700 ${
                isHovered ? 'text-blue-400 scale-110' : 'text-white scale-100'
              }`}>
                R$ {product.price.toFixed(2)}
              </span>
              {product.compare_at_price && product.price < product.compare_at_price && (
                <span className="text-lg text-gray-400 line-through">R$ {product.compare_at_price.toFixed(2)}</span>
              )}
            </div>

            {/* Estoque com Animação */}
            {product.stock && product.stock < 10 && (
              <div className={`flex items-center gap-2 transition-all duration-700 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-400 font-medium">
                  Apenas {product.stock} em estoque!
                </span>
              </div>
            )}

            {/* Botões de Ação com Efeito 3D */}
            <div className="pt-4 space-y-3">
              <Link href={`/produto/${product.id}`} className="block">
                <div className={`w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white text-center transition-all duration-700 transform ${
                  isHovered 
                    ? 'hover:shadow-lg hover:shadow-blue-500/50 scale-105 translateY(-2px)' 
                    : 'hover:shadow-lg hover:shadow-blue-500/50 scale-100 translateY(0px)'
                }`}>
                  Ver Detalhes
                </div>
              </Link>
              <div className={`transition-all duration-700 transform ${
                isHovered ? 'scale-105 translateY(-2px)' : 'scale-100 translateY(0px)'
              }`}>
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Border Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-700 ${
          isHovered 
            ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm' 
            : 'bg-transparent'
        }`} />
      </div>
    </div>
  );
}
