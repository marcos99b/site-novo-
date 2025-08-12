'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem, cartManager } from '@/lib/cart';

interface CartContextType {
  cart: Cart;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    setCart(cartManager.getCart());
  }, []);

  // Sincronizar com localStorage quando cart mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('techstore_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: any, quantity: number = 1) => {
    const updatedCart = cartManager.addItem(product, quantity);
    setCart(updatedCart);
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cartManager.removeItem(productId);
    setCart(updatedCart);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const updatedCart = cartManager.updateQuantity(productId, quantity);
    setCart(updatedCart);
  };

  const clearCart = () => {
    const updatedCart = cartManager.clearCart();
    setCart(updatedCart);
  };

  const isInCart = (productId: number) => {
    return cart.items.some(item => item.id === productId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
