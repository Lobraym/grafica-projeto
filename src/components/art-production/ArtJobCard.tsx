'use client';

import { Calendar, Palette, Play, Eye, CheckCircle2, Ruler, Layers } from 'lucide-react';
import { useClientStore } from '@/stores/useClientStore';
import { formatDateShort, getDaysUntil, getDeadlineUrgency, isValidDateString, cn } from '@/lib/utils';
import { getQuoteSizeLabel } from '@/lib/quote-utils';
import { useTheme } from '@/context/ThemeContext';
import type { Quote } from '@/types/quote';

interface ArtJobCardProps {
  readonly quote: Quote;
  readonly onAction?: () => void;
  readonly onDetails?: () => void;
}

const URGENCY_STYLES_LIGHT: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'text-red-600 bg-red-50',
  urgent: 'text-amber-600 bg-amber-50',
  normal: 'text-gray-500 bg-gray-50',
} as const;

const URGENCY_STYLES_DARK: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'text-red-200 bg-red-500/10',
  urgent: 'text-amber-200 bg-amber-500/10',
  normal: 'text-text-muted bg-card-bg-secondary',
} as const;

function getCardVariant(quote: Quote): 'available' | 'in_progress' | 'completed' {
  if (quote.clientApproval?.approved === true && quote.status === 'em_producao') {
    return 'completed';
  }
  if (quote.artChecklist.colorsCorrect || quote.artChecklist.sizeCorrect) {
    return 'in_progress';
  }
  return 'available';
}

export function ArtJobCard({ quote, onAction, onDetails }: ArtJobCardProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);
  const client = clients.find((c) => c.id === quote.clientId);
  const urgency = getDeadlineUrgency(quote.deadline);
  const hasDeadline = isValidDateString(quote.deadline);
  const daysLeft = getDaysUntil(quote.deadline);
  const variant = getCardVariant(quote);
  const sizeLabel = getQuoteSizeLabel(quote);
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';
  const urgencyStyles = isBlueTheme ? URGENCY_STYLES_DARK : URGENCY_STYLES_LIGHT;

  const deadlineLabel = !hasDeadline
    ? 'Apos aprovacao'
    : daysLeft < 0
      ? `${Math.abs(daysLeft)}d atrasado`
      : daysLeft === 0
        ? 'Hoje'
        : `${daysLeft}d restantes`;

  return (
    <div
      className={cn(
        'group rounded-xl border p-4 shadow-sm transition-all duration-200 ease-out hover:shadow-md cursor-pointer',
        isBlueTheme ? 'bg-card-bg border-border hover:border-primary/40' : 'bg-white border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold truncate', isBlueTheme ? 'text-text-primary' : 'text-gray-900')}>
            {client?.name ?? 'Cliente não encontrado'}
          </p>
          <p className={cn('text-xs mt-0.5 truncate', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>
            {quote.service}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
            hasDeadline ? urgencyStyles[urgency] : isBlueTheme ? 'text-text-muted bg-card-bg-secondary' : 'text-gray-500 bg-gray-50',
          )}
        >
          <Calendar className="h-3 w-3" />
          {deadlineLabel}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={cn('flex items-center gap-1.5 text-xs', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>
          <Layers className={cn('h-3.5 w-3.5', isBlueTheme ? 'text-text-muted' : 'text-gray-400')} />
          <span className="truncate">{quote.material}</span>
        </div>
        <div className={cn('flex items-center gap-1.5 text-xs', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>
          <Ruler className={cn('h-3.5 w-3.5', isBlueTheme ? 'text-text-muted' : 'text-gray-400')} />
          <span className="truncate">{sizeLabel || '-'}</span>
        </div>
        <div className={cn('flex items-center gap-1.5 text-xs col-span-2', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>
          <Calendar className={cn('h-3.5 w-3.5', isBlueTheme ? 'text-text-muted' : 'text-gray-400')} />
          <span>{hasDeadline ? `Prazo: ${formatDateShort(quote.deadline)}` : 'Prazo inicia apos a aprovacao'}</span>
        </div>
      </div>

      {/* Action */}
      {variant === 'available' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDetails}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
              isBlueTheme
                ? 'border-border bg-card-bg text-text-primary hover:bg-card-bg-secondary focus:ring-primary/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-cyan-500/20'
            )}
          >
            <Eye className="h-4 w-4" />
            Detalhes
          </button>
          <button
            type="button"
            onClick={onAction}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
              isBlueTheme
                ? 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/20'
                : 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500/20'
            )}
          >
            <Play className="h-4 w-4" />
            Iniciar
          </button>
        </div>
      )}

      {variant === 'in_progress' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDetails}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
              isBlueTheme
                ? 'border-border bg-card-bg text-text-primary hover:bg-card-bg-secondary focus:ring-primary/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-cyan-500/20'
            )}
          >
            <Eye className="h-4 w-4" />
            Detalhes
          </button>
          <button
            type="button"
            onClick={onAction}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
              isBlueTheme
                ? 'border border-border bg-card-bg text-text-primary hover:bg-card-bg-secondary focus:ring-primary/20'
                : 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500/20'
            )}
          >
            <Palette className="h-4 w-4" />
            Checklist
          </button>
        </div>
      )}

      {variant === 'completed' && (
        <div className="space-y-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              isBlueTheme ? 'bg-accent/10 text-accent' : 'bg-emerald-50 text-emerald-700'
            )}
          >
            <CheckCircle2 className={cn('h-3.5 w-3.5', isBlueTheme ? 'text-accent' : 'text-emerald-700')} />
            Arte Aprovada
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDetails}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
                isBlueTheme
                  ? 'border-border bg-card-bg text-text-primary hover:bg-card-bg-secondary focus:ring-primary/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-cyan-500/20'
              )}
            >
              <Eye className="h-4 w-4" />
              Detalhes
            </button>
            <button
              type="button"
              onClick={onAction}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
                isBlueTheme
                  ? 'bg-accent text-white hover:bg-accent-hover focus:ring-accent/20'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/20'
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              Enviar para Produção
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
