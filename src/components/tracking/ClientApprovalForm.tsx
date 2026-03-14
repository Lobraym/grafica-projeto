'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ImageIcon, MessageCircle } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Quote } from '@/types/quote';

interface ClientApprovalFormProps {
  readonly quote: Quote;
}

export function ClientApprovalForm({ quote }: ClientApprovalFormProps): React.ReactElement {
  const clientApproveAction = useQuoteStore((s) => s.clientApprove);
  const clientRejectAction = useQuoteStore((s) => s.clientReject);

  const [observations, setObservations] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  const approval = quote.clientApproval;

  // Already responded
  if (approval?.approved !== null) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        {approval?.approved ? (
          <div className="space-y-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="text-lg font-semibold text-emerald-700">Arte Aprovada</h3>
            <p className="text-sm text-gray-500">Obrigado! O prazo de produção foi iniciado e a equipe seguirá com o pedido.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-red-700">Arte Reprovada</h3>
            <p className="text-sm text-gray-500">A equipe de design fará as alterações solicitadas.</p>
          </div>
        )}
      </div>
    );
  }

  const handleConfirm = (): void => {
    if (confirmAction === 'approve') {
      clientApproveAction(quote.id, observations.trim());
    } else if (confirmAction === 'reject') {
      clientRejectAction(quote.id, observations.trim());
    }
    setConfirmAction(null);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Art Preview */}
        {approval?.artImageUrl && (
          <div className="border-b border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Arte para Aprovação</h4>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={approval.artImageUrl}
                alt="Arte para aprovação"
                className="w-full max-h-96 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden items-center justify-center h-48 text-gray-400 text-sm">
                Não foi possível carregar a imagem
              </div>
            </div>
          </div>
        )}

        {/* Designer Message */}
        {approval?.designerMessage && (
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-start gap-2.5">
              <MessageCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Mensagem do Designer</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {approval.designerMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approval Form */}
        <div className="p-5 space-y-4">
          <div>
            <label
              htmlFor="client-observations"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Observações (opcional)
            </label>
            <textarea
              id="client-observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Escreva suas observações ou solicitações de alteração..."
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-200 ease-out resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmAction('reject')}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
              Reprovar
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction('approve')}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" />
              Aprovar
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === 'approve'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title="Aprovar arte"
        message="Tem certeza que deseja aprovar esta arte? Após a aprovação, o pedido será enviado para produção."
        confirmLabel="Aprovar"
        variant="primary"
      />

      <ConfirmDialog
        open={confirmAction === 'reject'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title="Reprovar arte"
        message="Tem certeza que deseja reprovar esta arte? A equipe de design receberá suas observações e fará as alterações."
        confirmLabel="Reprovar"
        variant="danger"
      />
    </>
  );
}
