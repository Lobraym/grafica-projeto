'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { generateId, cn, formatCurrency } from '@/lib/utils';
import type { CostBlock, CostBlockOption, PriceTier, Product } from '@/types/product';
import { ProductPhotoUpload } from '@/components/products/ProductPhotoUpload';
import { useProductGroupStore } from '@/stores/useProductGroupStore';

const billingTypeOptions = [
  { value: 'm2', label: 'Por m²' },
  { value: 'quantidade', label: 'Por quantidade' },
  { value: 'unidade', label: 'Por unidade' },
  { value: 'metro_linear', label: 'Por metro linear' },
] as const;

const productTypeOptions = [
  { value: 'proprio', label: 'Produção própria' },
  { value: 'terceirizado', label: 'Terceirizado' },
] as const;

const costBlockTypeOptions = [
  { value: 'material_m2', label: 'Material por m²' },
  { value: 'material_metro', label: 'Material por metro' },
  { value: 'custo_fixo', label: 'Custo fixo por peça' },
  { value: 'energia_maquina', label: 'Energia / máquina' },
] as const;

function getDefaultOptionUnit(blockType: CostBlock['blockType']): string {
  switch (blockType) {
    case 'material_m2':
      return 'm2';
    case 'material_metro':
      return 'metro';
    case 'energia_maquina':
      return 'hora';
    case 'custo_fixo':
    default:
      return 'unidade';
  }
}

function emptyOption(blockType: CostBlock['blockType'] = 'material_m2'): CostBlockOption {
  return {
    id: generateId(),
    label: '',
    unit: getDefaultOptionUnit(blockType),
    value: 0,
  };
}

function emptyBlock(): CostBlock {
  return {
    id: generateId(),
    name: '',
    blockType: 'material_m2',
    options: [emptyOption('material_m2')],
  };
}

function emptyPriceTier(): PriceTier {
  return {
    id: generateId(),
    quantityFrom: 0,
    quantityTo: null,
    supplier: '',
    cost: 0,
  };
}

const priceTierSchema = z.object({
  id: z.string(),
  quantityFrom: z.number().min(0, 'Informe um valor válido'),
  quantityTo: z.number().min(0).nullable(),
  supplier: z.string().min(1, 'Fornecedor é obrigatório'),
  cost: z.number().min(0, 'Custo inválido'),
});

const costBlockOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Nome da opção é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  value: z.number().min(0, 'Valor inválido'),
});

const costBlockSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do bloco é obrigatório'),
  blockType: z.enum(['material_m2', 'material_metro', 'custo_fixo', 'energia_maquina']),
  temOpcoes: z.boolean().optional(),
  custoRolo: z.number().optional(),
  tamanhoRolo: z.number().optional(),
  calc: z.enum(['perimetro', 'largura2', 'largura1', 'altura2', 'manual']).optional(),
  options: z.array(costBlockOptionSchema).min(1, 'Adicione ao menos uma opção'),
});

const productWizardSchema = z
  .object({
    name: z.string().min(1, 'Nome do produto é obrigatório'),
    productType: z.enum(['proprio', 'terceirizado']),
    billingType: z.enum(['m2', 'quantidade', 'unidade', 'metro_linear']),
    minArea: z.number().min(0).nullable().optional(),
    priceTiers: z.array(priceTierSchema).default([]),
    costBlocks: z.array(costBlockSchema).default([]),
    marginPercent: z.number().min(0).max(100, 'Máx. 100%'),
    active: z.boolean().default(true),
    groupId: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.billingType === 'quantidade') {
      if (!data.priceTiers.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['priceTiers'],
          message: 'Adicione ao menos uma faixa de preço.',
        });
      }
    }

    if (!data.costBlocks.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['costBlocks'],
        message: 'Adicione ao menos um bloco de custo.',
      });
    }

    // Valida blocos de "Material por metro" (Material por metro)
    data.costBlocks.forEach((block, idx) => {
      if (block.blockType !== 'material_metro') return;

      const custoRolo = block.custoRolo;
      const tamanhoRolo = block.tamanhoRolo;

      if (typeof custoRolo !== 'number' || !Number.isFinite(custoRolo) || custoRolo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['costBlocks', idx, 'custoRolo'],
          message: 'Informe o custo do rolo/barra.',
        });
      }

      if (typeof tamanhoRolo !== 'number' || !Number.isFinite(tamanhoRolo) || tamanhoRolo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['costBlocks', idx, 'tamanhoRolo'],
          message: 'Informe o tamanho do rolo/barra.',
        });
      }

      if (block.calc == null || typeof block.calc !== 'string' || !block.calc.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['costBlocks', idx, 'calc'],
          message: 'Selecione como calcular a metragem.',
        });
      }
    });
  });

