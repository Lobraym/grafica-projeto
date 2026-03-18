'use client';

import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@/types/product';
import type { ProductGroup } from '@/types/product-group';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { ProductThumbnail } from './ProductThumbnail';
import { GrupoMenu } from './GrupoMenu';

interface ProductGroupCardProps {
  readonly group: ProductGroup;
  readonly products: Product[];
  readonly onAddProducts: (groupId: string) => void;
  readonly onEditGroup: (groupId: string) => void;
  readonly onDeleteGroup: (groupId: string) => void;
  readonly onEditProduct: (productId: string) => void;
  readonly onDeleteProduct: (productId: string) => void;
}

function getProductStatusLabel(product: Product): 'Ativo' | 'Inativo' {
  const status = product.status ?? (typeof product.active === 'boolean' ? (product.active ? 'ativo' : 'inativo') : undefined);
  return status === 'ativo' ? 'Ativo' : 'Inativo';
}

export function ProductGroupCard({
  group,
  products,
  onAddProducts,
  onEditGroup,
  onDeleteGroup,
  onEditProduct,
  onDeleteProduct,
}: ProductGroupCardProps): React.ReactElement {
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';
  const [showAll, setShowAll] = useState(false);

  const visibleProducts = useMemo(() => {
    if (showAll) return products;
    return products.slice(0, 5);
  }, [products, showAll]);

  const canShowAll = products.length > 5;

  return (
    <div className="bg-card-bg rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: group.colorHex }} />

      <div className="px-5 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-bg-secondary border border-border shrink-0">
              <span className="text-[20px] leading-none" aria-hidden="true">
                {group.iconEmoji}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base font-semibold truncate">{group.name}</h3>
                <span className="text-xs text-text-muted shrink-0">{products.length} produto{products.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>

          <GrupoMenu
            onEdit={() => onEditGroup(group.id)}
            onDelete={() => onDeleteGroup(group.id)}
          />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="divide-y divide-border">
          {visibleProducts.length === 0 ? (
            <div className="px-5 py-4 text-sm text-text-muted">Nenhum produto neste grupo.</div>
          ) : (
            visibleProducts.map((p) => {
              const statusLabel = getProductStatusLabel(p);
              const badgeClass = isBlueTheme
                ? statusLabel === 'Ativo'
                  ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/20'
                  : 'bg-card-bg-secondary text-text-muted'
                : statusLabel === 'Ativo'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-100 text-gray-400';

              const iconHoverClass = isBlueTheme ? 'hover:text-primary' : 'hover:text-teal-600';

              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-card-bg-secondary transition-colors">
                  <ProductThumbnail product={p} fallbackColorHex={group.colorHex} />

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
                        'rounded-lg p-1.5 text-text-muted hover:bg-card-bg-secondary transition-colors duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20',
                        iconHoverClass
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
            })
          )}
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

      <div className="border-t border-border">
        <button
          type="button"
          onClick={() => onAddProducts(group.id)}
          className="w-full py-3 text-sm text-primary hover:bg-primary/10 transition-colors text-center font-medium cursor-pointer"
        >
          + Adicionar produto neste grupo
        </button>
      </div>
    </div>
  );
}

