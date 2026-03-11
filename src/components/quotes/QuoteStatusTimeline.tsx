import type { QuoteStatus } from '@/types/common';
import { STATUS_LABELS } from '@/types/common';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuoteStatusTimelineProps {
  readonly status: QuoteStatus;
}

const TIMELINE_STEPS: readonly QuoteStatus[] = [
  'pendente',
  'producao_arte',
  'aguardando_aprovacao',
  'em_producao',
  'pronto',
  'entregue',
] as const;

export function QuoteStatusTimeline({ status }: QuoteStatusTimelineProps): React.ReactElement {
  const currentIndex = TIMELINE_STEPS.indexOf(status);

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center">
        {TIMELINE_STEPS.map((step, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step dot + label */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                    isPast && 'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent && 'border-cyan-600 bg-cyan-600 text-white ring-4 ring-cyan-100 animate-pulse',
                    isFuture && 'border-slate-200 bg-white text-gray-400'
                  )}
                >
                  {isPast ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium text-center max-w-[90px] leading-tight',
                    isPast && 'text-emerald-600',
                    isCurrent && 'text-cyan-600',
                    isFuture && 'text-gray-400'
                  )}
                >
                  {STATUS_LABELS[step]}
                </span>
              </div>

              {/* Connecting line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      'h-0.5 w-full rounded-full',
                      index < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-0 sm:hidden">
        {TIMELINE_STEPS.map((step, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step} className="flex items-stretch gap-3">
              {/* Dot + Line column */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    isPast && 'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent && 'border-cyan-600 bg-cyan-600 text-white ring-4 ring-cyan-100 animate-pulse',
                    isFuture && 'border-slate-200 bg-white text-gray-400'
                  )}
                >
                  {isPast ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[20px]',
                      index < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pb-4">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isPast && 'text-emerald-600',
                    isCurrent && 'text-cyan-600',
                    isFuture && 'text-gray-400'
                  )}
                >
                  {STATUS_LABELS[step]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
