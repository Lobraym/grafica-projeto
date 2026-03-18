'use client';

import { Play, CheckCircle2, Loader2, Layers, Ruler, MapPin, Calendar, Eye } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils';
import { getQuoteInstallationDate, getQuoteInstallationLabel, getQuoteSizeLabel } from '@/lib/quote-utils';
import { useTheme } from '@/context/ThemeContext';
import type { Quote } from '@/types/quote';
import type { ProductionStage } from '@/types/common';

interface ProductionJobCardProps {
  readonly quote: Quote;
  readonly type: 'impressao' | 'montagem' | 'instalacao';
  readonly stage: ProductionStage;
  readonly onDetails?: () => void;
  readonly selected?: boolean;
  readonly onSelect?: () => void;
}

const STAGE_BUTTON_CONFIG: Record<
  'disponivel' | 'em_andamento',
  { label: string; icon: React.ReactNode; className: string }
> = {
  disponivel: {
    label: 'Iniciar',
    icon: <Play className="h-4 w-4" />,
    className: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500/20',
  },
  em_andamento: {
    label: 'Finalizar',
    icon: <Loader2 className="h-4 w-4" />,
    className: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500/20',
  },
} as const;

export function ProductionJobCard({
  quote,
  type,
  stage,
  onDetails,
  selected = false,
  onSelect,
}: ProductionJobCardProps): React.ReactElement {
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';

  const updatePrintingStage = useQuoteStore((s) => s.updatePrintingStage);
  const updateAssemblyStage = useQuoteStore((s) => s.updateAssemblyStage);
  const updateInstallationStage = useQuoteStore((s) => s.updateInstallationStage);
  const clients = useClientStore((s) => s.clients);

  const client = clients.find((c) => c.id === quote.clientId);
  const updateStage =
    type === 'impressao'
      ? updatePrintingStage
      : type === 'montagem'
        ? updateAssemblyStage
        : updateInstallationStage;

  const handleAction = (): void => {
    if (stage === 'disponivel') {
      updateStage(quote.id, 'em_andamento');
    } else if (stage === 'em_andamento') {
      updateStage(quote.id, 'concluida');
    }
  };

  const isConcluida = stage === 'concluida';
  const sizeLabel = getQuoteSizeLabel(quote);
  const installationLabel = getQuoteInstallationLabel(quote);
  const scheduledInstallationDate = getQuoteInstallationDate(quote);

  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-lg border p-3.5 transition-all duration-200 ease-out',
        onSelect && 'cursor-pointer',
        isConcluida
          ? isBlueTheme
            ? 'bg-accent/10 border-accent/40'
            : 'border-emerald-200 bg-emerald-50/30'
          : isBlueTheme
            ? 'bg-card-bg border-border shadow-sm hover:shadow-md hover:border-primary/40'
            : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 bg-white',
        selected && (isBlueTheme ? 'border-primary/60 ring-2 ring-primary/20' : 'border-cyan-400 ring-2 ring-cyan-100')
      )}
    >
      {/* Client & Service */}
      <div className="mb-2.5">
        <p className={cn('text-sm font-semibold truncate', isBlueTheme ? 'text-text-primary' : 'text-gray-900')}>
          {client?.name ?? 'Cliente'}
        </p>
        <p className={cn('text-xs mt-0.5 truncate', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>{quote.service}</p>
      </div>

      {/* Details */}
      <div className={cn('flex items-center gap-3 mb-3 text-xs', isBlueTheme ? 'text-text-muted' : 'text-gray-500')}>
        <span className="inline-flex items-center gap-1">
          <Layers className={cn('h-3 w-3', isBlueTheme ? 'text-text-muted' : 'text-gray-400')} />
          {quote.material}
        </span>
        <span className="inline-flex items-center gap-1">
          <Ruler className={cn('h-3 w-3', isBlueTheme ? 'text-text-muted' : 'text-gray-400')} />
          {sizeLabel || '-'}
        </span>
      </div>

      {type === 'instalacao' && (
        <div
          className={cn(
            'mb-3 space-y-2 rounded-lg border p-2.5 text-xs',
            isBlueTheme ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200' : 'border-emerald-100 bg-emerald-50/60 text-emerald-900'
          )}
        >
          <div className="flex items-center gap-1.5">
            <MapPin className={cn('h-3.5 w-3.5 shrink-0', isBlueTheme ? 'text-emerald-200' : '')} />
            <span className="truncate">{installationLabel || 'Endereço não informado'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className={cn('h-3.5 w-3.5 shrink-0', isBlueTheme ? 'text-emerald-200' : '')} />
            <span>{scheduledInstallationDate ? formatDateShort(scheduledInstallationDate) : 'Aguardando agendamento'}</span>
          </div>
        </div>
      )}

      {/* Action */}
      {isConcluida ? (
        <div className="space-y-3">
          <div className={cn('flex items-center gap-1.5', isBlueTheme ? 'text-accent' : 'text-emerald-700')}>
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">{isBlueTheme ? 'Concluída' : 'Concluída'}</span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDetails?.();
            }}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
              isBlueTheme
                ? 'border-border bg-card-bg text-text-primary hover:bg-card-bg-secondary focus:ring-primary/20'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-cyan-500/20'
            )}
          >
            <Eye className="h-4 w-4" />
            Detalhes
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDetails?.();
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2',
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
            onClick={(event) => {
              event.stopPropagation();
              handleAction();
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out focus:outline-none focus:ring-2 cursor-pointer',
              STAGE_BUTTON_CONFIG[stage as 'disponivel' | 'em_andamento'].className,
            )}
          >
            {STAGE_BUTTON_CONFIG[stage as 'disponivel' | 'em_andamento'].icon}
            {STAGE_BUTTON_CONFIG[stage as 'disponivel' | 'em_andamento'].label}
          </button>
        </div>
      )}
    </div>
  );
}
