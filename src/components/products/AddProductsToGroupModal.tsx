'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link2, X } from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import { useProductGroupStore } from '@/stores/useProductGroupStore';
import type { Product } from '@/types/product';

interface AddProductsToGroupModalProps {
  readonly open: boolean;
  readonly targetGroupId: string | null; // null => escolhe grupo no modal
  readonly onClose: () => void;
}

export function AddProductsToGroupModal({
  open,
  targetGroupId,
  onClose,
}: AddProductsToGroupModalProps): React.ReactElement | null {
  const groups = useProductGroupStore((s) => s.groups);
  const hydrateProducts = useProductStore((s) => s.hydrate);
  const products = useProductStore((s) => s.products);
  const updateProduct = useProductStore((s) => s.updateProduct);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(targetGroupId);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedProductIds(new Set());
    setError(null);
    setSubmitting(false);
    setSelectedGroupId(targetGroupId);
  }, [open, targetGroupId]);

  useEffect(() => {
    if (!open) return;
    // Garante que products e grupos estejam hidratados quando abrir.
    hydrateProducts();
  }, [open, hydrateProducts]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const ungroupedProducts = useMemo(() => {
    return products
      .filter((p) => !p.groupId)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [products]);

  const toggleSelected = (productId: string, checked: boolean) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const handleAddSelected = async (): Promise<void> => {
    if (!selectedGroupId) {
      setError('Selecione um grupo para adicionar os produtos.');
      return;
    }

    const ids = Array.from(selectedProductIds);
    if (ids.length === 0) {
      setError('Selecione ao menos um produto.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      ids.forEach((pid) => {
        updateProduct(pid, { groupId: selectedGroupId });
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const preselectHref = selectedGroupId
    ? `/produtos/template-select?groupId=${encodeURIComponent(selectedGroupId)}`
    : '/produtos/template-select';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-products-modal-title"
    >
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 rounded-2xl bg-card-bg p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="add-products-modal-title" className="text-base font-semibold text-text-primary">
              Adicionar produtos ao grupo
            </h3>
            <p className="mt-0.5 text-sm text-text-muted">Selecione produtos que ainda não estão em nenhum grupo.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg p-1.5 text-text-muted hover:bg-card-bg-secondary hover:text-text-primary transition-colors duration-200 ease-out cursor-pointer min-h-[44px]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {targetGroupId === null && (
            <div>
              <label htmlFor="destination-group" className="block text-sm font-medium text-text-muted mb-1.5">
                Para qual grupo?
              </label>
              <select
                id="destination-group"
                value={selectedGroupId ?? ''}
                onChange={(e) => setSelectedGroupId(e.target.value || null)}
                className="w-full rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="">Selecione…</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.iconEmoji} {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lista de produtos sem grupo */}
          <div className="rounded-xl border border-border bg-card-bg-secondary/70 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-text-primary">
                {ungroupedProducts.length} produto{ungroupedProducts.length !== 1 ? 's' : ''} sem grupo
              </p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {ungroupedProducts.length === 0 ? (
                <div className="p-5 text-sm text-text-muted">Não há produtos sem grupo no momento.</div>
              ) : (
                <div className="divide-y divide-border">
                  {ungroupedProducts.map((p: Product) => {
                    const checked = selectedProductIds.has(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-card-bg-secondary transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleSelected(p.id, e.target.checked)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                          <p className="text-xs text-text-muted truncate">
                            {p.description ? p.description : '—'}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <Link2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
            <div className="flex-1">
              <a
                href={preselectHref}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                ou criar novo produto
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-border bg-card-bg px-4 py-2.5 min-h-[44px] text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ease-out"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleAddSelected()}
            disabled={submitting}
            className="cursor-pointer rounded-lg bg-primary px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ease-out"
          >
            {submitting ? 'Adicionando…' : 'Adicionar selecionados'}
          </button>
        </div>
      </div>
    </div>
  );
}

