'use client';

import { useState, useMemo } from 'react';
import { Package, CheckCircle2, Truck, Calendar, Layers, Ruler } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState, NotificationButton, ConfirmDialog } from '@/components/ui';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { formatDateShort } from '@/lib/utils';

export default function ProntosPage(): React.ReactElement {
  const quotes = useQuoteStore((s) => s.quotes);
  const markAsDelivered = useQuoteStore((s) => s.markAsDelivered);
  const clients = useClientStore((s) => s.clients);

  const readyQuotes = useMemo(
    () => quotes.filter((q) => q.status === 'pronto'),
    [quotes]
  );

  const [confirmDeliverId, setConfirmDeliverId] = useState<string | null>(null);

  const handleConfirmDelivery = (): void => {
    if (!confirmDeliverId) return;
    markAsDelivered(confirmDeliverId);
    setConfirmDeliverId(null);
  };

  const handleNotify = (method: 'whatsapp' | 'email'): void => {
    const label = method === 'whatsapp' ? 'WhatsApp' : 'E-mail';
    alert(`Notificação enviada via ${label}!`);
  };

  if (readyQuotes.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Orçamentos Prontos"
          subtitle="Pedidos finalizados aguardando retirada ou entrega"
        />
        <EmptyState
          title="Nenhum pedido pronto"
          description="Quando a produção de um pedido for finalizada, ele aparecerá aqui para entrega."
          icon={Package}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos Prontos"
        subtitle={`${readyQuotes.length} pedido${readyQuotes.length > 1 ? 's' : ''} pronto${readyQuotes.length > 1 ? 's' : ''} para entrega`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {readyQuotes.map((quote) => {
          const client = clients.find((c) => c.id === quote.clientId);

          return (
            <div
              key={quote.id}
              className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Produção Finalizada
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {formatDateShort(quote.deadline)}
                </span>
              </div>

              {/* Client & Service Info */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {client?.name ?? 'Cliente'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{quote.service}</p>
              </div>

              {/* Details */}
              <div className="flex items-center gap-3 mb-5 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3 w-3 text-gray-400" />
                  {quote.material}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-gray-400" />
                  {quote.size}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                <NotificationButton
                  clientName={client?.name ?? 'Cliente'}
                  service={quote.service}
                  onNotify={handleNotify}
                />

                <button
                  type="button"
                  onClick={() => setConfirmDeliverId(quote.id)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <Truck className="h-4 w-4" />
                  Marcar como Entregue
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirmDeliverId !== null}
        onClose={() => setConfirmDeliverId(null)}
        onConfirm={handleConfirmDelivery}
        title="Confirmar entrega"
        message="Tem certeza que deseja marcar este pedido como entregue? Esta ação não pode ser desfeita."
        confirmLabel="Confirmar Entrega"
        variant="primary"
      />
    </div>
  );
}
