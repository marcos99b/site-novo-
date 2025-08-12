'use client';

import { useState } from 'react';

interface CategoryFilterProps {
  categories: Array<{ id: number; name: string; slug: string }>;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-12 flex gap-4 flex-wrap justify-center">
      <button 
        onClick={() => onCategoryChange(null)}
        className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 transform hover:scale-105 ${
          activeCategory === null
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/50'
            : 'bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 text-white hover:border-white/40 hover:shadow-lg hover:shadow-purple-500/25'
        }`}
      >
        Todos
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 transform hover:scale-105 ${
            activeCategory === category.slug
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/50'
              : 'bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 text-white hover:border-white/40 hover:shadow-lg hover:shadow-purple-500/25'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
