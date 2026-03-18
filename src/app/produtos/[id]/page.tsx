'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductWizardForm } from '@/components/products/ProductWizardForm';

export default function EditarProdutoPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const hydrateProducts = useProductStore((s) => s.hydrate);
  const products = useProductStore((s) => s.products);
  const getProductById = useProductStore((s) => s.getProductById);
  const updateProduct = useProductStore((s) => s.updateProduct);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    hydrateProducts();
  }, [hydrateProducts]);

  const product = useMemo(() => getProductById(id), [getProductById, id, products]);

  const handleSubmit = (data: { name: string } & Record<string, unknown>): void => {
    if (!id) return;
    updateProduct(id, data);
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/produtos');
    }, 1500);
  };

  const handleCancel = (): void => {
    router.push('/produtos');
  };

  if (product === undefined) {
    if (products.length === 0) {
      return (
        <div className="space-y-6">
          <PageHeader title="Carregando produto..." />
          <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card-bg p-6 text-text-muted">
            Buscando dados da API...
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <PageHeader title="Produto não encontrado" />
        <div className="rounded-xl border border-border bg-card-bg p-6 text-center">
          <p className="text-sm text-red-600">
            O produto solicitado não existe ou foi removido.
          </p>
          <Link
            href="/produtos"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Produto"
        subtitle={product.name}
      />

      {showSuccess && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          Produto atualizado com sucesso.
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <ProductWizardForm
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
