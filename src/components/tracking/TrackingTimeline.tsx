import { CheckCircle2, Circle, Clock, Palette, Eye, Printer, Package, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuoteStatus } from '@/types/common';

interface TrackingTimelineProps {
  readonly status: QuoteStatus;
}

interface TimelineStep {
  readonly key: QuoteStatus;
  readonly label: string;
  readonly description: string;
  readonly icon: React.ReactNode;
}

const STEPS: readonly TimelineStep[] = [
  {
    key: 'pendente',
    label: 'Pendente',
    description: 'Orçamento recebido e sendo avaliado',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    key: 'producao_arte',
    label: 'Produção de Arte',
    description: 'A arte está sendo criada pela equipe de design',
    icon: <Palette className="h-5 w-5" />,
  },
  {
    key: 'aguardando_aprovacao',
    label: 'Aguardando Aprovação',
    description: 'A arte foi enviada para sua aprovação',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    key: 'em_producao',
    label: 'Em Produção',
    description: 'Seu pedido está sendo produzido',
    icon: <Printer className="h-5 w-5" />,
  },
  {
    key: 'pronto',
    label: 'Pronto',
    description: 'Pedido finalizado e aguardando retirada',
    icon: <Package className="h-5 w-5" />,
  },
  {
    key: 'entregue',
    label: 'Entregue',
    description: 'Pedido entregue com sucesso',
    icon: <Truck className="h-5 w-5" />,
  },
] as const;

const STATUS_ORDER: Record<QuoteStatus, number> = {
  pendente: 0,
  producao_arte: 1,
  aguardando_aprovacao: 2,
  em_producao: 3,
  pronto: 4,
  entregue: 5,
} as const;

export function TrackingTimeline({ status }: TrackingTimelineProps): React.ReactElement {
  const currentIndex = STATUS_ORDER[status];

  return (
    <div className="relative">
      <ol className="space-y-0">
        {STEPS.map((step, index) => {
          const stepIndex = STATUS_ORDER[step.key];
          const isPast = stepIndex < currentIndex;
          const isCurrent = stepIndex === currentIndex;
          const isFuture = stepIndex > currentIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <li key={step.key} className="relative flex gap-4">
              {/* Vertical Line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-5 top-11 w-0.5 h-full -ml-px',
                    isPast ? 'bg-emerald-400' : isCurrent ? 'bg-cyan-300' : 'bg-slate-200',
                  )}
                />
              )}

              {/* Icon Circle */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                  isPast && 'border-emerald-500 bg-emerald-500 text-white',
                  isCurrent && 'border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 ring-4 ring-cyan-100',
                  isFuture && 'border-slate-200 bg-white text-gray-300',
                )}
              >
                {isPast ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
              </div>

              {/* Content */}
              <div className={cn('pb-8 pt-1', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isPast && 'text-emerald-700',
                    isCurrent && 'text-cyan-700',
                    isFuture && 'text-gray-400',
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    'text-xs mt-0.5',
                    isPast && 'text-emerald-600/70',
                    isCurrent && 'text-cyan-600/70',
                    isFuture && 'text-gray-400',
                  )}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
