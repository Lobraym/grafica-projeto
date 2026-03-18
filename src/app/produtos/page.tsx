'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import { useProductGroupStore } from '@/stores/useProductGroupStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProductGroupCard } from '@/components/products/ProductGroupCard';
import { ProductThumbnail } from '@/components/products/ProductThumbnail';
import { GroupModal } from '@/components/products/GroupModal';
import { AddProductsToGroupModal } from '@/components/products/AddProductsToGroupModal';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import type { ProductGroup } from '@/types/product-group';

export default function ProdutosPage(): React.ReactElement {
  const router = useRouter();
  const hydrateProducts = useProductStore((s) => s.hydrate);
  const products = useProductStore((s) => s.products);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const hydrateGroups = useProductGroupStore((s) => s.hydrate);
  const groups = useProductGroupStore((s) => s.groups);
  const deleteGroup = useProductGroupStore((s) => s.deleteGroup);

  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [showAddProductsModal, setShowAddProductsModal] = useState(false);
  const [addProductsTargetGroupId, setAddProductsTargetGroupId] = useState<string | null>(null);

  useEffect(() => {
    hydrateProducts();
    hydrateGroups();
  }, [hydrateProducts, hydrateGroups]);

  const filteredProducts = useMemo(() => {
    let list = [...products].filter((p) => !!p);
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return list;
  }, [products, searchQuery]);

  const productsByGroupId = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filteredProducts) {
      if (!p.groupId) continue;
      const groupId = p.groupId;
      const list = map.get(groupId) ?? [];
      list.push(p);
      map.set(groupId, list);
    }
    for (const [gid, list] of map.entries()) {
      list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      map.set(gid, list);
    }
    return map;
  }, [filteredProducts]);

  const ungroupedProducts = useMemo(() => filteredProducts.filter((p) => !p.groupId), [filteredProducts]);

  const handleDeleteProductConfirm = () => {
    if (!deleteProductId) return;
    deleteProduct(deleteProductId);
    setDeleteProductId(null);
  };

  const handleDeleteGroupConfirm = () => {
    if (!deleteGroupId) return;
    // Remove vínculo do produto com o grupo excluído.
    const affected = products.filter((p) => p.groupId === deleteGroupId);
    affected.forEach((p) => updateProduct(p.id, { groupId: null }));
    deleteGroup(deleteGroupId);
    setDeleteGroupId(null);
  };

  const handleOpenCreateGroup = () => {
    setEditingGroupId(null);
    setShowGroupModal(true);
  };

  const handleOpenEditGroup = (groupId: string) => {
    setEditingGroupId(groupId);
    setShowGroupModal(true);
  };

  const handleOpenAddProducts = (targetGroupId: string | null) => {
    setAddProductsTargetGroupId(targetGroupId);
    setShowAddProductsModal(true);
  };

  if (groups.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cadastro de Produtos" subtitle="Você ainda não criou nenhum grupo">
          <Link
            href="/produtos/template-select"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F9B7A] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0F9B7A] focus:outline-none focus:ring-2 focus:ring-[#0F9B7A]/20 transition-colors duration-200 ease-out cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </PageHeader>

        <div className="rounded-xl border border-border bg-card-bg shadow-sm p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card-bg-secondary">
              <Package className={cn('h-7 w-7', isBlueTheme ? 'text-text-muted' : 'text-text-muted')} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-text-primary">Você ainda não criou nenhum grupo</h3>
            <p className="mt-1 text-sm text-text-muted max-w-md">
              Organize seus produtos em grupos para facilitar o cadastro.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateGroup}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-[#0F9B7A] bg-transparent px-4 py-2.5 text-sm font-medium text-[#0F9B7A] hover:bg-[#0F9B7A]/10 focus:outline-none focus:ring-2 focus:ring-[#0F9B7A]/20 transition-colors duration-200 ease-out cursor-pointer min-h-[44px]"
            >
              + Criar primeiro grupo
            </button>
          </div>
        </div>

        <GroupModal open={showGroupModal} groupId={editingGroupId} onClose={() => setShowGroupModal(false)} />
        <AddProductsToGroupModal
          open={showAddProductsModal}
          targetGroupId={addProductsTargetGroupId}
          onClose={() => setShowAddProductsModal(false)}
        />

        <ConfirmDialog
          open={!!deleteProductId}
          onClose={() => setDeleteProductId(null)}
          onConfirm={handleDeleteProductConfirm}
          title="Excluir produto"
          message="Tem certeza que deseja excluir este produto?"
          confirmLabel="Excluir"
          variant="danger"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastro de Produtos"
        subtitle="Organize seus produtos em grupos"
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleOpenCreateGroup}
            className="inline-flex items-center gap-2 rounded-lg border border-[#0F9B7A] bg-transparent px-4 py-2.5 text-sm font-medium text-[#0F9B7A] hover:bg-[#0F9B7A]/10 focus:outline-none focus:ring-2 focus:ring-[#0F9B7A]/20 transition-colors duration-200 ease-out cursor-pointer min-h-[44px]"
          >
            + Novo Grupo
          </button>
          <Link
            href="/produtos/template-select"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F9B7A] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0F9B7A] focus:outline-none focus:ring-2 focus:ring-[#0F9B7A]/20 transition-colors duration-200 ease-out cursor-pointer min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar produto por nome..." />
        <span className="text-sm text-text-muted shrink-0">{filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groups.map((group: ProductGroup) => {
          const groupProducts = productsByGroupId.get(group.id) ?? [];

          return (
            <ProductGroupCard
              key={group.id}
              group={group}
              products={groupProducts}
              onAddProducts={(gid) => handleOpenAddProducts(gid)}
              onEditGroup={(gid) => handleOpenEditGroup(gid)}
              onDeleteGroup={(gid) => setDeleteGroupId(gid)}
              onEditProduct={(pid) => router.push(`/produtos/${pid}`)}
              onDeleteProduct={(pid) => setDeleteProductId(pid)}
            />
          );
        })}

        {ungroupedProducts.length > 0 && (
          <UngroupedProductsCard
            products={ungroupedProducts}
            isBlueTheme={isBlueTheme}
            fallbackColorHex="#6B7280"
            onOrganize={() => handleOpenAddProducts(null)}
            onEditProduct={(pid) => router.push(`/produtos/${pid}`)}
            onDeleteProduct={(pid) => setDeleteProductId(pid)}
          />
        )}
      </div>

      <GroupModal open={showGroupModal} groupId={editingGroupId} onClose={() => setShowGroupModal(false)} />
      <AddProductsToGroupModal
        open={showAddProductsModal}
        targetGroupId={addProductsTargetGroupId}
        onClose={() => setShowAddProductsModal(false)}
      />

      <ConfirmDialog
        open={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        onConfirm={handleDeleteProductConfirm}
        title="Excluir produto"
        message="Tem certeza que deseja excluir este produto?"
        confirmLabel="Excluir"
        variant="danger"
      />
      <ConfirmDialog
        open={!!deleteGroupId}
        onClose={() => setDeleteGroupId(null)}
        onConfirm={handleDeleteGroupConfirm}
        title="Excluir grupo"
        message="Tem certeza que deseja excluir este grupo? Os produtos vinculados ficarão sem grupo."
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}

function UngroupedProductsCard({
  products,
  isBlueTheme,
  fallbackColorHex,
  onOrganize,
  onEditProduct,
  onDeleteProduct,
}: {
  readonly products: Product[];
  readonly isBlueTheme: boolean;
  readonly fallbackColorHex: string;
  readonly onOrganize: () => void;
  readonly onEditProduct: (productId: string) => void;
  readonly onDeleteProduct: (productId: string) => void;
}): React.ReactElement {
  const [showAll, setShowAll] = useState(false);
  const visibleProducts = showAll ? products : products.slice(0, 5);
  const canShowAll = products.length > 5;

  const getStatusLabel = (product: Product): 'Ativo' | 'Inativo' => {
    const status = product.status ?? (typeof product.active === 'boolean' ? (product.active ? 'ativo' : 'inativo') : undefined);
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  };

  return (
    <div className="bg-card-bg rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: fallbackColorHex }} />

      <div className="px-5 pt-4 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-bg-secondary border border-border shrink-0">
              <span className="text-[20px] leading-none" aria-hidden="true">
                📦
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">Sem grupo</h3>
              <span className="text-xs text-text-muted">{products.length} produto{products.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOrganize}
            className="rounded-lg border border-border bg-card-bg px-3 py-2 text-sm font-medium text-text-muted hover:bg-card-bg-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ease-out cursor-pointer min-h-[44px]"
          >
            Organizar
          </button>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="divide-y divide-border">
          {visibleProducts.map((p) => {
            const statusLabel = getStatusLabel(p);
            const badgeClass = isBlueTheme
              ? statusLabel === 'Ativo'
                ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/20'
                : 'bg-card-bg-secondary text-text-muted'
              : statusLabel === 'Ativo'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-gray-100 text-gray-400';

            return (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-card-bg-secondary transition-colors">
                <ProductThumbnail product={p} fallbackColorHex={fallbackColorHex} />
                <p className="text-sm font-medium flex-1 min-w-0 truncate">{p.name}</p>
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium', badgeClass)}>
                  {statusLabel}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditProduct(p.id)}
                    title="Editar"
                    aria-label="Editar produto"
                    className={cn(
                      'rounded-lg p-1.5 text-text-muted hover:bg-card-bg-secondary transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20'
                    )}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(p.id)}
                    title="Excluir"
                    aria-label="Excluir produto"
                    className="rounded-lg p-1.5 text-text-muted hover:bg-card-bg-secondary hover:text-red-500 transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {canShowAll && (
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => setShowAll((p) => !p)}
              className="text-sm font-medium text-primary hover:bg-card-bg-secondary transition-colors duration-200 ease-out w-full text-left rounded-lg px-2 py-1 cursor-pointer"
            >
              Ver todos ({products.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
