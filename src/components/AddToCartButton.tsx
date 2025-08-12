'use client';

import { useCart } from '@/contexts/CartContext';
import { trackUserEvent } from '@/lib/supabase';
import { useState } from 'react';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    images: Array<{ src: string; alt: string }>;
    slug: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(product);
    try {
      await trackUserEvent('add_to_cart', { product_id: product.id, price: product.price, name: product.name });
    } catch {}
    
    // Simular delay para feedback visual
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const isProductInCart = isInCart(product.id);

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 transform group-hover:scale-105 ${
        isProductInCart
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50'
          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50'
      } ${isAdding ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {isAdding ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Adicionando...</span>
        </div>
      ) : isProductInCart ? (
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>No Carrinho</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Adicionar ao Carrinho</span>
        </div>
      )}
    </button>
  );
}
