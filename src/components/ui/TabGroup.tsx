'use client';

interface Tab {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
}

interface TabGroupProps {
  readonly tabs: readonly Tab[];
  readonly activeTab: string;
  readonly onTabChange: (id: string) => void;
}

export function TabGroup({
  tabs,
  activeTab,
  onTabChange,
}: TabGroupProps): React.ReactElement {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex gap-6" aria-label="Abas">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={`relative cursor-pointer inline-flex items-center gap-2 whitespace-nowrap pb-3 text-sm transition-colors duration-200 ease-out
                ${
                  isActive
                    ? 'text-cyan-600 font-medium'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.label}

              {tab.count !== undefined && (
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium transition-colors duration-200 ease-out
                    ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {tab.count}
                </span>
              )}

              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-cyan-600" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
