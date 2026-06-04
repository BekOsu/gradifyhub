'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATIONS: Record<Toast['type'], number> = {
  success: 3500,
  error: 6000,
  info: 4500,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);

    const duration = TOAST_DURATIONS[type];
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}