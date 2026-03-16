'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';
import { ProductionKanban } from '@/components/final-production/ProductionKanban';
import { InstallationSchedulerPanel } from '@/components/final-production/InstallationSchedulerPanel';
import { useQuoteStore } from '@/stores/useQuoteStore';
import type { FinalProductionTab } from '@/types/common';

const TABS = [
  { id: 'impressao' as const, label: 'Impressão' },
  { id: 'montagem' as const, label: 'Montagem' },
  { id: 'instalacao' as const, label: 'Instalação' },
] as const;

export default function ProducaoFinalPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<FinalProductionTab>('impressao');
  const [selectedInstallationQuoteId, setSelectedInstallationQuoteId] = useState<string | null>(null);
  const quotes = useQuoteStore((state) => state.quotes);

  const installationQuotes = useMemo(() => {
    return quotes.filter(
      (quote) =>
        quote.status === 'em_producao' &&
        quote.requiresInstallation &&
        quote.installationStage !== 'nao_iniciado'
    );
  }, [quotes]);

  const effectiveSelectedInstallationQuoteId = useMemo(() => {
    const selectedStillExists = installationQuotes.some((quote) => quote.id === selectedInstallationQuoteId);
    if (selectedStillExists) {
      return selectedInstallationQuoteId;
    }

    const nextSelectedQuote =
      installationQuotes.find((quote) => quote.installationStage === 'disponivel') ??
      installationQuotes.find((quote) => quote.installationStage === 'em_andamento') ??
      installationQuotes[0];

    return nextSelectedQuote?.id ?? null;
  }, [installationQuotes, selectedInstallationQuoteId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produção Final"
        subtitle="Acompanhe o progresso de impressão, montagem e instalação dos pedidos"
      />

      <TabGroup
        tabs={[...TABS]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as FinalProductionTab)}
      />

      {activeTab === 'instalacao' ? (
        <div className="space-y-6">
          <ProductionKanban
            type={activeTab}
            selectedQuoteId={effectiveSelectedInstallationQuoteId}
            onSelectQuote={setSelectedInstallationQuoteId}
          />
          <InstallationSchedulerPanel quoteId={effectiveSelectedInstallationQuoteId} />
        </div>
      ) : (
        <ProductionKanban type={activeTab} />
      )}
    </div>
  );
}
