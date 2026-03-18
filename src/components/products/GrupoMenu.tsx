'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GrupoMenuProps {
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

export function GrupoMenu({ onEdit, onDelete }: GrupoMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeMenu]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-label="Menu do grupo"
        aria-expanded={isOpen}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-card-bg-secondary hover:text-text-primary transition-colors duration-200 ease-out cursor-pointer'
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card-bg py-1.5 shadow-lg animate-in fade-in slide-in-from-top-1"
          role="menu"
        >
          <button
            type="button"
            onClick={() => {
              closeMenu();
              onEdit();
            }}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-card-bg-secondary rounded-lg cursor-pointer transition-colors duration-200 ease-out"
          >
            <Pencil className="h-4 w-4 text-text-muted" />
            Editar grupo
          </button>
          <div className="mx-3 my-1.5 border-t border-border" />
          <button
            type="button"
            onClick={() => {
              closeMenu();
              onDelete();
            }}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-red-50 hover:text-red-600 rounded-lg cursor-pointer transition-colors duration-200 ease-out"
          >
            <Trash2 className="h-4 w-4 text-text-muted" />
            Excluir grupo
          </button>
        </div>
      )}
    </div>
  );
}

