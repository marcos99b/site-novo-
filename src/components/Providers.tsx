'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import TrackingProvider from './TrackingProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = 'supabase_autorun_applied';
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV === 'production') return; // evita rodar autorun em produção
    if (sessionStorage.getItem(key)) return;
    fetch('/api/supabase/autorun', { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        try { sessionStorage.setItem(key, '1'); } catch {}
      });
  }, []);

  return (
    <AuthProvider>
      <TrackingProvider>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </TrackingProvider>
    </AuthProvider>
  );
}
