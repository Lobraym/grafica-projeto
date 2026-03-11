interface KanbanColumnProps {
  readonly title: string;
  readonly count: number;
  readonly color: string;
  readonly children: React.ReactNode;
}

export function KanbanColumn({
  title,
  count,
  color,
  children,
}: KanbanColumnProps): React.ReactElement {
  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl bg-gray-50/80 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-700">
          {count}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3 scrollbar-thin">
        {children}
      </div>
    </div>
  );
}
