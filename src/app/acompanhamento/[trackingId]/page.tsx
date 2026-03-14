'use client';

import { use, useMemo } from 'react';
import { Printer, AlertCircle, ExternalLink } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { ClientApprovalForm } from '@/components/tracking/ClientApprovalForm';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatCurrency, isValidDateString } from '@/lib/utils';
import { getQuoteSizeLabel } from '@/lib/quote-utils';

interface AcompanhamentoPageProps {
  readonly params: Promise<{ trackingId: string }>;
}

export default function AcompanhamentoPage({ params }: AcompanhamentoPageProps): React.ReactElement {
  const { trackingId } = use(params);
  const quotes = useQuoteStore((s) => s.quotes);
  const clients = useClientStore((s) => s.clients);

  const quote = useMemo(
    () => quotes.find((q) => q.trackingId === trackingId),
    [quotes, trackingId],
  );
  const client = useMemo(
    () => (quote ? clients.find((c) => c.id === quote.clientId) : undefined),
    [clients, quote],
  );
  const sizeLabel = quote ? getQuoteSizeLabel(quote) : '';
  const hasDeadline = quote ? isValidDateString(quote.deadline) : false;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                GráficaPro
              </h1>
              <p className="text-xs text-gray-500">Acompanhamento do Pedido</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {!quote ? (
            /* Not Found */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Orçamento não encontrado
              </h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Não encontramos nenhum pedido com o código de rastreamento informado.
                Verifique se o link está correto e tente novamente.
              </p>
              <p className="mt-4 rounded-lg bg-gray-50 px-4 py-2 text-xs text-gray-400 font-mono">
                Código: {trackingId}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tracking ID Banner */}
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-cyan-500" />
                  <span className="text-xs text-cyan-600 font-medium">
                    Rastreamento:
                  </span>
                  <span className="text-xs text-cyan-800 font-mono font-semibold">
                    {quote.trackingId}
                  </span>
                </div>
                <StatusBadge status={quote.status} />
              </div>

              {/* Order Info Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalhes do Pedido
                </h2>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Cliente</p>
                    <p className="font-medium text-gray-900">{client?.name ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Serviço</p>
                    <p className="font-medium text-gray-900">{quote.service}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Material</p>
                    <p className="font-medium text-gray-900">{quote.material}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Tamanho</p>
                    <p className="font-medium text-gray-900">{sizeLabel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Prazo de producao</p>
                    <p className="font-medium text-gray-900">
                      {hasDeadline ? formatDate(quote.deadline) : 'Inicia apos a aprovacao da arte'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Valor</p>
                    <p className="font-medium text-gray-900">{formatCurrency(quote.value)}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Progresso do Pedido
                </h2>
                <TrackingTimeline status={quote.status} />
              </div>

              {/* Client Approval Section */}
              {quote.status === 'aguardando_aprovacao' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Aprovação da Arte
                  </h2>
                  <ClientApprovalForm quote={quote} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <p className="text-center text-xs text-gray-400">
            GráficaPro - Sistema de Gestão para Gráficas
          </p>
        </div>
      </footer>
    </div>
  );
}
