"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar-open");
      if (stored !== null) {
        setIsOpen(stored === "true");
      }
    } catch {
      // localStorage might be unavailable in some environments
    }
  }, []);

  const toggle = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem("sidebar-open", String(newState));
      } catch {
        // localStorage might be unavailable
      }
      return newState;
    });
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
