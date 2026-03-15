'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/stores/useProductStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductForm } from '@/components/products/ProductForm';
import type { ProductFormData } from '@/types/product';

export default function NovoProdutoPage(): React.ReactElement {
  const router = useRouter();
  const addProduct = useProductStore((s) => s.addProduct);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (data: ProductFormData): void => {
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
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          Produto salvo com sucesso.
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
