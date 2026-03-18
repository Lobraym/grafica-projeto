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
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">
          Últimos Orçamentos
        </h3>
      </div>

      {quotes.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-6">
          Nenhum orçamento encontrado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-400 font-mono">
                    {quote.trackingId}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                    {clientMap.get(quote.clientId) ?? 'Cliente removido'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[160px]">
                    {quote.service}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-medium tabular-nums">
                    {formatCurrency(quote.value)}
                  </td>
                  <td className="px-6 py-4">
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
