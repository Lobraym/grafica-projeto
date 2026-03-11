'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Palette, Clock, CheckCircle2, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArtJobCard } from '@/components/art-production/ArtJobCard';
import { ArtChecklist } from '@/components/art-production/ArtChecklist';
import { useQuoteStore } from '@/stores/useQuoteStore';
import type { ArtProductionTab } from '@/types/common';
import type { Quote } from '@/types/quote';

// bundle-dynamic-imports: modais pesados carregam sob demanda
const ArtReviewForm = dynamic(
  () => import('@/components/art-production/ArtReviewForm').then((m) => m.ArtReviewForm),
  { ssr: false }
);
const SendToProductionForm = dynamic(
  () => import('@/components/art-production/SendToProductionForm').then((m) => m.SendToProductionForm),
  { ssr: false }
);

const TABS = [
  { id: 'disponivel' as const, label: 'Disponível' },
  { id: 'em_producao' as const, label: 'Em Produção' },
  { id: 'concluidas' as const, label: 'Concluídas' },
] as const;

export default function ProducaoArtesPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ArtProductionTab>('disponivel');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);

  const quotes = useQuoteStore((s) => s.quotes);
  const startArtProduction = useQuoteStore((s) => s.startArtProduction);

  const available = useMemo(
    () => quotes.filter((q) => q.status === 'producao_arte' && !q.artChecklist.colorsCorrect && !q.artChecklist.sizeCorrect),
    [quotes]
  );

  const inProgress = useMemo(
    () => quotes.filter((q) => q.status === 'producao_arte' && (q.artChecklist.colorsCorrect || q.artChecklist.sizeCorrect)),
    [quotes]
  );

  const completed = useMemo(
    () => quotes.filter((q) => q.status === 'em_producao' && q.clientApproval?.approved === true),
    [quotes]
  );

  const selectedQuote = selectedQuoteId ? quotes.find((q) => q.id === selectedQuoteId) : undefined;

  const tabsWithCounts = TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'disponivel'
        ? available.length
        : tab.id === 'em_producao'
          ? inProgress.length
          : completed.length,
  }));

  const handleStartProduction = (quote: Quote): void => {
    startArtProduction(quote.id);
    setSelectedQuoteId(quote.id);
  };

  // rerender-functional-setstate: previne stale closures
  const handleOpenDetails = (quoteId: string): void => {
    setSelectedQuoteId((prev) => (prev === quoteId ? null : quoteId));
  };

  const handleOpenReview = (quoteId: string): void => {
    setSelectedQuoteId(quoteId);
    setShowReviewForm(true);
  };

  const handleOpenProductionForm = (quoteId: string): void => {
    setSelectedQuoteId(quoteId);
    setShowProductionForm(true);
  };

  const renderAvailableTab = (): React.ReactElement => {
    if (available.length === 0) {
      return (
        <EmptyState
          title="Nenhuma arte disponível"
          description="Quando um orçamento for aprovado, ele aparecerá aqui para iniciar a produção da arte."
          icon={Palette}
        />
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((quote) => (
          <ArtJobCard
            key={quote.id}
            quote={quote}
            onAction={() => handleStartProduction(quote)}
          />
        ))}
      </div>
    );
  };

  const renderInProgressTab = (): React.ReactElement => {
    if (inProgress.length === 0) {
      return (
        <EmptyState
          title="Nenhuma arte em produção"
          description="Inicie uma arte na aba 'Disponível' para ela aparecer aqui."
          icon={Clock}
        />
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inProgress.map((quote) => {
          const isSelected = selectedQuoteId === quote.id;
          const checklistComplete = quote.artChecklist.colorsCorrect && quote.artChecklist.sizeCorrect;

          return (
            <div key={quote.id} className="space-y-3">
              <ArtJobCard
                quote={quote}
                onAction={() => handleOpenDetails(quote.id)}
              />

              {isSelected && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                  <ArtChecklist
                    quoteId={quote.id}
                    checklist={quote.artChecklist}
                  />

                  {checklistComplete && (
                    <button
                      type="button"
                      onClick={() => handleOpenReview(quote.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <Send className="h-4 w-4" />
                      Enviar para Revisão do Cliente
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCompletedTab = (): React.ReactElement => {
    if (completed.length === 0) {
      return (
        <EmptyState
          title="Nenhuma arte concluída"
          description="Artes aprovadas pelo cliente aparecerão aqui para envio à produção final."
          icon={CheckCircle2}
        />
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {completed.map((quote) => (
          <ArtJobCard
            key={quote.id}
            quote={quote}
            onAction={() => handleOpenProductionForm(quote.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produção de Artes"
        subtitle="Gerencie a criação e aprovação de artes para os pedidos"
      />

      <TabGroup
        tabs={tabsWithCounts}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id as ArtProductionTab);
          setSelectedQuoteId(null);
        }}
      />

      <div className="mt-6">
        {activeTab === 'disponivel' && renderAvailableTab()}
        {activeTab === 'em_producao' && renderInProgressTab()}
        {activeTab === 'concluidas' && renderCompletedTab()}
      </div>

      {/* Modals */}
      {showReviewForm && selectedQuoteId && (
        <ArtReviewForm
          quoteId={selectedQuoteId}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedQuoteId(null);
          }}
        />
      )}

      {showProductionForm && selectedQuoteId && (
        <SendToProductionForm
          quoteId={selectedQuoteId}
          onClose={() => {
            setShowProductionForm(false);
            setSelectedQuoteId(null);
          }}
        />
      )}
    </div>
  );
}
