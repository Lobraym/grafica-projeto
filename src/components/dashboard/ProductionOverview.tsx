'use client';

import { Printer, Wrench, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PipelineStage } from '@/hooks/useDashboardData';

interface ProductionOverviewProps {
  readonly data: {
    readonly printing: PipelineStage;
    readonly assembly: PipelineStage;
    readonly installation: PipelineStage;
  };
}

interface StageCardProps {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly stage: PipelineStage;
}

function StageCard({ icon: Icon, label, stage }: StageCardProps): React.ReactElement {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold text-text-primary">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Disponível
            </span>
          </div>
          <span className="text-lg font-bold text-cyan-500 tabular-nums">
            {stage.available}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider text-center">
              Em Andamento
            </span>
          </div>
          <span className="text-lg font-bold text-amber-500 tabular-nums">
            {stage.inProgress}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Concluído
            </span>
          </div>
          <span className="text-lg font-bold text-emerald-500 tabular-nums">
            {stage.done}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProductionOverview({ data }: ProductionOverviewProps): React.ReactElement {
  return (
    <div className="bg-card-bg rounded-2xl p-6 shadow-sm border border-border flex flex-col h-full">
      <h3 className="text-sm font-semibold text-text-primary tracking-wide uppercase mb-6">
        Produção
      </h3>
      <div className="flex flex-col gap-4 flex-1">
        <StageCard icon={Printer} label="Impressão" stage={data.printing} />
        <StageCard icon={Wrench} label="Montagem" stage={data.assembly} />
        <StageCard icon={MapPin} label="Instalação" stage={data.installation} />
      </div>
    </div>
  );
}
