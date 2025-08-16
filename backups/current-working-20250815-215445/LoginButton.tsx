'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function LoginButton() {
  const { user, signOut, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="nav-icon-3d nav-icon-3d--square animate-pulse">
        <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
      </div>
    );
  }

  if (user) {
    const supabaseUser = user as User;
    const metadata = supabaseUser.user_metadata;
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="nav-icon-3d nav-icon-3d--square"
        >
          {metadata?.avatar_url ? (
            <img
              src={metadata.avatar_url}
              alt={metadata?.full_name || supabaseUser.email}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {(metadata?.full_name || supabaseUser.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/10">
                {metadata?.avatar_url ? (
                  <img
                    src={metadata.avatar_url}
                    alt={metadata?.full_name || supabaseUser.email}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {(metadata?.full_name || supabaseUser.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {metadata?.full_name || 'Usuário'}
                  </p>
                  <p className="text-gray-400 text-sm truncate">{supabaseUser.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <Link
                  href="/perfil"
                  className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Meu Perfil</span>
                </Link>

                <Link
                  href="/enderecos"
                  className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4" />
                  </svg>
                  <span>Endereços</span>
                </Link>

                <Link
                  href="/pedidos"
                  className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Meus Pedidos</span>
                </Link>

                {/* Favoritos removido por decisão de produto */}

                <Link
                  href="/pagamentos"
                  className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m4 0h1M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                  <span>Pagamentos</span>
                </Link>

                <div className="border-t border-white/10 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="nav-icon-3d nav-icon-3d--square"
    >
      <svg className="w-6 h-6 nav-icon-3d__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </Link>
  );
}
