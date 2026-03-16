'use client';

import { useMemo } from 'react';
import { useClientStore } from '@/stores/useClientStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/utils';
import type { Quote } from '@/types/quote';

interface RecentQuotesTableProps {
  readonly quotes: readonly Quote[];
}

export function RecentQuotesTable({ quotes }: RecentQuotesTableProps): React.ReactElement {
  const clients = useClientStore((s) => s.clients);

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  return (
    <div className="bg-card-bg rounded-xl border border-border p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        Últimos Orçamentos
      </h3>

      {quotes.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-6">
          Nenhum orçamento encontrado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Tracking
                </th>
                <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Cliente
                </th>
                <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Serviço
                </th>
                <th className="pb-3 pr-4 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                  Valor
                </th>
                <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((quote) => (
                <tr key={quote.id} className="group">
                  <td className="py-3 pr-4 font-mono text-xs text-text-muted">
                    {quote.trackingId}
                  </td>
                  <td className="py-3 pr-4 text-text-primary">
                    {clientMap.get(quote.clientId) ?? 'Cliente removido'}
                  </td>
                  <td className="py-3 pr-4 text-text-primary truncate max-w-[160px]">
                    {quote.service}
                  </td>
                  <td className="py-3 pr-4 text-right text-text-primary font-medium tabular-nums">
                    {formatCurrency(quote.value)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={quote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
