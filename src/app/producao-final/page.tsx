'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TabGroup } from '@/components/ui/TabGroup';
import { ProductionKanban } from '@/components/final-production/ProductionKanban';
import type { FinalProductionTab } from '@/types/common';

const TABS = [
  { id: 'impressao' as const, label: 'Impressão' },
  { id: 'montagem' as const, label: 'Montagem' },
] as const;

export default function ProducaoFinalPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<FinalProductionTab>('impressao');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produção Final"
        subtitle="Acompanhe o progresso de impressão e montagem dos pedidos"
      />

      <TabGroup
        tabs={[...TABS]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as FinalProductionTab)}
      />

      <div className="mt-6">
        <ProductionKanban type={activeTab} />
      </div>
    </div>
  );
}
