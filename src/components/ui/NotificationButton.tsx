'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, MessageCircle, Mail } from 'lucide-react';

type NotificationMethod = 'whatsapp' | 'email';

interface NotificationButtonProps {
  readonly clientName: string;
  readonly service: string;
  readonly onNotify: (method: NotificationMethod) => void;
}

export function NotificationButton({
  clientName,
  service,
  onNotify,
}: NotificationButtonProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  const handleNotify = (method: NotificationMethod) => {
    onNotify(method);
    setIsOpen(false);
  };

  const previewMessage = `Olá ${clientName}, seu pedido "${service}" está pronto para retirada!`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        Notificar
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
          {/* Preview */}
          <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 leading-relaxed">
            {previewMessage}
          </p>

          <p className="mb-2 text-xs font-medium text-gray-500">
            Enviar via:
          </p>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleNotify('whatsapp')}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => handleNotify('email')}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              E-mail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
