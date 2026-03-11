'use client';

import { Calendar, Palette, Play, Eye, CheckCircle2, Ruler, Layers } from 'lucide-react';
import { useClientStore } from '@/stores/useClientStore';
import { formatDateShort, getDaysUntil, getDeadlineUrgency, cn } from '@/lib/utils';
import type { Quote } from '@/types/quote';

interface ArtJobCardProps {
  readonly quote: Quote;
  readonly onAction?: () => void;
}

const URGENCY_STYLES: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'text-red-600 bg-red-50',
  urgent: 'text-amber-600 bg-amber-50',
  normal: 'text-gray-500 bg-gray-50',
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

export function ArtJobCard({ quote, onAction }: ArtJobCardProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);
  const client = clients.find((c) => c.id === quote.clientId);
  const urgency = getDeadlineUrgency(quote.deadline);
  const daysLeft = getDaysUntil(quote.deadline);
  const variant = getCardVariant(quote);

  const deadlineLabel =
    daysLeft < 0
      ? `${Math.abs(daysLeft)}d atrasado`
      : daysLeft === 0
        ? 'Hoje'
        : `${daysLeft}d restantes`;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:border-slate-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {client?.name ?? 'Cliente não encontrado'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{quote.service}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
            URGENCY_STYLES[urgency],
          )}
        >
          <Calendar className="h-3 w-3" />
          {deadlineLabel}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Layers className="h-3.5 w-3.5 text-gray-400" />
          <span className="truncate">{quote.material}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Ruler className="h-3.5 w-3.5 text-gray-400" />
          <span className="truncate">{quote.size}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span>Entrega: {formatDateShort(quote.deadline)}</span>
        </div>
      </div>

      {/* Action */}
      {variant === 'available' && (
        <button
          type="button"
          onClick={onAction}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
        >
          <Play className="h-4 w-4" />
          Iniciar
        </button>
      )}

      {variant === 'in_progress' && (
        <button
          type="button"
          onClick={onAction}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 ease-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          Ver Detalhes
        </button>
      )}

      {variant === 'completed' && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Arte Aprovada
          </span>
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 ease-out hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <Palette className="h-3.5 w-3.5" />
            Enviar para Produção
          </button>
        </div>
      )}
    </div>
  );
}
