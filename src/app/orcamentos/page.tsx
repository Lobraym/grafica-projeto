'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, FileText, LayoutGrid, List } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { TabGroup } from '@/components/ui/TabGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuoteKanbanCard } from '@/components/quotes/QuoteKanbanCard';
import { QuoteListRow, QuoteListTable } from '@/components/quotes/QuoteListRow';
import type { QuoteStatus } from '@/types/common';
import { STATUS_LABELS } from '@/types/common';
import { cn, compareOptionalDates } from '@/lib/utils';

type ViewMode = 'kanban' | 'list';

const ALL_TAB = 'todos';

const STATUS_TABS: readonly QuoteStatus[] = [
  'pendente',
  'producao_arte',
  'aguardando_aprovacao',
  'em_producao',
  'pronto',
  'entregue',
] as const;

export default function OrcamentosPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  const quotes = useQuoteStore((state) => state.quotes);
  const clients = useClientStore((state) => state.clients);

  // js-index-maps: Map O(1) para lookups de cliente por ID
  const clientById = useMemo(
    () => new Map(clients.map((c) => [c.id, c])),
    [clients]
  );

  // js-combine-iterations: contagem em uma única iteração O(n)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_TAB]: quotes.length };
    for (const status of STATUS_TABS) counts[status] = 0;
    for (const q of quotes) {
      counts[q.status] = (counts[q.status] ?? 0) + 1;
    }
    return counts;
  }, [quotes]);

  // Tabs para o TabGroup
  const tabs = useMemo(
    () => [
      { id: ALL_TAB, label: 'Todos', count: statusCounts[ALL_TAB] },
      ...STATUS_TABS.map((status) => ({
        id: status,
        label: STATUS_LABELS[status],
        count: statusCounts[status],
      })),
    ],
    [statusCounts]
  );

  // Filtragem e ordenacao
  const filteredQuotes = useMemo(() => {
    const base =
      activeTab === ALL_TAB
        ? [...quotes].sort(
            (a, b) => compareOptionalDates(a.deadline, b.deadline)
          )
        : quotes
            .filter((q) => q.status === activeTab)
            .sort((a, b) => compareOptionalDates(a.deadline, b.deadline));

    if (!search.trim()) return base;

    const query = search.toLowerCase().trim();
    return base.filter((quote) => {
      const client = clientById.get(quote.clientId);
      return (
        quote.service.toLowerCase().includes(query) ||
        quote.material.toLowerCase().includes(query) ||
        quote.description.toLowerCase().includes(query) ||
        quote.trackingId.toLowerCase().includes(query) ||
        (client?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [quotes, activeTab, search, clientById]);

  return (
    <div className="space-y-6">
      <PageHeader title="Orçamentos" subtitle="Gerencie os orçamentos da gráfica">
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors duration-200 ease-out cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo Orçamento
        </Link>
      </PageHeader>

      {/* Filtros + View Toggle */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por cliente, serviço, material…"
          />

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card-bg p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium min-h-[44px] transition-colors duration-200 ease-out cursor-pointer',
                viewMode === 'kanban'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-card-bg-secondary'
              )}
              aria-label="Modo Kanban"
              aria-pressed={viewMode === 'kanban'}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium min-h-[44px] transition-colors duration-200 ease-out cursor-pointer',
                viewMode === 'list'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-card-bg-secondary'
              )}
              aria-label="Modo Lista"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>

        <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Mostrando <span className="font-semibold text-text-primary">{filteredQuotes.length}</span> de{' '}
          <span className="font-semibold text-text-primary">{quotes.length}</span> orçamentos
        </p>
      </div>

      {/* Conteudo */}
      {filteredQuotes.length > 0 ? (
        viewMode === 'kanban' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredQuotes.map((quote) => (
              <QuoteKanbanCard key={quote.id} quote={quote} />
            ))}
          </div>
        ) : (
          <QuoteListTable>
            {filteredQuotes.map((quote) => (
              <QuoteListRow key={quote.id} quote={quote} />
            ))}
          </QuoteListTable>
        )
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento encontrado"
          description={
            search
              ? 'Tente ajustar os termos da busca ou limpar os filtros.'
              : 'Crie seu primeiro orçamento clicando no botão acima.'
          }
        />
      )}
    </div>
  );
}
