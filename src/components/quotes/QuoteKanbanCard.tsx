'use client';

import Link from 'next/link';
import { Calendar, ArrowRight, Printer, Wrench } from 'lucide-react';
import type { Quote } from '@/types/quote';
import type { QuoteStatus } from '@/types/common';
import { useClientStore } from '@/stores/useClientStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, getDaysUntil, getDeadlineUrgency, isValidDateString, cn } from '@/lib/utils';
import { getQuoteSizeLabel, hasQuoteInstallation } from '@/lib/quote-utils';

interface QuoteKanbanCardProps {
  readonly quote: Quote;
}

const STATUS_BORDER: Record<QuoteStatus, string> = {
  pendente: 'border-l-sky-500',
  producao_arte: 'border-l-amber-500',
  aguardando_aprovacao: 'border-l-orange-500',
  em_producao: 'border-l-cyan-500',
  pronto: 'border-l-emerald-500',
  entregue: 'border-l-slate-400',
} as const;

const URGENCY_TEXT: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'text-red-600',
  urgent: 'text-orange-600',
  normal: 'text-gray-500',
} as const;

function getDeadlineLabel(deadline: string): string {
  if (!isValidDateString(deadline)) return 'Apos aprovacao';
  const days = getDaysUntil(deadline);
  if (days < 0) return `(${Math.abs(days)} dias atrasado)`;
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanha';
  return `(Em ${days} dias)`;
}

export function QuoteKanbanCard({ quote }: QuoteKanbanCardProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);
  const client = clients.find((c) => c.id === quote.clientId);
  const urgency = getDeadlineUrgency(quote.deadline);
  const hasDeadline = isValidDateString(quote.deadline);
  const sizeLabel = getQuoteSizeLabel(quote);
  const hasInstallation = hasQuoteInstallation(quote);

  return (
    <Link
      href={`/orcamentos/${quote.id}`}
      className={cn(
        'group block bg-white rounded-xl border border-slate-200 border-l-[3px] p-5 shadow-sm cursor-pointer',
        'transition-shadow duration-200 ease-out hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-cyan-500/20',
        STATUS_BORDER[quote.status]
      )}
    >
      {/* Row 1: Status badge + Value */}
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={quote.status} />
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(quote.value)}
        </span>
      </div>

      {/* Row 2: Client name + Tracking ID */}
      <div className="mt-3">
        <p className="text-base font-semibold text-gray-900 truncate">
          {client?.name ?? 'Cliente desconhecido'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          #{quote.trackingId}
        </p>
      </div>

      {/* Section: Servico */}
      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">
          Servico
        </p>
        <p className="text-sm text-gray-800 font-medium truncate">
          {quote.service}
        </p>
        {(quote.material || sizeLabel) && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {[quote.material, sizeLabel].filter(Boolean).join(' - ')}
          </p>
        )}
      </div>

      {/* Section: Prazo de Producao */}
      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">
          Prazo de Producao
        </p>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm text-gray-700">
            {hasDeadline ? formatDate(quote.deadline) : 'Aguardando aprovacao'}
          </span>
          <span className={cn('text-xs font-medium', hasDeadline ? URGENCY_TEXT[urgency] : 'text-gray-500')}>
            {getDeadlineLabel(quote.deadline)}
          </span>
        </div>
      </div>

      {/* Bottom: Production tags + Detalhes link */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex gap-2">
          {quote.requiresPrinting && (
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-600/10">
              <Printer className="h-3 w-3" />
              Impressao
            </span>
          )}
          {quote.requiresAssembly && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
              <Wrench className="h-3 w-3" />
              Montagem
            </span>
          )}
          {hasInstallation && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
              Instalacao
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 group-hover:text-cyan-700 transition-colors duration-200 ease-out">
          Detalhes
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
