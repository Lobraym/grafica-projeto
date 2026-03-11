'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly variant?: 'danger' | 'primary';
}

const CONFIRM_BUTTON_STYLES: Record<'danger' | 'primary', string> = {
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20',
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20',
} as const;

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'primary',
}: ConfirmDialogProps): React.ReactElement | null {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          {variant === 'danger' && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          )}

          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-base font-semibold text-gray-900"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${CONFIRM_BUTTON_STYLES[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
