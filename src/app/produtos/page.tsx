'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import { useMaterialStore } from '@/stores/useMaterialStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PRODUCT_CATEGORIES, CALCULATION_TYPES, MEASUREMENT_UNITS } from '@/lib/product-constants';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types/product';

const PAGE_SIZE = 10;

function getCategoryLabel(value: Product['category']): string {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function getCalculationTypeLabel(value: Product['calculationType']): string {
  return CALCULATION_TYPES.find((c) => c.value === value)?.label ?? value;
}

function getUnitLabel(value: Product['measurementUnit']): string {
  return MEASUREMENT_UNITS.find((u) => u.value === value)?.label ?? value;
}

export default function ProdutosPage(): React.ReactElement {
  const router = useRouter();
  const hydrateProducts = useProductStore((s) => s.hydrate);
  const hydrateMaterials = useMaterialStore((s) => s.hydrate);
  const products = useProductStore((s) => s.products);
  const deleteProduct = useProductStore((s) => s.deleteProduct);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    hydrateProducts();
    hydrateMaterials();
  }, [hydrateProducts, hydrateMaterials]);

  const filteredAndSorted = useMemo(() => {
    let list = [...products];
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, 'pt-BR');
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [products, searchQuery, categoryFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, page]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      if (paginated.length === 1 && page > 1) setPage(page - 1);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastro de Produtos"
        subtitle={`${products.length} produto${products.length !== 1 ? 's' : ''} cadastrado${products.length !== 1 ? 's' : ''}`}
      >
        <Link
          href="/produtos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-200 ease-out cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Link>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar produto por nome..."
        />
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="category-filter" className="text-sm font-medium text-slate-700">
            Categoria
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">Todas</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-slate-500 shrink-0">
          {filteredAndSorted.length} resultado{filteredAndSorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <button
                    type="button"
                    onClick={() => setSortAsc((a) => !a)}
                    className="hover:text-slate-900 focus:outline-none"
                  >
                    Nome {sortAsc ? '↑' : '↓'}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Categoria
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Tipo de cálculo
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Preço Base
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Unidade
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                paginated.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {getCategoryLabel(product.category)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {getCalculationTypeLabel(product.calculationType)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {product.productMaterials?.length
                        ? product.productMaterials.length === 1
                          ? formatCurrency(product.productMaterials[0].price)
                          : 'Varia'
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {getUnitLabel(product.measurementUnit)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.status === 'ativo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {product.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/produtos/${product.id}`)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir produto"
        message="Tem certeza que deseja excluir este produto?"
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}
