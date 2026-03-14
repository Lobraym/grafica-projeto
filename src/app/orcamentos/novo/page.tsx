'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import type { QuoteFormData } from '@/types/quote';

function NovoOrcamentoContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addQuote = useQuoteStore((state) => state.addQuote);

  const clientId = searchParams.get('clientId') ?? undefined;

  const handleSubmit = (data: QuoteFormData): void => {
    const quote = addQuote(data);
    router.push(`/orcamentos/${quote.id}`);
  };

  const handleCancel = (): void => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Novo Orcamento" subtitle="Preencha os dados do orcamento" />

      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <QuoteForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            preselectedClientId={clientId}
          />
        </div>
      </div>
    </div>
  );
}

export default function NovoOrcamentoPage(): React.ReactElement {
  return (
    <Suspense>
      <NovoOrcamentoContent />
    </Suspense>
  );
}
