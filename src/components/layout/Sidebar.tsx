'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';
import { MENU_ITEMS } from '@/lib/constants';

const EXPANDED = 290;
const COLLAPSED = 90;

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setHovered, setMobileOpen } = useSidebar();

  const showFull = isExpanded || isHovered || isMobileOpen;
  const sidebarWidth = showFull ? EXPANDED : COLLAPSED;

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={`
          fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0
          bg-sidebar-bg text-white h-screen z-50
          border-r border-white/[0.06] overflow-hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        onMouseEnter={() => !isExpanded && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Logo */}
        <div className={`py-8 flex ${!showFull ? 'lg:justify-center' : 'justify-start'}`}>
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <motion.div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Printer className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            </motion.div>
            {/* Simple conditional — no AnimatePresence, parent overflow clips it */}
            {showFull && (
              <span className="flex items-baseline whitespace-nowrap">
                <span className="text-[17px] font-bold tracking-tight text-white">Grafica</span>
                <span className="text-[17px] font-bold tracking-tight text-cyan-400">Pro</span>
              </span>
            )}
          </Link>
        </div>

        {/* Scrollable nav */}
        <div className="flex flex-col overflow-y-auto overflow-x-hidden duration-300 ease-linear">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                {/* Section header — dots when collapsed, text when expanded */}
                <h2
                  className={`mb-4 text-xs uppercase flex leading-5 text-slate-500 ${
                    !showFull ? 'lg:justify-center' : 'justify-start'
                  }`}
                >
                  {showFull ? 'Menu' : '•••'}
                </h2>

                <ul className="flex flex-col gap-1">
                  {MENU_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`
                            group relative flex items-center w-full gap-3 px-3 py-2.5
                            font-medium rounded-lg text-[13px] cursor-pointer transition-colors
                            ${!showFull ? 'lg:justify-center' : 'lg:justify-start'}
                            ${
                              active
                                ? 'bg-cyan-500/[0.12] text-cyan-400'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }
                          `}
                        >
                          {/* Active indicator — spring layout animation */}
                          {active && (
                            <motion.div
                              layoutId="sidebar-active-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400"
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                          )}

                          <span
                            className={`shrink-0 ${
                              active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                          </span>

                          {/* Label — simple conditional, NO AnimatePresence */}
                          {showFull && (
                            <span className="whitespace-nowrap">{item.label}</span>
                          )}

                          {/* Tooltip when collapsed */}
                          {!showFull && (
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-[60]">
                              {item.label}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>

          {/* Bottom widget */}
          {showFull && (
            <div className="border-t border-white/[0.06] pt-4 pb-2">
              <p className="text-[10px] font-medium text-slate-500 tracking-wider">Sistema de Gestão</p>
              <span className="mt-1.5 inline-flex items-center rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 tracking-wider">
                v1.0.0
              </span>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
