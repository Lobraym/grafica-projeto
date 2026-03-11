'use client';

import Link from 'next/link';
import { Calendar, Printer, Wrench } from 'lucide-react';
import type { Quote } from '@/types/quote';
import type { QuoteStatus } from '@/types/common';
import { useClientStore } from '@/stores/useClientStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, getDaysUntil, getDeadlineUrgency, cn } from '@/lib/utils';

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
  if (days < 0) return `${Math.abs(days)} dias atrasado`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Amanha';
  return `${days} dias restantes`;
}

export function QuoteListRow({ quote }: QuoteListRowProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);
  const client = clients.find((c) => c.id === quote.clientId);
  const clientName = client?.name ?? 'Cliente desconhecido';

  const days = getDaysUntil(quote.deadline);
  const urgency = getDeadlineUrgency(quote.deadline);
  const deadlineLabel = getDeadlineLabel(days);

  return (
    <Link
      href={`/orcamentos/${quote.id}`}
      className={cn(
        'flex items-center gap-4 px-5 py-4',
        'bg-white border-b border-slate-100 last:border-b-0',
        'hover:bg-slate-50/80 transition-colors duration-200 ease-out',
        'cursor-pointer'
      )}
    >
      {/* Barra lateral colorida por status */}
      <div
        className={cn(
          'h-10 w-[3px] rounded-full shrink-0',
          STATUS_BAR_COLORS[quote.status]
        )}
      />

      {/* Coluna 1: Cliente + Tracking ID */}
      <div className="min-w-0 flex-1 max-w-[200px]">
        <p className="truncate text-sm font-semibold text-gray-900">
          {clientName}
        </p>
        <p className="truncate text-xs text-gray-400 font-mono">
          {quote.trackingId}
        </p>
      </div>

      {/* Coluna 2: Servico + Material */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-gray-700">
          {quote.service}
        </p>
        <p className="truncate text-xs text-gray-500">
          {quote.material}
        </p>
      </div>

      {/* Coluna 3: Status Badge */}
      <div className="w-[120px] shrink-0">
        <StatusBadge status={quote.status} />
      </div>

      {/* Coluna 4: Valor */}
      <div className="w-[140px] shrink-0 text-right">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(quote.value)}
        </p>
      </div>

      {/* Coluna 5: Prazo + Urgencia */}
      <div className="w-[140px] shrink-0 text-right">
        <p className="text-sm text-gray-700 flex items-center justify-end gap-1">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {formatDate(quote.deadline)}
        </p>
        <p className={cn('text-xs font-medium', URGENCY_TEXT[urgency])}>
          {deadlineLabel}
        </p>
      </div>

      {/* Coluna 6: Tags de producao */}
      <div className="shrink-0 flex gap-1.5">
        {quote.requiresPrinting && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
            <Printer className="h-2.5 w-2.5" />
            Impressao
          </span>
        )}
        {quote.requiresAssembly && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
            <Wrench className="h-2.5 w-2.5" />
            Montagem
          </span>
        )}
      </div>
    </Link>
  );
}
