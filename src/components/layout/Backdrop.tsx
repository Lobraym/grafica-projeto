'use client';

import { useSidebar } from '@/context/SidebarContext';

export function Backdrop(): React.ReactElement | null {
  const { isMobileOpen, setMobileOpen } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 lg:hidden"
      onClick={() => setMobileOpen(false)}
      aria-hidden="true"
    />
  );
}
