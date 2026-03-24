'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductStore } from '@/stores/useProductStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductWizardForm } from '@/components/products/ProductWizardForm';
import { buildTemplateInitialData } from '@/lib/product-templates';

function NovoProdutoPageContent(): React.ReactElement {
  const router = useRouter();
  const addProduct = useProductStore((s) => s.addProduct);
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const templateId = searchParams.get('templateId');
  const initialData = useMemo(
    () => (templateId ? buildTemplateInitialData(templateId) ?? undefined : undefined),
    [templateId]
  );

  const handleSubmit = (data: { name: string } & Record<string, unknown>): void => {
    addProduct(data);
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/produtos');
    }, 1500);
  };

  const handleCancel = (): void => {
    router.push('/produtos');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Produto"
        subtitle="Preencha os dados para cadastrar um novo produto"
      />

      {showSuccess && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          Produto salvo com sucesso.
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <ProductWizardForm
          initialData={initialData ?? undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          preselectedGroupId={groupId ?? null}
        />
      </div>
    </div>
  );
}

export default function NovoProdutoPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="space-y-6" />}>
      <NovoProdutoPageContent />
    </Suspense>
  );
}
