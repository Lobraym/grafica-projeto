import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly icon?: LucideIcon;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
    </div>
  );
}
