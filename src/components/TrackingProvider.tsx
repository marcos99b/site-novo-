'use client';

import { useEffect } from 'react';
import { initAutoTracking, getTracker } from '@/lib/tracking';
import { useAuth } from '@/contexts/AuthContext';

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    // Inicializar tracking automático
    initAutoTracking();

    // Configurar ID do usuário quando fizer login
    if (user) {
      const tracker = getTracker();
      tracker.setUserId(user.id);
    }
  }, [user]);

  return <>{children}</>;
}
