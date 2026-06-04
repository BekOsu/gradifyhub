"use client";

import { SidebarProvider } from "~/lib/sidebar/context";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
