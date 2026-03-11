'use client';

import { useState } from 'react';
import { X, Send, ImageIcon } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ArtReviewFormProps {
  readonly quoteId: string;
  readonly onClose: () => void;
}

export function ArtReviewForm({ quoteId, onClose }: ArtReviewFormProps): React.ReactElement {
  const sendForClientReview = useQuoteStore((state) => state.sendForClientReview);

  const [artImageUrl, setArtImageUrl] = useState('');
  const [designerMessage, setDesignerMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid = artImageUrl.trim().length > 0 && designerMessage.trim().length > 0;

  const handleSubmit = (): void => {
    if (!isValid) return;
    setShowConfirm(true);
  };

  const handleConfirm = (): void => {
    sendForClientReview(quoteId, artImageUrl.trim(), designerMessage.trim());
    setShowConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-lg animate-in fade-in zoom-in-95 rounded-xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Enviar para Revisão do Cliente</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                O cliente receberá o link de acompanhamento com a arte para aprovar
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 px-6 py-5">
            {/* Art Image URL */}
            <div>
              <label htmlFor="artImageUrl" className="block text-sm font-medium text-gray-700 mb-1.5">
                URL da imagem da arte
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="artImageUrl"
                  type="text"
                  value={artImageUrl}
                  onChange={(e) => setArtImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/arte-final.png"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                />
              </div>
            </div>

            {/* Designer Message */}
            <div>
              <label htmlFor="designerMessage" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mensagem para o cliente
              </label>
              <textarea
                id="designerMessage"
                value={designerMessage}
                onChange={(e) => setDesignerMessage(e.target.value)}
                placeholder="Segue a arte para sua aprovação. Foram utilizadas as cores conforme solicitado..."
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Enviar para Revisão
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Enviar arte para revisão"
        message="Tem certeza que deseja enviar a arte para o cliente revisar? O cliente poderá aprovar ou reprovar pelo link de acompanhamento."
        confirmLabel="Enviar"
        variant="primary"
      />
    </>
  );
}
