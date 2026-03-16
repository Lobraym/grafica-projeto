'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Backdrop } from '@/components/layout/Backdrop';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageTransition } from '@/components/layout/PageTransition';
import { useSidebar } from '@/context/SidebarContext';

export function AppShell({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
      ? 'lg:ml-[290px]'
      : 'lg:ml-[90px]';

  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
