'use client';

import { useState, useCallback } from 'react';
import { X, Send, FileText, Layers, Ruler, Printer, Wrench, MapPin, Trash2 } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileUpload } from '@/components/ui/FileUpload';
import { generateId } from '@/lib/utils';
import { getQuoteSizeLabel } from '@/lib/quote-utils';
import type { FileAttachment } from '@/types/common';

interface SendToProductionFormProps {
  readonly quoteId: string;
  readonly onClose: () => void;
}

export function SendToProductionForm({ quoteId, onClose }: SendToProductionFormProps): React.ReactElement {
  const sendToFinalProduction = useQuoteStore((state) => state.sendToFinalProduction);
  const quote = useQuoteStore((state) => state.getQuoteById(quoteId));

  const [artFiles, setArtFiles] = useState<FileAttachment[]>([]);
  const [productionNotes, setProductionNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid = artFiles.length > 0;
  const sizeLabel = quote ? getQuoteSizeLabel(quote) : '';

  const handleFileSelect = useCallback((file: { name: string; url: string; type?: string }): void => {
    setArtFiles((current) => [
      ...current,
      {
        id: generateId(),
        name: file.name,
        url: file.url,
        type: file.type ?? 'application/pdf',
      },
    ]);
  }, []);

  const handleRemoveFile = (fileId: string): void => {
    setArtFiles((current) => current.filter((file) => file.id !== fileId));
  };

  const handleSubmit = (): void => {
    if (!isValid) return;
    setShowConfirm(true);
  };

  const handleConfirm = (): void => {
    if (artFiles.length === 0) return;
    sendToFinalProduction(quoteId, artFiles, productionNotes.trim());
    setShowConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-2xl bg-white shadow-xl fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Enviar para Produção Final</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Anexe o arquivo final e adicione instruções de produção
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-100 hover:text-gray-600 transition-colors duration-200 ease-out cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 space-y-5 overflow-y-auto px-6 py-5">
            {quote && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
                  Resumo do Orcamento
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Servico
                    </p>
                    <p className="mt-2 text-sm text-slate-900">{quote.service}</p>
                  </div>

                  <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Material
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-900">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      {quote.material}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200 sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Medidas
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-900">
                      <Ruler className="h-3.5 w-3.5 text-slate-400" />
                      {sizeLabel || '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Etapas
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quote.requiresPrinting && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-700">
                        <Printer className="h-3 w-3" />
                        Impressao
                      </span>
                    )}
                    {quote.requiresAssembly && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                        <Wrench className="h-3 w-3" />
                        Montagem
                      </span>
                    )}
                    {quote.requiresInstallation && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                        <MapPin className="h-3 w-3" />
                        Instalacao
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Arquivos Finais
              </label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Arraste os arquivos finais ou clique para selecionar"
                multiple
              />
              {artFiles.length > 0 && (
                <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
                  {artFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-800">{file.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 ease-out hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        aria-label={`Remover ${file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Production Notes */}
            <div>
              <label htmlFor="productionNotes" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <FileText className="h-4 w-4 text-gray-400" />
                Instruções de Produção
              </label>
              <textarea
                id="productionNotes"
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
                placeholder={"Imprimir em lona brilho\nMedidas: 2 m L x 1 m A\nUsar ilhós nas pontas"}
                rows={5}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-200 ease-out resize-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                Informações importantes para a equipe de produção
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
