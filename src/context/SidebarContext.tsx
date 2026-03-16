'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from '@/types/layout';

interface SidebarContextValue {
  readonly isExpanded: boolean;
  readonly isMobileOpen: boolean;
  readonly isHovered: boolean;
  readonly sidebarWidth: number;
  readonly toggleSidebar: () => void;
  readonly setMobileOpen: (open: boolean) => void;
  readonly setHovered: (hovered: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const setMobileOpen = useCallback((open: boolean) => {
    setIsMobileOpen(open);
  }, []);

  const setHovered = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
  }, []);

  const sidebarWidth = isExpanded || isHovered ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const value = useMemo<SidebarContextValue>(
    () => ({ isExpanded, isMobileOpen, isHovered, sidebarWidth, toggleSidebar, setMobileOpen, setHovered }),
    [isExpanded, isMobileOpen, isHovered, sidebarWidth, toggleSidebar, setMobileOpen, setHovered],
  );

  return <SidebarContext value={value}>{children}</SidebarContext>;
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
