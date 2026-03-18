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
  normal: 'text-text-muted',
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
        'group block bg-card-bg rounded-xl border border-border border-l-[3px] p-5 shadow-sm cursor-pointer',
        'transition-shadow duration-200 ease-out hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        STATUS_BORDER[quote.status]
      )}
    >
      {/* Row 1: Status badge + Value */}
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={quote.status} />
        <span className="text-sm font-bold text-text-primary">
          {formatCurrency(quote.value)}
        </span>
      </div>

      {/* Row 2: Client name + Tracking ID */}
      <div className="mt-3">
        <p className="text-base font-semibold text-text-primary truncate">
          {client?.name ?? 'Cliente desconhecido'}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          #{quote.trackingId}
        </p>
      </div>

      {/* Section: Servico */}
      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted mb-1">
          Servico
        </p>
        <p className="text-sm text-text-secondary font-medium truncate">
          {quote.service}
        </p>
        {(quote.material || sizeLabel) && (
          <p className="text-xs text-text-muted mt-0.5 truncate">
            {[quote.material, sizeLabel].filter(Boolean).join(' - ')}
          </p>
        )}
      </div>

      {/* Section: Prazo de Producao */}
      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted mb-1">
          Prazo de Producao
        </p>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-sm text-text-secondary">
            {hasDeadline ? formatDate(quote.deadline) : 'Aguardando aprovacao'}
          </span>
          <span className={cn('text-xs font-medium', hasDeadline ? URGENCY_TEXT[urgency] : 'text-text-muted')}>
            {getDeadlineLabel(quote.deadline)}
          </span>
        </div>
      </div>

      {/* Bottom: Production tags + Detalhes link */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
        <div className="flex gap-2">
          {quote.requiresPrinting && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
              <Printer className="h-3 w-3" aria-hidden="true" />
              Impressao
            </span>
          )}
          {quote.requiresAssembly && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
              <Wrench className="h-3 w-3" aria-hidden="true" />
              Montagem
            </span>
          )}
          {hasInstallation && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
              Instalacao
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:text-primary-hover transition-colors duration-200 ease-out">
          Detalhes
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
