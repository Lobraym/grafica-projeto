'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { TabGroup } from '@/components/ui/TabGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import type { QuoteStatus } from '@/types/common';
import { STATUS_LABELS } from '@/types/common';

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
    // Base: sorted by deadline (urgentes primeiro) ou todos
    const base =
      activeTab === ALL_TAB
        ? [...quotes].sort(
            (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
        : quotes
            .filter((q) => q.status === activeTab)
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    // Filtro de busca
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
      <PageHeader title="Orcamentos" subtitle="Gerencie os orcamentos da grafica">
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 transition-colors duration-200 ease-out cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novo Orcamento
        </Link>
      </PageHeader>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por cliente, servico, material..."
          />
        </div>

        <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Lista de orcamentos */}
      {filteredQuotes.length > 0 ? (
        <div className="grid gap-3">
          {filteredQuotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhum orcamento encontrado"
          description={
            search
              ? 'Tente ajustar os termos da busca ou limpar os filtros.'
              : 'Crie seu primeiro orcamento clicando no botao acima.'
          }
        />
      )}
    </div>
  );
}
