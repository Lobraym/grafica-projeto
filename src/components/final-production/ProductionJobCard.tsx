'use client';

import { Play, CheckCircle2, Loader2, Layers, Ruler } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { cn } from '@/lib/utils';
import type { Quote } from '@/types/quote';
import type { ProductionStage } from '@/types/common';

interface ProductionJobCardProps {
  readonly quote: Quote;
  readonly type: 'impressao' | 'montagem';
  readonly stage: ProductionStage;
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

export function ProductionJobCard({ quote, type, stage }: ProductionJobCardProps): React.ReactElement {
  const updatePrintingStage = useQuoteStore((s) => s.updatePrintingStage);
  const updateAssemblyStage = useQuoteStore((s) => s.updateAssemblyStage);
  const clients = useClientStore((s) => s.clients);

  const client = clients.find((c) => c.id === quote.clientId);
  const updateStage = type === 'impressao' ? updatePrintingStage : updateAssemblyStage;

  const handleAction = (): void => {
    if (stage === 'disponivel') {
      updateStage(quote.id, 'em_andamento');
    } else if (stage === 'em_andamento') {
      updateStage(quote.id, 'concluida');
    }
  };

  const isConcluida = stage === 'concluida';

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-3.5 transition-all duration-200 ease-out',
        isConcluida
          ? 'border-emerald-200 bg-emerald-50/30'
          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300',
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
          {quote.size}
        </span>
      </div>

      {/* Action */}
      {isConcluida ? (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-medium">Concluída</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAction}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-out focus:outline-none focus:ring-2 cursor-pointer',
            STAGE_BUTTON_CONFIG[stage as 'disponivel' | 'em_andamento'].className,
          )}
        >
          {STAGE_BUTTON_CONFIG[stage as 'disponivel' | 'em_andamento'].icon}
          {STAGE_BUTTON_CONFIG[stage as 'disponivel' | 'em_andamento'].label}
        </button>
      )}
    </div>
  );
}
