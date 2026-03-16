'use client';

import Link from 'next/link';
import { Printer, Wrench } from 'lucide-react';
import type { Quote } from '@/types/quote';
import type { QuoteStatus } from '@/types/common';
import { useClientStore } from '@/stores/useClientStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, getDaysUntil, getDeadlineUrgency, isValidDateString, cn } from '@/lib/utils';

interface QuoteListRowProps {
  readonly quote: Quote;
}

const STATUS_BAR_COLORS: Record<QuoteStatus, string> = {
  pendente: 'bg-sky-500',
  producao_arte: 'bg-amber-500',
  aguardando_aprovacao: 'bg-orange-500',
  em_producao: 'bg-cyan-500',
  pronto: 'bg-emerald-500',
  entregue: 'bg-slate-400',
} as const;

const URGENCY_TEXT: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'text-red-600',
  urgent: 'text-orange-600',
  normal: 'text-gray-500',
} as const;

function getDeadlineLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d atrasado`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Amanhã';
  return `${days}d restantes`;
}

/**
 * Container da tabela de orçamentos com header fixo e scroll horizontal.
 */
export function QuoteListTable({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="w-[3px] py-3 pl-5 pr-0" aria-hidden="true" />
              <th className="py-3 pl-4 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Cliente
              </th>
              <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Serviço
              </th>
              <th className="py-3 px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-[130px]">
                Status
              </th>
              <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-[110px]">
                Valor
              </th>
              <th className="py-3 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-[130px]">
                Prazo
              </th>
              <th className="py-3 pl-3 pr-5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-[140px]">
                Produção
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QuoteListRow({ quote }: QuoteListRowProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);
  const client = clients.find((c) => c.id === quote.clientId);
  const clientName = client?.name ?? 'Cliente desconhecido';

  const hasDeadline = isValidDateString(quote.deadline);
  const days = getDaysUntil(quote.deadline);
  const urgency = getDeadlineUrgency(quote.deadline);
  const deadlineLabel = hasDeadline ? getDeadlineLabel(days) : 'Aguardando';

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors duration-200 ease-out">
      {/* Barra de status */}
      <td className="py-3.5 pl-5 pr-0">
        <div
          className={cn('h-10 w-[3px] rounded-full', STATUS_BAR_COLORS[quote.status])}
          aria-hidden="true"
        />
      </td>

      {/* Cliente */}
      <td className="py-3.5 pl-4 pr-3">
        <Link href={`/orcamentos/${quote.id}`} className="block min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors duration-200">
            {clientName}
          </p>
          <p className="truncate text-xs text-gray-400 font-mono mt-0.5">
            {quote.trackingId}
          </p>
        </Link>
      </td>

      {/* Serviço + Material */}
      <td className="py-3.5 px-3">
        <p className="truncate text-sm text-gray-700">{quote.service}</p>
        <p className="truncate text-xs text-gray-500 mt-0.5">{quote.material}</p>
      </td>

      {/* Status */}
      <td className="py-3.5 px-3">
        <StatusBadge status={quote.status} />
      </td>

      {/* Valor */}
      <td className="py-3.5 px-3 text-right">
        <p className="text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">
          {formatCurrency(quote.value)}
        </p>
      </td>

      {/* Prazo */}
      <td className="py-3.5 px-3 text-right">
        <p className="text-sm text-gray-700 tabular-nums whitespace-nowrap">
          {hasDeadline ? formatDate(quote.deadline) : '—'}
        </p>
        <p className={cn('text-xs font-medium mt-0.5 whitespace-nowrap', hasDeadline ? URGENCY_TEXT[urgency] : 'text-gray-500')}>
          {deadlineLabel}
        </p>
      </td>

      {/* Tags de produção */}
      <td className="py-3.5 pl-3 pr-5">
        <div className="flex items-center justify-end gap-1">
          {quote.requiresPrinting && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-600/10 whitespace-nowrap">
              <Printer className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              Imp.
            </span>
          )}
          {quote.requiresAssembly && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10 whitespace-nowrap">
              <Wrench className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              Mont.
            </span>
          )}
          {!quote.requiresPrinting && !quote.requiresAssembly && (
            <span className="text-xs text-gray-300">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
