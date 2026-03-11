import type { QuoteStatus } from '@/types/common';
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOTS } from '@/types/common';

interface StatusBadgeProps {
  readonly status: QuoteStatus;
}

export function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const label = STATUS_LABELS[status];
  const colorClasses = STATUS_COLORS[status];
  const dotClass = STATUS_DOTS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ease-out ${colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
