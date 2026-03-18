'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMaterialStore } from '@/stores/useMaterialStore';
import { materialSchema } from '@/lib/validators';
import type { MaterialFormData } from '@/types/product';

const inputBase =
  'mt-1 block w-full rounded-lg border border-border bg-card-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const errorInput = 'border-red-300 focus:border-red-400 focus:ring-red-500/20';

interface AddMaterialModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSaved: (materialId: string) => void;
}

const defaultValues: MaterialFormData = {
  name: '',
  basePrice: 0,
  cost: 0,
  profitMarginPercent: 0,
};

export function AddMaterialModal({
  open,
  onClose,
  onSaved,
}: AddMaterialModalProps): React.ReactElement | null {
  const overlayRef = useRef<HTMLDivElement>(null);
  const addMaterial = useMaterialStore((s) => s.addMaterial);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema) as Resolver<MaterialFormData>,
    defaultValues,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, reset, handleKeyDown]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const onSubmit = (data: MaterialFormData) => {
    const material = addMaterial(data);
    onSaved(material.id);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-material-title"
    >
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-card-bg border border-border p-6 shadow-xl">
        <h3 id="add-material-title" className="text-lg font-semibold text-text-primary">
          Adicionar novo material
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="material-name" className="block text-sm font-medium text-text-muted">
              Nome do material <span className="text-red-500">*</span>
            </label>
            <input
              id="material-name"
              type="text"
              placeholder="Ex: Lona Fosca"
              {...register('name')}
              className={`${inputBase} ${errors.name ? errorInput : ''}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="material-basePrice" className="block text-sm font-medium text-text-muted">
                Preço (R$) <span className="text-red-500">*</span>
              </label>
              <input
                id="material-basePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('basePrice', { valueAsNumber: true })}
                className={`${inputBase} ${errors.basePrice ? errorInput : ''}`}
              />
              {errors.basePrice && (
                <p className="mt-1 text-xs text-red-600">{errors.basePrice.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="material-cost" className="block text-sm font-medium text-text-muted">
                Custo (R$) <span className="text-red-500">*</span>
              </label>
              <input
                id="material-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('cost', { valueAsNumber: true })}
                className={`${inputBase} ${errors.cost ? errorInput : ''}`}
              />
              {errors.cost && (
                <p className="mt-1 text-xs text-red-600">{errors.cost.message}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="material-margin" className="block text-sm font-medium text-text-muted">
              Margem de lucro (%)
            </label>
            <input
              id="material-margin"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="Ex: 30"
              {...register('profitMarginPercent', {
                valueAsNumber: true,
                setValueAs: (v) => (Number.isFinite(Number(v)) ? Number(v) : 0),
              })}
              className={`${inputBase} ${errors.profitMarginPercent ? errorInput : ''}`}
            />
            {errors.profitMarginPercent && (
              <p className="mt-1 text-xs text-red-600">{errors.profitMarginPercent.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
