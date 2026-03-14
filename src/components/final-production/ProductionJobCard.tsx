'use client';

import { Play, CheckCircle2, Loader2, Layers, Ruler, MapPin, Calendar, Eye } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils';
import { getQuoteInstallationDate, getQuoteInstallationLabel, getQuoteSizeLabel } from '@/lib/quote-utils';
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
        'rounded-lg border bg-white p-3.5 transition-all duration-200 ease-out',
        onSelect && 'cursor-pointer',
        isConcluida
          ? 'border-emerald-200 bg-emerald-50/30'
          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300',
        selected && 'border-cyan-400 ring-2 ring-cyan-100',
      )}
    >
      {/* Client & Service */}
      <div className="mb-2.5">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {client?.name ?? 'Cliente'}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{quote.service}</p>
      </div>

      {/* Details */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Layers className="h-3 w-3 text-gray-400" />
          {quote.material}
        </span>
        <span className="inline-flex items-center gap-1">
          <Ruler className="h-3 w-3 text-gray-400" />
          {sizeLabel || '-'}
        </span>
      </div>

      {type === 'instalacao' && (
        <div className="mb-3 space-y-2 rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{installationLabel || 'Endereço não informado'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{scheduledInstallationDate ? formatDateShort(scheduledInstallationDate) : 'Aguardando agendamento'}</span>
          </div>
        </div>
      )}

      {/* Action */}
      {isConcluida ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Concluída</span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDetails?.();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 ease-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
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
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 ease-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
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