type ProductWizardValues = z.infer<typeof productWizardSchema>;

interface ProductWizardFormProps {
  readonly initialData?: Partial<Product>;
  readonly preselectedGroupId?: string | null;
  readonly onSubmit: (data: Partial<Product> & Pick<Product, 'name'>) => void;
  readonly onCancel: () => void;
}

export function ProductWizardForm({
  initialData,
  preselectedGroupId,
  onSubmit,
  onCancel,
}: ProductWizardFormProps): React.ReactElement {
  const [step, setStep] = useState(0);

  // Quando vier de template, alguns campos já chegam definidos e não precisam virar etapa visual.
  const shouldSkipProductTypeStep = Boolean(initialData && typeof initialData.productType !== 'undefined');
  // Quando vier de um template, os campos de cobrança já chegam pré-preenchidos em `initialData`.
  // Nesse caso, removemos a etapa visual de "Tipo de cobrança" para o usuário não precisar selecionar.
  const shouldSkipBillingStep = Boolean(initialData && typeof initialData.billingType !== 'undefined');
  const allSteps = [0, 1, 2, 3, 4] as const;
  const visibleSteps = allSteps.filter((s) => {
    if (s === 1 && shouldSkipProductTypeStep) return false;
    if (s === 2 && shouldSkipBillingStep) return false;
    return true;
  });
  const totalVisibleSteps = visibleSteps.length;
  const displayStep = Math.max(0, visibleSteps.indexOf(step as (typeof allSteps)[number]));

  const defaultValues: ProductWizardValues = useMemo(
    () => ({
      name: initialData?.name ?? '',
      productType: initialData?.productType ?? 'proprio',
      billingType: initialData?.billingType ?? 'm2',
      minArea: typeof initialData?.minArea === 'number' ? initialData.minArea : null,
      priceTiers: initialData?.priceTiers ?? [],
      costBlocks: initialData?.costBlocks ?? [],
      marginPercent: typeof initialData?.marginPercent === 'number' ? initialData.marginPercent : 0,
      active: typeof initialData?.active === 'boolean' ? initialData.active : true,
      groupId: typeof initialData?.groupId !== 'undefined' ? initialData.groupId ?? null : preselectedGroupId ?? null,
      photoUrl: typeof initialData?.photoUrl !== 'undefined' ? initialData.photoUrl ?? null : null,
    }),
    [initialData, preselectedGroupId]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ProductWizardValues>({
    resolver: zodResolver(productWizardSchema) as Resolver<ProductWizardValues>,
    defaultValues,
    mode: 'onChange',
  });

  const billingType = watch('billingType');
  const costBlocks = watch('costBlocks');
  const priceTiers = watch('priceTiers');
  const photoUrl = watch('photoUrl');
  const watchedGroupId = watch('groupId');
  const watchedName = watch('name');

  const normalizeMaterialMetroBlocks = useCallback((): void => {
    // Garantimos campos essenciais para o Zod schema não falhar
    // quando o usuário clicar "Próximo" rápido após preencher/alterar blocos.
    costBlocks.forEach((block, bi) => {
      if (block.blockType !== 'material_metro') return;

      const nextCalc = block.calc && typeof block.calc === 'string' ? block.calc : 'perimetro';

      if (block.temOpcoes !== false) {
        setValue(`costBlocks.${bi}.temOpcoes` as const, false, { shouldValidate: false });
      }

      if (!block.calc) {
        setValue(`costBlocks.${bi}.calc` as const, nextCalc, { shouldValidate: false });
      }

      const opt0 = block.options?.[0];
      if (!opt0) return;

      if (opt0.label !== 'Padrão') {
        setValue(`costBlocks.${bi}.options.0.label` as const, 'Padrão', { shouldValidate: false });
      }
      if (opt0.unit !== 'metro') {
        setValue(`costBlocks.${bi}.options.0.unit` as const, 'metro', { shouldValidate: false });
      }

      const custoRolo = block.custoRolo;
      const tamanhoRolo = block.tamanhoRolo;
      if (
        typeof custoRolo === 'number' &&
        Number.isFinite(custoRolo) &&
        typeof tamanhoRolo === 'number' &&
        Number.isFinite(tamanhoRolo) &&
        tamanhoRolo > 0
      ) {
        const custoPorMetro = Math.round((custoRolo / tamanhoRolo) * 100) / 100;
        if (opt0.value !== custoPorMetro) {
          setValue(`costBlocks.${bi}.options.0.value` as const, custoPorMetro, { shouldValidate: false });
        }
      }
    });
  }, [costBlocks, setValue]);

  useEffect(() => {
    if (step !== 3) return;

    costBlocks.forEach((block, bi) => {
      if (!Array.isArray(block.options)) return;
      const defaultUnit = getDefaultOptionUnit(block.blockType);
      block.options.forEach((opt, oi) => {
        if (opt.unit !== defaultUnit) {
          setValue(`costBlocks.${bi}.options.${oi}.unit` as const, defaultUnit, { shouldValidate: false });
        }
      });
    });
  }, [step, costBlocks, setValue]);

  const hydrateGroups = useProductGroupStore((s) => s.hydrate);
  const groups = useProductGroupStore((s) => s.groups);

  useEffect(() => {
    hydrateGroups();
  }, [hydrateGroups]);

  // Normalizações para blocos "Material por metro":
  // - garante que campos essenciais existem
  // - preenche o primeiro option com label/unit válidos (o UI não exibe opções para esse tipo)
  // - atualiza o valor do option com base em custoRolo/tamanhoRolo
  useEffect(() => {
    if (step !== 3) return;
    normalizeMaterialMetroBlocks();
  }, [step, normalizeMaterialMetroBlocks]);

  const groupColorHex = useMemo(() => {
    if (!watchedGroupId) return '#0F9B7A';
    return groups.find((g) => g.id === watchedGroupId)?.colorHex ?? '#0F9B7A';
  }, [groups, watchedGroupId]);

  const photoInitials = useMemo(() => {
    const n = (watchedName ?? '').trim();
    if (!n) return 'P';
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [watchedName]);

  useEffect(() => {
    setStep(0);
  }, [initialData, preselectedGroupId]);

  const goNext = async (): Promise<void> => {
    const fieldsByStep: Record<number, (keyof ProductWizardValues)[]> = {
      0: ['name'],
      1: ['productType'],
      2: ['billingType', 'minArea', 'priceTiers'],
      3: ['costBlocks'],
      4: ['marginPercent', 'active'],
    };

    const fields = fieldsByStep[step] ?? [];
    if (step === 3) {
      normalizeMaterialMetroBlocks();
      // Espera uma "volta" do event loop para o RHF refletir setValue antes de validar.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }

    const ok = await trigger(fields);
    if (!ok) return;

    setStep((s) => {
      const idx = visibleSteps.indexOf(s as (typeof allSteps)[number]);
      if (idx < 0) return s;
      return visibleSteps[Math.min(visibleSteps.length - 1, idx + 1)] ?? s;
    });
  };

  const goBack = (): void =>
    setStep((s) => {
      const idx = visibleSteps.indexOf(s as (typeof allSteps)[number]);
      if (idx <= 0) return s;
      return visibleSteps[idx - 1] ?? s;
    });

  const submit = (values: ProductWizardValues): void => {
    onSubmit({
      name: values.name.trim(),
      productType: values.productType,
      billingType: values.billingType,
      minArea: values.minArea ?? null,
      marginPercent: values.marginPercent,
      active: values.active,
      costBlocks: values.costBlocks,
      priceTiers: values.priceTiers,
      groupId: values.groupId ?? null,
      photoUrl: values.photoUrl ?? null,
    });
  };

  const title =
    step === 0
      ? 'Nome do produto'
      : step === 1
        ? 'Tipo do produto'
        : step === 2
          ? 'Tipo de cobrança'
          : step === 3
            ? 'Blocos de custo'
            : 'Margem de lucro';

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-6"
      noValidate
      aria-label="Wizard de cadastro de produto"
    >
      {/* Header do wizard */}
      <div className="rounded-xl border border-border bg-card-bg p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            <p className="mt-0.5 text-sm text-text-muted">
              Passo {displayStep + 1} de {totalVisibleSteps}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {Array.from({ length: totalVisibleSteps }).map((_, i) => {
              const active = i <= displayStep;
              return (
                <div
                  key={i}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    active ? 'bg-primary' : 'bg-border'
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Passo 1 */}
      {step === 0 && (
        <section className="rounded-xl border border-border bg-card-bg p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wizard-name" className="block text-sm font-medium text-text-muted mb-1.5">
                Nome do produto <span className="text-primary">*</span>
              </label>
              <input
                id="wizard-name"
                type="text"
                placeholder='Ex.: "Placa com Lona"'
                {...register('name')}
                className="block w-full rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <ProductPhotoUpload
                photoUrl={photoUrl}
                initials={photoInitials}
                fallbackColorHex={groupColorHex}
                onPhotoUrlChange={(url) => setValue('photoUrl', url, { shouldValidate: false })}
              />
            </div>
          </div>
        </section>
      )}

      {/* Passo 2 */}
      {!shouldSkipProductTypeStep && step === 1 && (
        <section className="rounded-xl border border-border bg-card-bg p-5">
          <label className="block text-sm font-medium text-text-muted mb-2">
            Tipo do produto <span className="text-primary">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productTypeOptions.map((opt) => {
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                    watch('productType') === opt.value ? 'border-primary/60 bg-primary/10' : 'border-border bg-card-bg hover:bg-card-bg-secondary'
                  )}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('productType')}
                    className="h-4 w-4 accent-primary focus:ring-primary/30"
                  />
                  <span className="text-sm font-medium text-text-secondary">{opt.label}</span>
                </label>
              );
            })}
          </div>
          {errors.productType && (
            <p className="mt-2 text-xs text-red-600">{errors.productType.message}</p>
          )}
        </section>
      )}

      {/* Passo 3 */}
      {!shouldSkipBillingStep && step === 2 && (
        <section className="rounded-xl border border-border bg-card-bg p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Tipo de cobrança <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {billingTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                    billingType === opt.value ? 'border-primary/60 bg-primary/10' : 'border-border bg-card-bg hover:bg-card-bg-secondary'
                  )}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('billingType')}
                    className="h-4 w-4 accent-primary focus:ring-primary/30"
                  />
                  <span className="text-sm font-medium text-text-secondary">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.billingType && (
              <p className="mt-2 text-xs text-red-600">{errors.billingType.message}</p>
            )}
          </div>

          {billingType === 'm2' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="minArea" className="block text-sm font-medium text-text-muted mb-1.5">
                  Área mínima (m²)
                </label>
                <input
                  id="minArea"
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  {...register('minArea', {
                    setValueAs: (v) => {
                      if (v === '' || v === null || v === undefined) return null;
                      const n = Number(v);
                      return Number.isFinite(n) ? n : null;
                    },
                  })}
                  className="block w-full rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
                {errors.minArea && <p className="mt-1 text-xs text-red-600">{errors.minArea.message}</p>}
              </div>
              <div className="flex items-end">
                <div className="text-xs text-text-muted">
                  Se o cliente pedir uma área menor, cobre pelo mínimo.
                </div>
              </div>
            </div>
          )}

          {billingType === 'quantidade' && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Faixas de preço</h3>
                  <p className="text-xs text-text-muted mt-0.5">Defina custo do fornecedor por faixa.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('priceTiers', [...priceTiers, emptyPriceTier()], { shouldValidate: true })}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-h-[44px]"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar faixa
                </button>
              </div>

              {priceTiers.length === 0 && (
                <div className="rounded-lg border border-border bg-card-bg-secondary p-4 text-sm text-text-muted">
                  Nenhuma faixa adicionada.
                </div>
              )}

              <div className="space-y-3">
                {priceTiers.map((tier, i) => (
                  <div key={tier.id} className="rounded-xl border border-border bg-card-bg-secondary p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Faixa {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            'priceTiers',
                            priceTiers.filter((t) => t.id !== tier.id),
                            { shouldValidate: true }
                          )
                        }
                        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-card-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        aria-label="Remover faixa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor={`qFrom-${tier.id}`} className="block text-xs font-medium text-text-muted mb-1.5">
                          Quantidade de
                        </label>
                        <input
                          id={`qFrom-${tier.id}`}
                          type="number"
                          step="1"
                          min="0"
                          {...register(`priceTiers.${i}.quantityFrom` as const, { valueAsNumber: true })}
                          className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label htmlFor={`qTo-${tier.id}`} className="block text-xs font-medium text-text-muted mb-1.5">
                          Até
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id={`unlimited-${tier.id}`}
                            type="checkbox"
                            checked={tier.quantityTo === null}
                            onChange={(e) => {
                              const next = priceTiers.map((t) =>
                                t.id === tier.id
                                  ? { ...t, quantityTo: e.target.checked ? null : Math.max(0, t.quantityFrom) }
                                  : t
                              );
                              setValue('priceTiers', next, { shouldValidate: true });
                            }}
                            className="h-4 w-4 rounded border-border accent-primary focus:ring-primary/30"
                          />
                          <span className="text-xs text-text-muted">Sem limite superior</span>
                        </div>
                        <input
                          id={`qTo-${tier.id}`}
                          type="number"
                          step="1"
                          min="0"
                          disabled={tier.quantityTo === null}
                          {...register(`priceTiers.${i}.quantityTo` as const, {
                            setValueAs: (v) => {
                              if (v === '' || v === null || v === undefined) return null;
                              const n = Number(v);
                              return Number.isFinite(n) ? n : null;
                            },
                          })}
                          className="mt-2 block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label htmlFor={`supplier-${tier.id}`} className="block text-xs font-medium text-text-muted mb-1.5">
                          Fornecedor
                        </label>
                        <input
                          id={`supplier-${tier.id}`}
                          type="text"
                          placeholder="Ex.: Zap Gráfica"
                          {...register(`priceTiers.${i}.supplier` as const)}
                          className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`cost-${tier.id}`} className="block text-xs font-medium text-text-muted mb-1.5">
                        Custo do fornecedor (R$)
                      </label>
                      <input
                        id={`cost-${tier.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`priceTiers.${i}.cost` as const, { valueAsNumber: true })}
                        className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {errors.priceTiers && (
                <p className="mt-2 text-xs text-red-600">{errors.priceTiers.message as string}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Passo 4 */}
      {step === 3 && (
        <section className="rounded-xl border border-border bg-card-bg p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Blocos de custo</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Cada bloco tem opções com custo real (ex.: Lona Fosca).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setValue('costBlocks', [...costBlocks, emptyBlock()], { shouldValidate: true })}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              Adicionar bloco
            </button>
          </div>

          {costBlocks.length === 0 && (
            <div className="rounded-lg border border-border bg-card-bg-secondary p-4 text-sm text-text-muted">
              Nenhum bloco adicionado.
            </div>
          )}

          <div className="space-y-4">
            {costBlocks.map((block, bi) => (
              <div key={block.id} className="rounded-xl border border-border bg-card-bg-secondary p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Nome do bloco <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: Lona, Metalon, Impressão..."
                      {...register(`costBlocks.${bi}.name` as const)}
                      className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                  <div className="w-full sm:w-64">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Tipo do bloco <span className="text-primary">*</span>
                    </label>
                    <select
                      {...register(`costBlocks.${bi}.blockType` as const)}
                      className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    >
                      {costBlockTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue('costBlocks', costBlocks.filter((b) => b.id !== block.id), { shouldValidate: true })}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-muted hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-h-[44px]"
                    aria-label="Remover bloco"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {block.blockType === 'material_metro' ? (
                  <div className="rounded-lg border border-border bg-card-bg p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Configuração do material</p>
                      <p className="mt-1 text-xs text-text-muted">
                        Informe custo do rolo/barra e como calcular a metragem.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`metro-custo-${bi}`} className="block text-xs font-medium text-text-muted mb-1.5">
                          Custo do rolo ou barra (R$) <span className="text-primary">*</span>
                        </label>
                        <input
                          id={`metro-custo-${bi}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Ex: 36,00"
                          {...register(`costBlocks.${bi}.custoRolo` as const, { valueAsNumber: true })}
                          className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor={`metro-tamanho-${bi}`} className="block text-xs font-medium text-text-muted mb-1.5">
                          Tamanho do rolo/barra <span className="text-primary">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            id={`metro-tamanho-${bi}`}
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Ex: 6"
                            {...register(`costBlocks.${bi}.tamanhoRolo` as const, { valueAsNumber: true })}
                            className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                          />
                          <span className="shrink-0 text-sm text-text-muted">metros</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`metro-calc-${bi}`} className="block text-xs font-medium text-text-muted mb-1.5">
                        Como calcular a metragem? <span className="text-primary">*</span>
                      </label>
                      <select
                        id={`metro-calc-${bi}`}
                        {...register(`costBlocks.${bi}.calc` as const)}
                        defaultValue={block.calc ?? 'perimetro'}
                        className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      >
                        <option value="perimetro">Perímetro completo — (Largura×2)+(Altura×2)</option>
                        <option value="largura2">Largura × 2 — ex: madeira cima e embaixo</option>
                        <option value="largura1">Largura × 1 — ex: perfil só em cima</option>
                        <option value="altura2">Altura × 2 — ex: laterais</option>
                        <option value="manual">Informar manualmente no orçamento</option>
                      </select>
                    </div>

                    <div className="rounded-lg border border-border bg-card-bg-secondary/60 px-4 py-3">
                      {(() => {
                        const custoRolo = typeof block.custoRolo === 'number' ? block.custoRolo : null;
                        const tamanhoRolo = typeof block.tamanhoRolo === 'number' ? block.tamanhoRolo : null;
                        if (!custoRolo || !tamanhoRolo || custoRolo <= 0 || tamanhoRolo <= 0) {
                          return <p className="text-xs text-text-muted">Custo por metro (automático): —</p>;
                        }
                        const custoPorMetro = Math.round((custoRolo / tamanhoRolo) * 100) / 100;
                        return (
                          <p className="text-xs text-text-muted">
                            Custo por metro (automático): {formatCurrency(custoPorMetro)}/m
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card-bg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Opções do bloco</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = costBlocks.map((b, idx) => (
                            idx === bi ? { ...b, options: [...b.options, emptyOption(b.blockType)] } : b
                          ));
                          setValue('costBlocks', next, { shouldValidate: true });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-3 py-2 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-h-[44px]"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar opção
                      </button>
                    </div>

                    <div className="space-y-3">
                      {block.options.map((opt, oi) => (
                        <div key={opt.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-6">
                            <label className="block text-xs font-medium text-text-muted mb-1.5">
                              Nome <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ex.: Fosca, Brilho..."
                              {...register(`costBlocks.${bi}.options.${oi}.label` as const)}
                              className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                            />
                          </div>
                          <div className="sm:col-span-5">
                            <label className="block text-xs font-medium text-text-muted mb-1.5">
                              Valor de custo (R$) <span className="text-primary">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`costBlocks.${bi}.options.${oi}.value` as const, { valueAsNumber: true })}
                              className="block w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <button
                              type="button"
                              onClick={() => {
                                const next = costBlocks.map((b, idx) => {
                                  if (idx !== bi) return b;
                                  return {
                                    ...b,
                                    options: b.options.filter((o) => o.id !== opt.id),
                                  };
                                });
                                setValue('costBlocks', next, { shouldValidate: true });
                              }}
                              disabled={block.options.length <= 1}
                              className="inline-flex items-center justify-center rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-muted hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Remover opção"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {errors.costBlocks && (
            <p className="text-xs text-red-600">{errors.costBlocks.message as string}</p>
          )}
        </section>
      )}

      {/* Passo 5 */}
      {step === 4 && (
        <section className="rounded-xl border border-border bg-card-bg p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="marginPercent" className="block text-sm font-medium text-text-muted mb-1.5">
                Margem de lucro (%) <span className="text-primary">*</span>
              </label>
              <input
                id="marginPercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register('marginPercent', { valueAsNumber: true })}
                className="block w-full rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              {errors.marginPercent && (
                <p className="mt-1 text-xs text-red-600">{errors.marginPercent.message}</p>
              )}
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 rounded-xl border border-border bg-card-bg-secondary px-4 py-3 cursor-pointer w-full">
                <input
                  type="checkbox"
                  {...register('active')}
                  className="h-4 w-4 rounded border-border accent-primary focus:ring-primary/30"
                />
                <span className="text-sm font-medium text-text-secondary">Produto ativo</span>
              </label>
            </div>
          </div>
          <div className="text-xs text-text-muted">
            A margem será aplicada no preço final (custo total + blocos + tiers quando aplicável).
          </div>
        </section>
      )}

      {/* Ações */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-card-bg px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
        >
          Cancelar
        </button>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg border border-border bg-card-bg px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            >
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </span>
            </button>
          )}

          {step !== (visibleSteps[visibleSteps.length - 1] ?? 4) && (
            <button
              type="button"
              onClick={() => void goNext()}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            >
              Próximo
            </button>
          )}

          {step === (visibleSteps[visibleSteps.length - 1] ?? 4) && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            >
              {isSubmitting ? 'Salvando…' : 'Salvar produto'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

