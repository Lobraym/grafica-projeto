'use client';

import { useState, useMemo } from 'react';
import { Package, CheckCircle2, Truck, Calendar, Layers, Ruler } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { cn, formatDateShort } from '@/lib/utils';
import { getQuoteSizeLabel } from '@/lib/quote-utils';
import { useTheme } from '@/context/ThemeContext';

export default function ProntosPage(): React.ReactElement {
  const quotes = useQuoteStore((s) => s.quotes);
  const markAsDelivered = useQuoteStore((s) => s.markAsDelivered);
  const clients = useClientStore((s) => s.clients);
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';

  // js-index-maps: Map O(1) para lookups de cliente
  const clientById = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );

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
          const client = clientById.get(quote.clientId);
          const sizeLabel = getQuoteSizeLabel(quote);

          return (
            <div
              key={quote.id}
              className={cn(
                'rounded-xl border p-5 shadow-sm transition-shadow duration-200 ease-out hover:shadow-md',
                isBlueTheme ? 'bg-card-bg border-border' : 'bg-white border-emerald-200'
              )}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                    isBlueTheme ? 'bg-accent/10 text-accent' : 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  <CheckCircle2
                    className={cn('h-3.5 w-3.5', isBlueTheme ? 'text-accent' : 'text-emerald-700')}
                  />
                  Produção Finalizada
                </span>
                <span className={cn('inline-flex items-center gap-1 text-xs', isBlueTheme ? 'text-text-muted' : 'text-gray-400')}>
                  <Calendar className="h-3 w-3" />
                  {formatDateShort(quote.deadline)}
                </span>
              </div>

              {/* Client & Service Info */}
              <div className="mb-4">
                <h3 className={cn('text-sm font-semibold truncate', isBlueTheme ? 'text-text-primary' : 'text-gray-900')}>
                  {client?.name ?? 'Cliente'}
                </h3>
                <p className={cn('text-xs mt-0.5 truncate', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>
                  {quote.service}
                </p>
              </div>

              {/* Details */}
              <div className={cn('flex items-center gap-3 mb-5 text-xs', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>
                <span className="inline-flex items-center gap-1">
                  <Layers className={cn('h-3 w-3', isBlueTheme ? 'text-text-muted' : 'text-gray-400')} />
                  {quote.material}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Ruler className={cn('h-3 w-3', isBlueTheme ? 'text-text-muted' : 'text-gray-400')} />
                  {sizeLabel || '-'}
                </span>
              </div>

              {/* Actions */}
              <div className={cn('flex items-center gap-2 border-t pt-4', isBlueTheme ? 'border-border' : 'border-gray-100')}>
                <NotificationButton
                  clientName={client?.name ?? 'Cliente'}
                  service={quote.service}
                  onNotify={handleNotify}
                />

                <button
                  type="button"
                  onClick={() => setConfirmDeliverId(quote.id)}
                  className={cn(
                    'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out focus:outline-none focus:ring-2 cursor-pointer',
                    isBlueTheme
                      ? 'bg-accent hover:bg-accent-hover focus:ring-accent/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20'
                  )}
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
