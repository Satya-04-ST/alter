'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
