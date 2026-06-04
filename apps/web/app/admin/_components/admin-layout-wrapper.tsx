'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './toast-context';
import { ToastContainer } from './toast-container';

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
