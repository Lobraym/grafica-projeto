'use client';

import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, Package } from 'lucide-react';
import type { Quote } from '@/types/quote';
import { useClientStore } from '@/stores/useClientStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QuoteActions } from './QuoteActions';
import { formatCurrency, formatDate, getDaysUntil, getDeadlineUrgency, cn } from '@/lib/utils';

interface QuoteCardProps {
  readonly quote: Quote;
}

const URGENCY_BORDER: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'border-l-red-500',
  urgent: 'border-l-amber-400',
  normal: 'border-l-emerald-400',
} as const;

const URGENCY_TEXT: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'text-red-600',
  urgent: 'text-orange-600',
  normal: 'text-gray-500',
} as const;

function getDeadlineLabel(deadline: string): string {
  const days = getDaysUntil(deadline);
  if (days < 0) return `${Math.abs(days)} dia(s) atrasado`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Vence amanha';
  return `${days} dias restantes`;
}

export function QuoteCard({ quote }: QuoteCardProps): React.ReactElement {
  const router = useRouter();
  const clients = useClientStore((state) => state.clients);
  const client = clients.find((c) => c.id === quote.clientId);
  const urgency = getDeadlineUrgency(quote.deadline);

  const handleClick = (): void => {
    router.push(`/orcamentos/${quote.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={cn(
        'group relative bg-white rounded-xl border border-slate-200 border-l-4 p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:border-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400',
        URGENCY_BORDER[urgency]
      )}
    >
      {/* Header: Client name + Status + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors duration-200 ease-out">
              {client?.name ?? 'Cliente desconhecido'}
            </h3>
            <StatusBadge status={quote.status} />
          </div>

          <p className="mt-1 truncate text-xs text-gray-500">
            {quote.service}
            {quote.material ? ` - ${quote.material}` : ''}
          </p>
        </div>

        {/* Stop propagation so clicking actions doesn't navigate */}
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <QuoteActions quote={quote} />
        </div>
      </div>

      {/* Details row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        {/* Deadline */}
        <span className={cn('inline-flex items-center gap-1.5 font-medium', URGENCY_TEXT[urgency])}>
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(quote.deadline)}
          <span className="font-normal">({getDeadlineLabel(quote.deadline)})</span>
        </span>

        {/* Value */}
        <span className="inline-flex items-center gap-1.5 text-gray-600">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="font-semibold text-gray-900">{formatCurrency(quote.value)}</span>
        </span>

        {/* Size */}
        {quote.size && (
          <span className="inline-flex items-center gap-1.5 text-gray-500">
            <Package className="h-3.5 w-3.5" />
            {quote.size}
          </span>
        )}
      </div>

      {/* Production flags */}
      {(quote.requiresPrinting || quote.requiresAssembly) && (
        <div className="mt-3 flex gap-2">
          {quote.requiresPrinting && (
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-600/10">
              Impressao
            </span>
          )}
          {quote.requiresAssembly && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
              Montagem
            </span>
          )}
        </div>
      )}
    </div>
  );
}
