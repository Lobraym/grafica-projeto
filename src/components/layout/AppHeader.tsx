'use client';

import { Menu, PanelLeftClose, Search, Sun, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';

export function AppHeader(): React.ReactElement {
  const { isExpanded, toggleSidebar, setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const handleToggle = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen(true);
    } else {
      toggleSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card-bg px-4 sm:px-6">
      {/* Left — Toggle sidebar */}
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="relative flex items-center justify-center text-text-secondary transition-colors bg-card-bg border border-border rounded-full hover:text-text-primary h-11 w-11 hover:bg-background cursor-pointer"
        aria-label={isExpanded ? 'Recolher menu lateral' : 'Abrir menu lateral'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <motion.div
              key="collapse"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="expand"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Center — Search */}
      <div className="hidden sm:flex flex-1 max-w-md mx-auto px-4">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar…"
            readOnly
            tabIndex={-1}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-16 text-sm text-text-primary placeholder:text-text-muted cursor-pointer transition-colors focus:border-primary focus:ring-3 focus:ring-primary/10 focus:outline-none"
            aria-label="Buscar"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex items-center gap-0.5 rounded-md border border-border bg-card-bg px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right — Theme toggle + Avatar */}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="relative flex items-center justify-center text-text-secondary transition-colors bg-card-bg border border-border rounded-full hover:text-text-primary h-11 w-11 hover:bg-background cursor-pointer overflow-hidden"
          aria-label="Alternar tema"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'light' ? (
              <motion.div
                key="sun"
                initial={{ y: 20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="h-5 w-5" aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.div
                key="palette"
                initial={{ y: 20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Palette className="h-5 w-5 text-cyan-400" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-sm font-bold select-none cursor-pointer"
          title="GraficaPro Admin"
          aria-label="Avatar do usuário"
          role="img"
        >
          GP
        </motion.div>
      </div>
    </header>
  );
}
