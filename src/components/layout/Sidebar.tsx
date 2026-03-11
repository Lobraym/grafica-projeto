'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Printer, Menu, X } from 'lucide-react';
import { MENU_ITEMS } from '@/lib/constants';

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const closeMobile = (): void => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-sidebar-bg p-2 text-sidebar-text lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-bg
          transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={closeMobile}
          >
            <Printer className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight text-sidebar-active">
              GraficaPro
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-md p-1 text-sidebar-text hover:text-sidebar-active lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-colors duration-150
                      ${
                        isActive
                          ? 'bg-white/10 text-sidebar-active'
                          : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-active'
                      }
                    `}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 ${
                        isActive
                          ? 'text-primary'
                          : 'text-sidebar-text group-hover:text-sidebar-active'
                      }`}
                    />
                    <span>{item.label}</span>

                    {/* Active indicator */}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom version tag */}
        <div className="border-t border-white/5 px-6 py-4">
          <span className="text-xs text-sidebar-text/50">v1.0</span>
        </div>
      </aside>
    </>
  );
}
