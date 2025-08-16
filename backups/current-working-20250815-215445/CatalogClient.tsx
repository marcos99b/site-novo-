'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import AddToCartButton from "@/components/AddToCartButton";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard3D from "@/components/ProductCard3D";

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

interface CatalogClientProps {
  initialProducts: Product[];
}

export default function CatalogClient({ initialProducts }: CatalogClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  // Extrair categorias únicas dos produtos
  useEffect(() => {
    const uniqueCategories = new Map();
    initialProducts.forEach(product => {
      product.categories.forEach(category => {
        uniqueCategories.set(category.id, category);
      });
    });
    setCategories(Array.from(uniqueCategories.values()));
  }, [initialProducts]);

  // Filtrar produtos por categoria
  useEffect(() => {
    if (activeCategory === null) {
      setProducts(initialProducts);
    } else {
      const filtered = initialProducts.filter(product =>
        product.categories.some(cat => cat.slug === activeCategory)
      );
      setProducts(filtered);
    }
  }, [activeCategory, initialProducts]);

  return (
    <div className="relative min-h-screen py-12">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Catálogo
            </span>
            <span className="text-white"> de Produtos</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Descubra nossa seleção premium de carregadores e acessórios para seus dispositivos Apple
          </p>
        </div>

        {/* Filtros 3D */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Grid de Produtos 3D */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard3D key={p.id} product={p} />
          ))}
        </div>

        {/* Mensagem de Produtos Vazios */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Nenhum produto encontrado</h3>
                <p className="text-gray-300">Tente selecionar outra categoria ou volte mais tarde!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
