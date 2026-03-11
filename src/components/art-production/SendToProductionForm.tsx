'use client';

import { useState, useCallback } from 'react';
import { X, Send, FileText } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileUpload } from '@/components/ui/FileUpload';
import { generateId } from '@/lib/utils';
import type { FileAttachment } from '@/types/common';

interface SendToProductionFormProps {
  readonly quoteId: string;
  readonly onClose: () => void;
}

export function SendToProductionForm({ quoteId, onClose }: SendToProductionFormProps): React.ReactElement {
  const sendToFinalProduction = useQuoteStore((state) => state.sendToFinalProduction);

  const [artFile, setArtFile] = useState<FileAttachment | null>(null);
  const [productionNotes, setProductionNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid = artFile !== null;

  const handleFileSelect = useCallback((file: { name: string; url: string }): void => {
    setArtFile({
      id: generateId(),
      name: file.name,
      url: file.url,
      type: 'application/pdf',
    });
  }, []);

  const handleSubmit = (): void => {
    if (!isValid) return;
    setShowConfirm(true);
  };

  const handleConfirm = (): void => {
    if (!artFile) return;
    sendToFinalProduction(quoteId, artFile, productionNotes.trim());
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
              <h3 className="text-base font-semibold text-gray-900">Enviar para Produção Final</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Anexe o arquivo final e adicione instruções de produção
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
          <div className="space-y-5 px-6 py-5">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo Final (PDF)
              </label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Arraste o PDF final ou clique para selecionar"
              />
            </div>

            {/* Production Notes */}
            <div>
              <label htmlFor="productionNotes" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <FileText className="h-4 w-4 text-gray-400" />
                Instruções de Produção
              </label>
              <textarea
                id="productionNotes"
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
                placeholder={"Imprimir em lona brilho\nTamanho 2m x 1m\nUsar ilhós nas pontas"}
                rows={5}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                Informações importantes para a equipe de produção
              </p>
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
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Enviar para Produção
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Confirmar envio para produção"
        message="Tem certeza que deseja enviar este trabalho para a produção? Depois de enviado, não será possível alterar a arte."
        confirmLabel="Confirmar Envio"
        variant="primary"
      />
    </>
  );
}
