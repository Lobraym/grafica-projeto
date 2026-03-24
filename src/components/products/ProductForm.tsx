'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMaterialStore } from '@/stores/useMaterialStore';
import { productSchema } from '@/lib/validators';
import { PRODUCT_CATEGORIES, CALCULATION_TYPES } from '@/lib/product-constants';
import { AddMaterialModal } from '@/components/products/AddMaterialModal';
import { generateId } from '@/lib/utils';
import type { Product, ProductFormData, ProductMaterial, ProductFinishing } from '@/types/product';

const inputBase =
  'mt-1 block w-full rounded-lg border border-border bg-card-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const errorInput = 'border-red-300 focus:border-red-400 focus:ring-red-500/20';
const selectBase = inputBase;

function productToFormData(p: Product): ProductFormData {
  return {
    name: p.name,
    category: p.category ?? 'impressao_digital',
    description: p.description ?? '',
    calculationType: p.calculationType ?? 'por_area',
    measurementUnit: p.measurementUnit ?? 'm2',
    productMaterials: p.productMaterials ?? [],
    finishings: p.finishings ?? [],
    minQuantity: p.minQuantity ?? null,
    defaultMarginPercent: p.defaultMarginPercent ?? 0,
    status: p.status ?? 'ativo',
  };
}

const defaultFormValues: ProductFormData = {
  name: '',
  category: 'impressao_digital',
  description: '',
  calculationType: 'por_area',
  measurementUnit: 'm2',
  productMaterials: [],
  finishings: [],
  minQuantity: null,
  defaultMarginPercent: 0,
  status: 'ativo',
};

