interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  children,
}: PageHeaderProps): React.ReactElement {
  return (
    <div className="border-b border-border pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-foreground/50">{subtitle}</p>
          )}
        </div>

        {children && (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}
