'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Pencil, Link2, Play } from 'lucide-react';
import type { Quote } from '@/types/quote';
import { useQuoteStore } from '@/stores/useQuoteStore';

interface QuoteActionsProps {
  readonly quote: Quote;
  readonly onStartProduction?: () => void;
}

export function QuoteActions({ quote, onStartProduction }: QuoteActionsProps): React.ReactElement {
  const router = useRouter();
  const startArtProduction = useQuoteStore((state) => state.startArtProduction);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((): void => {
    setIsOpen(false);
  }, []);

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  const handleToggle = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleView = (): void => {
    router.push(`/orcamentos/${quote.id}`);
    closeMenu();
  };

  const handleEdit = (): void => {
    router.push(`/orcamentos/${quote.id}/editar`);
    closeMenu();
  };

  const handleCopyLink = async (): Promise<void> => {
    const trackingUrl = `${window.location.origin}/acompanhamento/${quote.trackingId}`;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = trackingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartProduction = (): void => {
    startArtProduction(quote.id);
    onStartProduction?.();
    closeMenu();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Acoes do orcamento"
        aria-expanded={isOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-slate-100 hover:text-gray-600 transition-colors duration-200 ease-out cursor-pointer"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1"
          role="menu"
        >
          <button
            type="button"
            onClick={handleView}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors duration-200 ease-out"
          >
            <Eye className="h-4 w-4 text-gray-400" />
            Visualizar
          </button>

          <button
            type="button"
            onClick={handleEdit}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors duration-200 ease-out"
          >
            <Pencil className="h-4 w-4 text-gray-400" />
            Editar
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors duration-200 ease-out"
          >
            <Link2 className="h-4 w-4 text-gray-400" />
            {copied ? (
              <span className="text-emerald-600 font-medium">Copiado!</span>
            ) : (
              'Copiar Link de Acompanhamento'
            )}
          </button>

          {quote.status === 'pendente' && (
            <>
              <div className="mx-3 my-1.5 border-t border-slate-200" />
              <button
                type="button"
                onClick={handleStartProduction}
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg cursor-pointer transition-colors duration-200 ease-out font-medium"
              >
                <Play className="h-4 w-4" />
                Iniciar Producao de Arte
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
