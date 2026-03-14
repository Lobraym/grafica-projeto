'use client';

import { useMemo, useState } from 'react';
import { KanbanColumn } from '@/components/ui/KanbanColumn';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductionJobCard } from './ProductionJobCard';
import { ArtQuoteDetailsModal } from '@/components/art-production/ArtQuoteDetailsModal';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { Printer, Wrench, MapPin } from 'lucide-react';
import type { ProductionStage } from '@/types/common';

interface ProductionKanbanProps {
  readonly type: 'impressao' | 'montagem' | 'instalacao';
  readonly selectedQuoteId?: string | null;
  readonly onSelectQuote?: (quoteId: string) => void;
}

const COLUMNS: ReadonlyArray<{
  readonly stage: ProductionStage;
  readonly title: string;
  readonly color: string;
}> = [
  { stage: 'disponivel', title: 'Disponíveis', color: 'bg-blue-500' },
  { stage: 'em_andamento', title: 'Em Andamento', color: 'bg-amber-500' },
  { stage: 'concluida', title: 'Concluídas', color: 'bg-emerald-500' },
] as const;

export function ProductionKanban({
  type,
  selectedQuoteId,
  onSelectQuote,
}: ProductionKanbanProps): React.ReactElement {
  const quotes = useQuoteStore((s) => s.quotes);
  const [detailsQuoteId, setDetailsQuoteId] = useState<string | null>(null);
  const detailsQuote = detailsQuoteId ? quotes.find((quote) => quote.id === detailsQuoteId) : undefined;

  const columnData = useMemo(() => {
    return COLUMNS.map((col) => {
      const filtered = quotes.filter((q) => {
        if (q.status !== 'em_producao') return false;
        if (type === 'impressao') {
          return q.requiresPrinting && q.printingStage === col.stage;
        }
        if (type === 'montagem') {
          return q.requiresAssembly && q.assemblyStage === col.stage;
        }
        return q.requiresInstallation && q.installationStage === col.stage;
      });
      return { ...col, quotes: filtered };
    });
  }, [quotes, type]);

  const hasAnyItems = columnData.some((col) => col.quotes.length > 0);

  if (!hasAnyItems) {
    return (
      <EmptyState
        title={
          type === 'impressao'
            ? 'Nenhuma impressão pendente'
            : type === 'montagem'
              ? 'Nenhuma montagem pendente'
              : 'Nenhuma instalação pendente'
        }
        description={
          type === 'instalacao'
            ? 'Os pedidos com instalação aparecerão aqui depois que as etapas anteriores obrigatórias forem concluídas.'
            : 'Quando um trabalho for enviado para produção final, ele aparecerá aqui.'
        }
        icon={type === 'impressao' ? Printer : type === 'montagem' ? Wrench : MapPin}
      />
    );
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {columnData.map((column) => (
          <KanbanColumn
            key={column.stage}
            title={column.title}
            count={column.quotes.length}
            color={column.color}
          >
            {column.quotes.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-gray-400">
                Nenhum item
              </p>
            ) : (
              column.quotes.map((quote) => (
                <ProductionJobCard
                  key={quote.id}
                  quote={quote}
                  type={type}
                  stage={column.stage}
                  onDetails={() => setDetailsQuoteId(quote.id)}
                  selected={quote.id === selectedQuoteId}
                  onSelect={onSelectQuote ? () => onSelectQuote(quote.id) : undefined}
                />
              ))
            )}
          </KanbanColumn>
        ))}
      </div>

      {detailsQuote && (
        <ArtQuoteDetailsModal
          quote={detailsQuote}
          notesLabel="Instrucoes para a Producao"
          onClose={() => setDetailsQuoteId(null)}
        />
      )}
    </>
  );
}
