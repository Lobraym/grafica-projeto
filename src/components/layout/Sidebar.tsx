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
        className="fixed top-4 left-4 z-50 rounded-lg bg-sidebar-bg p-2.5 text-sidebar-text cursor-pointer lg:hidden transition-colors duration-200 ease-out hover:text-sidebar-active"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-200 ease-out"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-sidebar-bg
          transition-transform duration-200 ease-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer transition-opacity duration-200 ease-out hover:opacity-80"
            onClick={closeMobile}
          >
            <Printer className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-sidebar-active">
              Grafica
            </span>
            <span className="text-lg font-bold tracking-tight text-primary">
              Pro
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-sidebar-text cursor-pointer transition-colors duration-200 ease-out hover:text-sidebar-active hover:bg-white/5 lg:hidden"
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
                      cursor-pointer transition-all duration-200 ease-out
                      ${
                        isActive
                          ? 'bg-white/10 text-sidebar-active border-l-2 border-cyan-400'
                          : 'text-sidebar-text hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
                      }
                    `}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ease-out ${
                        isActive
                          ? 'text-cyan-400'
                          : 'text-sidebar-text group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-700/50 px-6 py-4">
          <p className="text-xs font-medium text-slate-500 tracking-wide">
            Sistema de Gestao
          </p>
          <span className="mt-1 inline-block rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-500 tracking-wider">
            v1.0.0
          </span>
        </div>
      </aside>
    </>
  );
}
