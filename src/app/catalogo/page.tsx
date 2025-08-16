'use client';

import Link from 'next/link';
import { formatEUR } from '@/lib/currency';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Dados dos produtos organizados por categoria
  const productsByCategory = {
    all: [
      {
        id: "produto-1",
        name: "Casaco de Lã Clássico",
        price: 89.9,
        compare_at_price: 120.0,
        category: "Casacos",
        slug: "produto-1",
        image: "/produtos/produto-1/1.jpg"
      },
      {
        id: "produto-2",
        name: "Conjunto Algodão & Linho",
        price: 79.9,
        compare_at_price: 100.0,
        category: "Conjuntos",
        slug: "produto-2",
        image: "/produtos/produto-2/2.jpg"
      },
      {
        id: "produto-5",
        name: "Colete Tricot Decote V",
        price: 44.9,
        compare_at_price: 60.0,
        category: "Coletes",
        slug: "produto-5",
        image: "/produtos/produto-5/1.jpg"
      },
      {
        id: "produto-6",
        name: "Colete com Fivela",
        price: 45.9,
        compare_at_price: 65.0,
        category: "Coletes",
        slug: "produto-6",
        image: "/produtos/produto-6/1.jpg"
      },
      {
        id: "produto-7",
        name: "Pantufas de Couro Premium",
        price: 129.9,
        compare_at_price: 180.0,
        category: "Calçados",
        slug: "produto-7",
        image: "/produtos/produto-7/1.jpg"
      },
      {
        id: "produto-8",
        name: "Bolsa Tote Designer de Inverno",
        price: 199.9,
        compare_at_price: 280.0,
        category: "Acessórios",
        slug: "produto-8",
        image: "/produtos/produto-8/1.jpg"
      }
    ],
    casacos: [
      {
        id: "produto-1",
        name: "Casaco de Lã Clássico",
        price: 89.9,
        compare_at_price: 120.0,
        category: "Casacos",
        slug: "produto-1",
        image: "/produtos/produto-1/1.jpg"
      }
    ],
    conjuntos: [
      {
        id: "produto-2",
        name: "Conjunto Algodão & Linho",
        price: 79.9,
        compare_at_price: 100.0,
        category: "Conjuntos",
        slug: "produto-2",
        image: "/produtos/produto-2/2.jpg"
      }
    ],
    coletes: [
      {
        id: "produto-5",
        name: "Colete Tricot Decote V",
        price: 44.9,
        compare_at_price: 60.0,
        category: "Coletes",
        slug: "produto-5",
        image: "/produtos/produto-5/1.jpg"
      },
      {
        id: "produto-6",
        name: "Colete com Fivela",
        price: 45.9,
        compare_at_price: 65.0,
        category: "Coletes",
        slug: "produto-6",
        image: "/produtos/produto-6/1.jpg"
      }
    ],
    calcados: [
      {
        id: "produto-7",
        name: "Pantufas de Couro Premium",
        price: 129.9,
        compare_at_price: 180.0,
        category: "Calçados",
        slug: "produto-7",
        image: "/produtos/produto-7/1.jpg"
      }
    ],
    acessorios: [
      {
        id: "produto-8",
        name: "Bolsa Tote Designer de Inverno",
        price: 199.9,
        compare_at_price: 280.0,
        category: "Acessórios",
        slug: "produto-8",
        image: "/produtos/produto-8/1.jpg"
      }
    ]
  };

  // Função para filtrar produtos
  const getFilteredProducts = () => {
    return productsByCategory[selectedCategory as keyof typeof productsByCategory] || productsByCategory.all;
  };

  // Função para selecionar categoria
  const selectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  // Atualizar categoria baseado na URL
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const filteredProducts = getFilteredProducts();

  return (
    <div className="relative">
      {/* Hero elegante */}
      <div className="relative min-h-[36vh] sm:min-h-[50vh] flex items-center pt-4 sm:pt-0 hero-spot">
        <div className="absolute inset-0" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="text-center space-y-3 sm:space-y-6">
            <h1 className="text-4xl lg:text-5xl font-light heading-aurum-3d underline-aurum mb-6">
              Catálogo Completo
            </h1>
            <p className="text-xl text-luxe-subtitle max-w-3xl mx-auto leading-relaxed">
              Descubra nossa coleção completa de peças elegantes e atemporais. 
              Cada item foi selecionado para elevar seu guarda-roupa com qualidade premium e design sofisticado.
            </p>
          </div>
        </div>
      </div>

      {/* Botões das Seções - Otimizados para Mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-6">
          {/* Botão TODOS */}
          <button 
            onClick={() => selectCategory('all')}
            className={`px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-light tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg text-center rounded-2xl ${
              selectedCategory === 'all' 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl' 
                : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
            }`}
          >
            Todos
          </button>

          {/* Botão CASACOS */}
          <button 
            onClick={() => selectCategory('casacos')}
            className={`px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-light tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg text-center rounded-2xl ${
              selectedCategory === 'casacos' 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl' 
                : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
            }`}
          >
            Casacos
          </button>

          {/* Botão CONJUNTOS */}
          <button 
            onClick={() => selectCategory('conjuntos')}
            className={`px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-light tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg text-center rounded-2xl ${
              selectedCategory === 'conjuntos' 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl' 
                : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
            }`}
          >
            Conjuntos
          </button>

          {/* Botão COLETES */}
          <button 
            onClick={() => selectCategory('coletes')}
            className={`px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-light tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg text-center rounded-2xl ${
              selectedCategory === 'coletes' 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl' 
                : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
            }`}
          >
            Coletes
          </button>

          {/* Botão ACESSÓRIOS */}
          <button 
            onClick={() => selectCategory('acessorios')}
            className={`px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-light tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg text-center rounded-2xl ${
              selectedCategory === 'acessorios' 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl' 
                : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
            }`}
          >
            Acessórios
          </button>

          {/* Botão CALÇADOS */}
          <button 
            onClick={() => selectCategory('calcados')}
            className={`px-4 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-light tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg text-center rounded-2xl ${
              selectedCategory === 'calcados' 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl' 
                : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300'
            }`}
          >
            Calçados
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-12 pb-10 sm:pb-16">
        {/* Contador de produtos */}
        <div className="text-center mb-8">
          <p className="text-lg text-slate-600">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` em ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          </p>
        </div>

        {/* Grid de produtos dinâmico */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <Link href={`/produto/${product.slug}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wide">
                        <div>SAVE</div>
                        <div>50%</div>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 text-center">{product.name}</h3>
                  <div className="flex items-center gap-3 mb-3 justify-center">
                    <span className="text-lg font-semibold text-gray-900">{formatEUR(product.price)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatEUR(product.compare_at_price)}</span>
                  </div>
                  <Link
                    href={`/produto/${product.slug}`}
                    className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-center block"
                  >
                    Ver Produto
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há produtos */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Nenhum produto encontrado</h3>
            <p className="text-slate-600 mb-6">Tente selecionar outra categoria ou voltar para ver todos os produtos.</p>
            <button 
              onClick={() => selectCategory('all')}
              className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:from-slate-900 hover:to-black transition-all duration-300"
            >
              Ver Todos os Produtos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