interface ProductFormProps {
  readonly initialData?: Product;
  readonly onSubmit: (data: ProductFormData) => void;
  readonly onCancel: () => void;
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps): React.ReactElement {
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const materials = useMaterialStore((s) => s.materials);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: initialData ? productToFormData(initialData) : defaultFormValues,
    mode: 'onChange',
  });

  const calculationType = watch('calculationType');
  const productMaterials = watch('productMaterials');
  const finishings = watch('finishings');

  useEffect(() => {
    const unit =
      calculationType === 'por_area'
        ? 'm2'
        : calculationType === 'por_quantidade'
          ? 'milheiro'
          : 'unidade';
    setValue('measurementUnit', unit);
  }, [calculationType, setValue]);

  const handleMaterialAdded = useCallback(
    (materialId: string) => {
      const mat = materials.find((m) => m.id === materialId);
      const newPM: ProductMaterial = {
        materialId,
        price: mat?.basePrice ?? 0,
        cost: mat?.cost ?? 0,
        marginPercent: mat?.profitMarginPercent ?? 0,
      };
      setValue('productMaterials', [...(productMaterials ?? []), newPM], { shouldValidate: true });
    },
    [materials, productMaterials, setValue]
  );

  const removeProductMaterial = useCallback(
    (index: number) => {
      const next = (productMaterials ?? []).filter((_, i) => i !== index);
      setValue('productMaterials', next, { shouldValidate: true });
    },
    [productMaterials, setValue]
  );

  const updateProductMaterial = useCallback(
    (index: number, field: keyof ProductMaterial, value: number) => {
      const list = [...(productMaterials ?? [])];
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
        setValue('productMaterials', list, { shouldValidate: true });
      }
    },
    [productMaterials, setValue]
  );

  const addFinishing = useCallback(() => {
    const next: ProductFinishing[] = [
      ...(finishings ?? []),
      { id: generateId(), name: '', priceExtra: 0 },
    ];
    setValue('finishings', next, { shouldValidate: true });
  }, [finishings, setValue]);

  const removeFinishing = useCallback(
    (id: string) => {
      setValue(
        'finishings',
        (finishings ?? []).filter((f) => f.id !== id),
        { shouldValidate: true }
      );
    },
    [finishings, setValue]
  );

  const updateFinishing = useCallback(
    (id: string, field: 'name' | 'priceExtra', value: string | number) => {
      const list = (finishings ?? []).map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      );
      setValue('finishings', list, { shouldValidate: true });
    },
    [finishings, setValue]
  );

  const sectionCard =
    'rounded-xl border border-border bg-card-bg shadow-sm overflow-hidden';

  const sectionHeader =
    'flex items-center gap-3 border-b border-border bg-card-bg-secondary px-5 py-4';
  const sectionTitle = 'text-base font-semibold text-text-primary';
  const sectionBadge =
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary';
  const sectionBody = 'p-5';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* 1. Identificação do produto */}
        <section className={sectionCard}>
          <div className={sectionHeader}>
            <span className={sectionBadge}>1</span>
            <div>
              <h2 className={sectionTitle}>Identificação do produto</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Nome e categoria para organizar no cadastro
              </p>
            </div>
          </div>
          <div className={`${sectionBody} grid grid-cols-1 gap-5 sm:grid-cols-2`}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-muted">
                Nome do produto <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="Ex: Banner, Cartão de Visita"
                {...register('name')}
                className={`${inputBase} ${errors.name ? errorInput : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-muted">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                {...register('category')}
                className={`${selectBase} ${errors.category ? errorInput : ''}`}
              >
                {PRODUCT_CATEGORIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* 2. Materiais ou variações */}
        <section className={sectionCard}>
          <div className={sectionHeader}>
            <span className={sectionBadge}>2</span>
            <div>
              <h2 className={sectionTitle}>Materiais ou variações</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Quais materiais podem ser usados neste produto
              </p>
            </div>
          </div>
          <div className={sectionBody}>
            <div className="space-y-4">
              {(productMaterials ?? []).length === 0 ? (
                <p className="text-sm text-text-muted">
                  Nenhum material adicionado. Use os botões abaixo para adicionar materiais com preço e custo.
                </p>
              ) : (
                <div className="space-y-3">
                  {(productMaterials ?? []).map((pm, index) => {
                    const mat = materials.find((m) => m.id === pm.materialId);
                    const priceLabel =
                      calculationType === 'por_area'
                        ? 'Preço por m² (R$)'
                        : calculationType === 'por_quantidade'
                          ? 'Preço base (R$)'
                          : 'Preço por unidade (R$)';
                    return (
                      <div
                        key={`${pm.materialId}-${index}`}
                        className="rounded-lg border border-border bg-card-bg-secondary p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            {mat?.name ?? 'Material'}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProductMaterial(index)}
                            className="text-text-muted hover:text-red-600 text-sm"
                          >
                            Remover
                          </button>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div>
                            <label className="block text-xs font-medium text-text-muted">
                              {priceLabel}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={pm.price === 0 ? '' : pm.price}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateProductMaterial(index, 'price', v === '' ? 0 : Number(v) || 0);
                              }}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-muted">
                              Custo (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={pm.cost === 0 ? '' : pm.cost}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateProductMaterial(index, 'cost', v === '' ? 0 : Number(v) || 0);
                              }}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-muted">
                              Margem (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={pm.marginPercent === 0 ? '' : pm.marginPercent}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateProductMaterial(
                                  index,
                                  'marginPercent',
                                  v === '' ? 0 : Number(v) || 0
                                );
                              }}
                              className={inputBase}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {materials.filter((m) => !(productMaterials ?? []).some((pm) => pm.materialId === m.id)).length > 0 && (
                  <select
                    className={selectBase}
                    style={{ width: 'auto', minWidth: 200 }}
                    defaultValue=""
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id) {
                        handleMaterialAdded(id);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Adicionar material existente...</option>
                    {materials
                      .filter((m) => !(productMaterials ?? []).some((pm) => pm.materialId === m.id))
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span className="text-primary">+</span> Criar novo material
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Cálculo */}
        <section className={sectionCard}>
          <div className={sectionHeader}>
            <span className={sectionBadge}>3</span>
            <div>
              <h2 className={sectionTitle}>Forma de cobrança</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Como deseja cobrar este produto
              </p>
            </div>
          </div>
          <div className={sectionBody}>
            <span className="block text-sm font-medium text-text-muted mb-3">
              Tipo de cálculo
            </span>
            <div className="space-y-2 max-w-md">
              {CALCULATION_TYPES.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card-bg-secondary px-4 py-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('calculationType')}
                    className="border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-text-muted">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.calculationType && (
              <p className="mt-2 text-xs text-red-600">{errors.calculationType.message}</p>
            )}
          </div>
        </section>

        {/* 4. Valores (apenas quantidade mínima quando tipo = por quantidade) */}
        {calculationType === 'por_quantidade' && (
          <section className={sectionCard}>
            <div className={sectionHeader}>
              <span className={sectionBadge}>4</span>
              <div>
                <h2 className={sectionTitle}>Valores</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Quantidade mínima para este produto
                </p>
              </div>
            </div>
            <div className={sectionBody}>
              <div className="max-w-xs">
                <label htmlFor="minQuantity" className="block text-sm font-medium text-text-muted">
                  Quantidade mínima <span className="text-red-500">*</span>
                </label>
                <input
                  id="minQuantity"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 100"
                  {...register('minQuantity', {
                    setValueAs: (v) => {
                      if (v === '' || v === undefined) return null;
                      const n = Number(v);
                      return Number.isFinite(n) ? n : null;
                    },
                  })}
                  className={`${inputBase} ${errors.minQuantity ? errorInput : ''}`}
                />
                {errors.minQuantity && (
                  <p className="mt-1 text-xs text-red-600">{errors.minQuantity.message}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Acabamentos com preço adicional (4 ou 5 conforme tipo de cálculo) */}
        <section className={sectionCard}>
          <div className={sectionHeader}>
            <span className={sectionBadge}>{calculationType === 'por_quantidade' ? '5' : '4'}</span>
            <div>
              <h2 className={sectionTitle}>Acabamentos</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Opções de acabamento com valor extra (ex.: Ilhós +R$ 10)
              </p>
            </div>
          </div>
          <div className={sectionBody}>
            <div className="space-y-3">
              {(finishings ?? []).map((f) => (
                <div
                  key={f.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card-bg-secondary p-3"
                >
                  <input
                    type="text"
                    placeholder="Nome (ex: Ilhós)"
                    value={f.name}
                    onChange={(e) => updateFinishing(f.id, 'name', e.target.value)}
                    className={`${inputBase} flex-1 min-w-[120px]`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted">+ R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={f.priceExtra}
                      onChange={(e) =>
                        updateFinishing(f.id, 'priceExtra', Number(e.target.value) || 0)
                      }
                      className={`${inputBase} w-24`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFinishing(f.id)}
                    className="text-text-muted hover:text-red-600 text-sm"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFinishing}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <span className="text-primary">+</span> Adicionar acabamento
              </button>
            </div>
          </div>
        </section>

        {/* Ações */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end sm:border-t sm:border-border sm:pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-card-bg px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>

      <AddMaterialModal
        open={showAddMaterial}
        onClose={() => setShowAddMaterial(false)}
        onSaved={handleMaterialAdded}
      />
    </>
  );
}
