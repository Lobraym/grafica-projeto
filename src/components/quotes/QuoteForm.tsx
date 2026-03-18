'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { FileImage, FileText, MapPin, Paperclip, Printer, Trash2, Upload, Wrench } from 'lucide-react';
import { quoteSchema } from '@/lib/validators';
import { useClientStore } from '@/stores/useClientStore';
import { useProductStore } from '@/stores/useProductStore';
import { useMaterialStore } from '@/stores/useMaterialStore';
import { calculateQuotePrice, calculateQuotePricePRD } from '@/lib/product-price';
import { formatCurrency } from '@/lib/utils';
import type { QuoteFormData, QuoteMeasurementUnit } from '@/types/quote';
import type { FileAttachment } from '@/types/common';
import { cn, generateId } from '@/lib/utils';
import type { BillingType, CostBlock } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';

type QuoteSchemaInput = z.input<typeof quoteSchema>;
type QuoteSchemaOutput = z.output<typeof quoteSchema>;

interface QuoteFormProps {
  readonly initialData?: Partial<QuoteFormData>;
  readonly onSubmit: (data: QuoteFormData) => void;
  readonly onCancel: () => void;
  readonly preselectedClientId?: string;
}

const MEASUREMENT_UNIT_OPTIONS: ReadonlyArray<{
  readonly value: QuoteMeasurementUnit;
  readonly label: string;
}> = [
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },
  { value: 'm', label: 'm' },
] as const;

export function QuoteForm({
  initialData,
  onSubmit,
  onCancel,
  preselectedClientId,
}: QuoteFormProps): React.ReactElement {
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';
  const clients = useClientStore((state) => state.clients);
  const hydrateProducts = useProductStore((s) => s.hydrate);
  const hydrateMaterials = useMaterialStore((s) => s.hydrate);
  const products = useProductStore((s) => s.products);
  const activeProductsList = useMemo(
    () =>
      products.filter((p) => {
        const status = p.status ?? (typeof p.active === 'boolean' ? (p.active ? 'ativo' : 'inativo') : undefined);
        return status === 'ativo';
      }),
    [products]
  );
  const getProductById = useProductStore((s) => s.getProductById);
  const getMaterialById = useMaterialStore((s) => s.getMaterialById);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceFiles, setReferenceFiles] = useState<FileAttachment[]>(initialData?.files ?? []);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [selectedFinishingIds, setSelectedFinishingIds] = useState<string[]>([]);
  const [selectedCostBlockOptionIds, setSelectedCostBlockOptionIds] = useState<Record<string, string>>({});
  const [manualMetroPerimetersByBlockId, setManualMetroPerimetersByBlockId] = useState<Record<string, number>>({});
  const MAX_DISCOUNT_PERCENT = 50;
  const [adminApprovedForDiscount, setAdminApprovedForDiscount] = useState(false);

  useEffect(() => {
    hydrateProducts();
    hydrateMaterials();
  }, [hydrateProducts, hydrateMaterials]);

  const handleReferenceFilesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map((file) => ({
      id: generateId(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));

    setReferenceFiles((current) => [...current, ...newFiles]);
    event.target.value = '';
  };

  const handleRemoveReferenceFile = (fileId: string): void => {
    setReferenceFiles((current) => current.filter((file) => file.id !== fileId));
  };

  const handleFormSubmit = (data: QuoteSchemaOutput): void => {
    const width = data.width.trim();
    const height = data.height.trim();
    const size = width && height
      ? `${width} ${data.measurementUnit} x ${height} ${data.measurementUnit}`
      : data.size.trim();

    const formData: QuoteFormData = {
      clientId: data.clientId,
      service: data.service,
      material: data.material,
      quantity: data.quantity,
      width,
      height,
      measurementUnit: data.measurementUnit,
      size,
      description: data.description ?? '',
      receptionNotes: data.receptionNotes ?? '',
      deadline: initialData?.deadline ?? '',
      value: data.value,
      files: referenceFiles,
      requiresPrinting: data.requiresPrinting ?? true,
      requiresAssembly: data.requiresAssembly ?? false,
      requiresInstallation: data.requiresInstallation ?? false,
      installationStreet: data.requiresInstallation ? data.installationStreet.trim() : '',
      installationNeighborhood: data.requiresInstallation ? data.installationNeighborhood.trim() : '',
      installationNumber: data.requiresInstallation ? data.installationNumber.trim() : '',
      installationCity: data.requiresInstallation ? data.installationCity.trim() : '',
      installationDate: data.requiresInstallation ? initialData?.installationDate ?? '' : '',
    };
    onSubmit(formData);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteSchemaInput, unknown, QuoteSchemaOutput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: preselectedClientId ?? initialData?.clientId ?? '',
      service: initialData?.service ?? '',
      material: initialData?.material ?? '',
      quantity: initialData?.quantity ?? 1,
      width: initialData?.width ?? '',
      height: initialData?.height ?? '',
      measurementUnit: initialData?.measurementUnit ?? 'cm',
      size: initialData?.size ?? '',
      description: initialData?.description ?? '',
      receptionNotes: initialData?.receptionNotes ?? '',
      deadline: initialData?.deadline ?? '',
      value: initialData?.value ?? 0,
      requiresPrinting: initialData?.requiresPrinting ?? true,
      requiresAssembly: initialData?.requiresAssembly ?? false,
      requiresInstallation: initialData?.requiresInstallation ?? false,
      installationStreet: initialData?.installationStreet ?? '',
      installationNeighborhood: initialData?.installationNeighborhood ?? '',
      installationNumber: initialData?.installationNumber ?? '',
      installationCity: initialData?.installationCity ?? '',
      installationDate: initialData?.installationDate ?? '',
    },
  });

  const requiresInstallation = useWatch({ control, name: 'requiresInstallation' });
  const quantity = useWatch({ control, name: 'quantity' });
  const width = useWatch({ control, name: 'width' });
  const height = useWatch({ control, name: 'height' });
  const measurementUnit = useWatch({ control, name: 'measurementUnit' });
  const watchedValue = useWatch({ control, name: 'value' });

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;

  const normalizePrdBillingType = (tipo: unknown): BillingType | null => {
    if (typeof tipo !== 'string') return null;
    const t = tipo.trim().toLowerCase();
    if (t === 'm2') return 'm2';
    if (t === 'qtd' || t === 'quantidade') return 'quantidade';
    if (t === 'un' || t === 'unidade') return 'unidade';
    if (t === 'metro' || t === 'metro_linear' || t === 'metrolinear') return 'metro_linear';
    if (t === 'material_m2') return 'm2';
    return null;
  };

  const normalizePrdCostBlocks = (rawProduct: unknown): CostBlock[] => {
    const anyProduct = rawProduct as unknown as { blocos?: unknown };
    const blocos = anyProduct?.blocos;
    if (!Array.isArray(blocos)) return [];

    const normalizeBlockType = (tipo: unknown): CostBlock['blockType'] => {
      if (typeof tipo !== 'string') return 'custo_fixo';
      const t = tipo.trim().toLowerCase();
      if (t === 'm2' || t === 'material_m2') return 'material_m2';
      if (t === 'metro' || t === 'material_metro' || t === 'metro_linear') return 'material_metro';
      if (t === 'energia' || t === 'energia_maquina') return 'energia_maquina';
      if (t === 'fixo' || t === 'custo_fixo') return 'custo_fixo';
      return 'custo_fixo';
    };

    return blocos
      .map((b) => {
        const anyBlock = b as unknown as {
          opcoes?: unknown;
          options?: unknown;
          id?: unknown;
          nome?: unknown;
          name?: unknown;
          tipo?: unknown;
          blockType?: unknown;
          temOpcoes?: unknown;
          custoRolo?: unknown;
          tamanhoRolo?: unknown;
          calc?: unknown;
        };

        const optionsRaw = Array.isArray(anyBlock.opcoes)
          ? anyBlock.opcoes
          : Array.isArray(anyBlock.options)
            ? anyBlock.options
            : [];

        const options = optionsRaw
          .map((o) => {
            const anyOpt = o as unknown as { id?: unknown; label?: unknown; nome?: unknown; value?: unknown; custo?: unknown; unit?: unknown; unidade?: unknown };

            const id = typeof anyOpt?.id === 'string' ? anyOpt.id : String(anyOpt?.id ?? '');
            const label = typeof anyOpt?.label === 'string' ? anyOpt.label : anyOpt?.nome;
            const custo =
              typeof anyOpt?.value === 'number'
                ? anyOpt.value
                : typeof anyOpt?.custo === 'number'
                  ? anyOpt.custo
                  : 0;
            const unit =
              typeof anyOpt?.unit === 'string'
                ? anyOpt.unit
                : typeof anyOpt?.unidade === 'string'
                  ? anyOpt.unidade
                  : '';

            if (!id) return null;

            return {
              id,
              label: typeof label === 'string' ? label : String(label ?? ''),
              value: custo,
              unit,
            };
          })
          .filter(Boolean) as CostBlock['options'];

        const id = typeof anyBlock?.id === 'string' ? anyBlock.id : String(anyBlock?.id ?? '');
        if (!id || options.length === 0) return null;

        return {
          id,
          name: typeof anyBlock?.nome === 'string' ? anyBlock.nome : typeof anyBlock?.name === 'string' ? anyBlock.name : 'Bloco',
          blockType: normalizeBlockType(anyBlock?.tipo ?? anyBlock?.blockType),
          options,
          temOpcoes: anyBlock?.temOpcoes,
          custoRolo: typeof anyBlock?.custoRolo === 'number' ? anyBlock.custoRolo : undefined,
          tamanhoRolo: typeof anyBlock?.tamanhoRolo === 'number' ? anyBlock.tamanhoRolo : undefined,
          calc: typeof anyBlock?.calc === 'string' ? anyBlock.calc : undefined,
        } as unknown as CostBlock;
      })
      .filter(Boolean) as CostBlock[];
  };

  const prdProduct = (() => {
    if (!selectedProduct) return null;
    if (selectedProduct.costBlocks?.length) return selectedProduct;

    const anyProduct = selectedProduct as unknown as { tipo?: unknown; margem?: unknown; areaMinima?: unknown; blocos?: unknown };
    if (!Array.isArray(anyProduct?.blocos) || anyProduct.blocos.length === 0) return null;

    const billingType = selectedProduct.billingType ?? normalizePrdBillingType(anyProduct.tipo) ?? undefined;

    const anySelectedProduct = selectedProduct as unknown as { marginPercent?: unknown; defaultMarginPercent?: unknown };
    const marginPercent =
      typeof anySelectedProduct?.marginPercent === 'number'
        ? anySelectedProduct.marginPercent
        : typeof anyProduct?.margem === 'number'
          ? anyProduct.margem
          : anySelectedProduct.marginPercent ?? anySelectedProduct.defaultMarginPercent ?? 0;

    return {
      ...(selectedProduct as unknown as Record<string, unknown>),
      billingType,
      marginPercent,
      minArea:
        (selectedProduct as unknown as { minArea?: unknown }).minArea ??
        (anyProduct as unknown as { areaMinima?: unknown }).areaMinima ??
        undefined,
      costBlocks: normalizePrdCostBlocks(selectedProduct),
    } as unknown as typeof selectedProduct;
  })();

  const isPRDProduct = Boolean(prdProduct?.costBlocks?.length);
  const prdBillingType = prdProduct?.billingType;
  const prdOptionBlocks =
    prdProduct?.costBlocks?.filter((b) => {
      const anyBlock = b as unknown as { temOpcoes?: unknown };
      if (anyBlock.temOpcoes === false) return false;
      return (b.options?.length ?? 0) > 0;
    }) ?? [];

  const prdManualMetroBlocks =
    prdProduct?.costBlocks?.filter((b) => b.blockType === 'material_metro' && b.calc === 'manual') ?? [];

  const hasSelectedProduct = Boolean(selectedProductId);

  const getPrdBlockDisplayLabel = (block: CostBlock): string => {
    const name = block.name?.trim() ?? '';
    if (block.blockType === 'material_m2') {
      const n = name.toLowerCase();
      if (n === 'lona' || n === 'tipo de lona' || n.includes('lona')) return 'Tipo de lona';
      return `Tipo de ${name}`;
    }
    if (block.blockType === 'custo_fixo') {
      const n = name.toLowerCase();
      if (n === 'acabamento' || n === 'tipo de acabamento' || n.includes('acabamento')) return 'Acabamento';
      return name || 'Acabamento';
    }
    if (block.blockType === 'material_metro') {
      const n = name.toLowerCase();
      if (n.includes('metro') || n.includes('linear') || n.includes('metrage')) return 'Metragem linear';
      return name || 'Metragem linear';
    }
    if (block.blockType === 'energia_maquina') {
      const n = name.toLowerCase();
      if (n.includes('energia')) return 'Energia da máquina';
      return name || 'Energia';
    }
    return name;
  };

  const getPrdOptionLabel = (opt: CostBlock['options'][number] | unknown): string => {
    const anyOpt = opt as unknown as { label?: unknown; nome?: unknown };
    if (typeof anyOpt?.label === 'string' && anyOpt.label.trim()) return anyOpt.label;
    if (typeof anyOpt?.nome === 'string' && anyOpt.nome.trim()) return anyOpt.nome;
    return '';
  };
  const productMaterialsWithName =
    selectedProduct?.productMaterials?.length
      ? selectedProduct.productMaterials
          .map((pm) => {
            const mat = getMaterialById(pm.materialId);
            return { ...pm, materialName: mat?.name ?? 'Material' };
          })
          .filter(Boolean)
      : [];

  const selectedProductMaterial =
    selectedProduct && selectedMaterialId
      ? selectedProduct.productMaterials?.find((pm) => pm.materialId === selectedMaterialId) ?? null
      : null;

  const suggestedValue = (() => {
    if (!selectedProduct) return null;

    const qty = typeof quantity === 'number' && Number.isFinite(quantity) ? quantity : 1;
    const baseParams = {
      width: typeof width === 'string' ? width : '',
      height: typeof height === 'string' ? height : '',
      quoteMeasurementUnit: measurementUnit ?? 'cm',
      quantity: qty,
      selectedFinishingIds,
    };

    if (isPRDProduct) {
      const result = calculateQuotePricePRD(prdProduct ?? selectedProduct, {
        ...baseParams,
        selectedCostBlockOptionIds,
        manualMetroPerimetersByBlockId,
      });
      return result.total;
    }

    if (!selectedProductMaterial) return null;
    const result = calculateQuotePrice(selectedProduct, selectedProductMaterial, baseParams);
    return result.total;
  })();

  // Para PRD: preenche Valor com o sugerido, mas não sobrescreve se o cliente/recepção já digitou um desconto.
  const lastSuggestedValueRef = useRef<number | null>(null);
  useEffect(() => {
    // Ao trocar o produto, forçamos a sincronização do valor sugerido.
    lastSuggestedValueRef.current = null;
  }, [selectedProductId]);
  useEffect(() => {
    if (suggestedValue == null) return;

    const current = typeof watchedValue === 'number' && Number.isFinite(watchedValue) ? watchedValue : 0;
    const last = lastSuggestedValueRef.current;
    const epsilon = 0.005;
    const shouldSync =
      last == null ||
      (typeof last === 'number' && Number.isFinite(last) && Math.abs(current - last) <= epsilon);

    lastSuggestedValueRef.current = suggestedValue;

    if (!shouldSync) return;
    setValue('value', suggestedValue, { shouldValidate: true });
  }, [suggestedValue, watchedValue, setValue]);

  // Para produtos PRD cobrados por m², a quantidade é irrelevante no cálculo.
  // Mantemos como 1 para evitar confusão na UI.
  useEffect(() => {
    if (!isPRDProduct) return;
    if (prdBillingType !== 'm2') return;
    setValue('quantity', 1, { shouldValidate: true });
  }, [isPRDProduct, prdBillingType, setValue]);

  const productionCostTotal = (() => {
    if (!selectedProduct) return null;

    const qty = typeof quantity === 'number' && Number.isFinite(quantity) ? quantity : 1;
    const wStr = typeof width === 'string' ? width : '';
    const hStr = typeof height === 'string' ? height : '';
    const unit = measurementUnit ?? 'cm';

    if (isPRDProduct) {
      const result = calculateQuotePricePRD(prdProduct ?? selectedProduct, {
        width: wStr,
        height: hStr,
        quoteMeasurementUnit: unit,
        quantity: qty,
        selectedCostBlockOptionIds,
        manualMetroPerimetersByBlockId,
      });
      return result.subtotal; // custo total (sem margem)
    }

    if (!selectedProductMaterial) return null;
    const parseNumber = (str: string): number => {
      const n = parseFloat(String(str).replace(',', '.').trim());
      return Number.isFinite(n) ? n : 0;
    };
    const toMeters = (value: number, u: QuoteMeasurementUnit): number => {
      if (u === 'm') return value;
      if (u === 'cm') return value / 100;
      if (u === 'mm') return value / 1000;
      return value;
    };

    const cost = selectedProductMaterial.cost ?? 0;
    switch (selectedProduct.calculationType) {
      case 'por_area': {
        const w = parseNumber(wStr);
        const h = parseNumber(hStr);
        const wM = toMeters(w, unit);
        const hM = toMeters(h, unit);
        const areaM2 = wM * hM;
        return Math.round(areaM2 * cost * 100) / 100;
      }
      case 'por_quantidade':
      case 'por_unidade':
        return Math.round(qty * cost * 100) / 100;
      default:
        return Math.round(cost * 100) / 100;
    }
  })();

  const requiresAdminApprovalForDiscount =
    suggestedValue == null || suggestedValue <= 0
      ? false
      : (() => {
          const current = typeof watchedValue === 'number' && Number.isFinite(watchedValue) ? watchedValue : 0;
          return current < suggestedValue * (1 - MAX_DISCOUNT_PERCENT / 100);
        })();

  const inputBaseClass =
    'block w-full rounded-lg border border-border bg-card-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ease-out h-10 shadow-inner shadow-black/10';
  const textareaBaseClass =
    'block w-full rounded-lg border border-border bg-card-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ease-out';
  const selectBaseClass =
    'h-10 rounded-lg border border-border bg-card-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ease-out';

  const errorInputClass = 'border-red-500/70 focus:border-red-500 focus:ring-red-500/25';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Secao: Informacoes do Cliente */}
      <fieldset>
        <legend className="mb-4 text-base font-semibold text-text-primary">Informações do Cliente</legend>
        <div>
          <label htmlFor="clientId" className="mb-1.5 block text-sm font-medium text-text-muted">
            Cliente <span className="ml-0.5 text-primary">*</span>
          </label>
          <select
            id="clientId"
            {...register('clientId')}
            disabled={Boolean(preselectedClientId)}
            className={cn(
              inputBaseClass,
              'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%239ca3af%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
              errors.clientId && errorInputClass,
              preselectedClientId && 'bg-card-bg-secondary text-text-muted cursor-not-allowed'
            )}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1.5 text-xs text-red-600">{errors.clientId.message}</p>
          )}
        </div>
      </fieldset>

      {/* Secao: Detalhes do Servico */}
      <fieldset>
        <legend className="mb-4 text-base font-semibold text-text-primary">Detalhes do Serviço</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Produto (opcional) - preenche servico e material */}
          <div className="sm:col-span-2">
            <label htmlFor="productId" className="mb-1.5 block text-sm font-medium text-text-muted">
              Produto <span className="ml-0.5 text-primary">*</span>
            </label>
            <select
              id="productId"
              value={selectedProductId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedProductId(id);
                setSelectedMaterialId('');
                setSelectedFinishingIds([]);
                setSelectedCostBlockOptionIds({});
                setManualMetroPerimetersByBlockId({});
                const applyProductToForm = (product: typeof selectedProduct | null): void => {
                  if (!product) {
                    setValue('service', '');
                    setValue('material', '');
                    return;
                  }

                  const maybeNome = (product as unknown as { nome?: unknown }).nome;
                  const productName = typeof maybeNome === 'string' ? maybeNome : product.name;
                  setValue('service', productName);

                  const normalizedCostBlocks = product.costBlocks?.length ? product.costBlocks : normalizePrdCostBlocks(product);
                  const normalizedBillingType =
                    product.billingType ?? normalizePrdBillingType((product as unknown as { tipo?: unknown }).tipo) ?? product.billingType;

                  if (normalizedCostBlocks?.length) {
                    if (normalizedBillingType === 'm2') {
                      setValue('measurementUnit', 'm', { shouldValidate: false });
                    }

                    const nextMap: Record<string, string> = {};
                    normalizedCostBlocks.forEach((block) => {
                      const firstOpt = block.options?.[0];
                      nextMap[block.id] = firstOpt?.id ?? '';
                    });

                    setSelectedCostBlockOptionIds(nextMap);

                    const relevantBlocks = normalizedCostBlocks.filter((b) => {
                      const anyBlock = b as unknown as { temOpcoes?: unknown };
                      if (anyBlock.temOpcoes === false) return false;
                      return (b.options?.length ?? 0) > 0;
                    });

                    const materialLabel = relevantBlocks
                      .map((block) => {
                        const optId = nextMap[block.id];
                        const opt = block.options?.find((o) => o.id === optId);
                        return opt
                          ? `${getPrdBlockDisplayLabel(block)}: ${getPrdOptionLabel(opt)}`
                          : getPrdBlockDisplayLabel(block);
                      })
                      .join(' - ');

                    setValue('material', materialLabel, { shouldValidate: true });
                    return;
                  }

                  // Legacy: seleciona o primeiro material disponível
                  const first = product.productMaterials?.[0];
                  if (first) {
                    const mat = getMaterialById(first.materialId);
                    setValue('material', mat?.name ?? '');
                    setSelectedMaterialId(first.materialId);
                  } else {
                    setValue('material', '');
                  }
                };

                // Primeira resposta imediata (estado do store).
                const productFromStore = id ? getProductById(id) : null;
                applyProductToForm(productFromStore);

                // Segunda resposta: garante que blocos/opções estejam atualizados via API.
                void (async () => {
                  if (!id) return;
                  try {
                    const res = await fetch(`/api/products/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
                    if (!res.ok) return;
                    const apiProduct = (await res.json()) as unknown as typeof selectedProduct;
                    applyProductToForm(apiProduct);
                  } catch {
                    // Fallback: manter store/estado local.
                  }
                })();
              }}
              className={cn(selectBaseClass, 'w-full')}
            >
              <option value="">Selecione um produto</option>
              {activeProductsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="mt-1.5 text-xs text-red-600">{errors.service.message}</p>
            )}
          </div>

          {/* Material: select dos materiais do produto (com preço/custo por material) */}
          <div className="sm:col-span-2">
            <label htmlFor="material" className="mb-1.5 block text-sm font-medium text-text-muted">
              Material <span className="ml-0.5 text-primary">*</span>
            </label>
            {!hasSelectedProduct ? (
              <input
                id="material"
                type="text"
                placeholder="Selecione um produto para habilitar"
                {...register('material')}
                disabled
                className={cn(
                  inputBaseClass,
                  'cursor-not-allowed bg-card-bg-secondary/60 text-text-muted placeholder:text-text-muted',
                  errors.material && errorInputClass
                )}
              />
            ) : isPRDProduct ? (
              <div className="space-y-4">
                {prdOptionBlocks.length > 0 ? (
                  prdOptionBlocks.map((block) => {
                    const selectedOptId = selectedCostBlockOptionIds[block.id] ?? '';
                    return (
                      <select
                        key={block.id}
                        id={`prd-block-${block.id}`}
                        value={selectedOptId}
                        onChange={(e) => {
                          const nextOptId = e.target.value;
                          const nextMap = {
                            ...selectedCostBlockOptionIds,
                            [block.id]: nextOptId,
                          };
                          setSelectedCostBlockOptionIds(nextMap);

                          const materialLabel = prdOptionBlocks
                            .map((b) => {
                              const optId = nextMap[b.id] ?? '';
                              const foundOpt = b.options?.find((o) => o.id === optId);
                              const foundLabel = foundOpt ? getPrdOptionLabel(foundOpt) : '';
                              return foundLabel
                                ? `${getPrdBlockDisplayLabel(b)}: ${foundLabel}`
                                : getPrdBlockDisplayLabel(b);
                            })
                            .join(' - ');
                          setValue('material', materialLabel, { shouldValidate: true });
                        }}
                        className={cn(selectBaseClass, 'w-full')}
                        aria-label={`Selecionar ${getPrdBlockDisplayLabel(block)}`}
                        title={getPrdBlockDisplayLabel(block)}
                      >
                        {block.options.map((opt) => {
                          const optLabel = getPrdOptionLabel(opt);
                          return (
                            <option key={opt.id} value={opt.id}>
                              {optLabel || opt.id}
                            </option>
                          );
                        })}
                      </select>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-border bg-card-bg-secondary p-4 text-sm text-text-muted">
                    Este produto não possui blocos de custo com opções compatíveis para exibir nesta etapa.
                  </div>
                )}
              </div>
            ) : productMaterialsWithName.length > 0 ? (
              <select
                id="material"
                value={selectedMaterialId}
                onChange={(e) => {
                  const materialId = e.target.value;
                  setSelectedMaterialId(materialId);
                  const pm = productMaterialsWithName.find((p) => p.materialId === materialId);
                  setValue('material', pm?.materialName ?? '');
                }}
                className={cn(selectBaseClass, 'w-full', errors.material && errorInputClass)}
              >
                <option value="">Selecione o material</option>
                {productMaterialsWithName.map((pm) => (
                  <option key={pm.materialId} value={pm.materialId}>
                    {pm.materialName}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="material"
                type="text"
                placeholder="Ex: Couche 300g, Vinilico, Lona"
                {...register('material')}
                disabled
                className={cn(
                  inputBaseClass,
                  'cursor-not-allowed bg-card-bg-secondary/60 text-text-muted placeholder:text-text-muted',
                  errors.material && errorInputClass
                )}
              />
            )}
            {errors.material && (
              <p className="mt-1.5 text-xs text-red-600">{errors.material.message}</p>
            )}
          </div>

          {/* Quantidade */}
          {(isPRDProduct && prdBillingType === 'm2') ? (
            // Para produto por m²: a quantidade é irrelevante na UI (mantém-se 1 internamente).
            <input type="hidden" {...register('quantity', { valueAsNumber: true })} />
          ) : (
            <div>
              <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-text-muted">
                {isPRDProduct && prdBillingType === 'metro_linear' ? (
                  <>
                    Metragem linear (m) <span className="ml-0.5 text-primary">*</span>
                  </>
                ) : (
                  <>
                    Quantidade <span className="ml-0.5 text-primary">*</span>
                  </>
                )}
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                step={isPRDProduct && prdBillingType === 'metro_linear' ? '0.01' : '1'}
                placeholder={isPRDProduct && prdBillingType === 'metro_linear' ? 'Ex: 12' : 'Ex: 100'}
                {...register('quantity', { valueAsNumber: true })}
                className={cn(inputBaseClass, errors.quantity && errorInputClass)}
              />
              {errors.quantity && (
                <p className="mt-1.5 text-xs text-red-600">{errors.quantity.message}</p>
              )}

              {isPRDProduct && prdBillingType === 'quantidade' && selectedProduct?.priceTiers?.length ? (
                <div className="mt-2 text-xs text-text-muted">
                  Faixas disponíveis:
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedProduct.priceTiers.map((tier) => {
                      const upper = tier.quantityTo == null ? 'sem limite' : tier.quantityTo;
                      return (
                        <span
                          key={tier.id}
                          className="rounded-md border border-border bg-card-bg-secondary/60 px-2 py-1 text-[10px] font-medium text-text-muted"
                          title={`Fornecedor: ${tier.supplier}`}
                        >
                          {tier.quantityFrom}-{upper}: {formatCurrency(tier.cost)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Medidas */}
          {isPRDProduct && prdBillingType !== 'm2' ? <input type="hidden" {...register('measurementUnit')} /> : null}
          {(!isPRDProduct || prdBillingType === 'm2') ? (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-text-muted">
                Medidas
              </label>

              {/* Legacy: unidade selecionável */}
              {!isPRDProduct ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]">
                  <div>
                    <label
                      htmlFor="measurementUnit"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted"
                    >
                      Unidade
                    </label>
                    <select
                      id="measurementUnit"
                      {...register('measurementUnit')}
                      className={cn(
                        selectBaseClass,
                        'w-full',
                        (errors.width || errors.height) && errorInputClass
                      )}
                      aria-label="Unidade das medidas"
                    >
                      {MEASUREMENT_UNIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="width"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted"
                    >
                      Largura
                    </label>
                    <input
                      id="width"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 20"
                      {...register('width')}
                      className={cn(inputBaseClass, 'w-full', errors.width && errorInputClass)}
                    />
                    {errors.width && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.width.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="height"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted"
                    >
                      Altura
                    </label>
                    <input
                      id="height"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 30"
                      {...register('height')}
                      className={cn(inputBaseClass, 'w-full', errors.height && errorInputClass)}
                    />
                    {errors.height && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.height.message}</p>
                    )}
                  </div>
                </div>
              ) : (
                // PRD: por m² (converteremos para metros internamente)
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                      <label
                        htmlFor="measurementUnit"
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted"
                      >
                        Unidade
                      </label>
                      <select
                        id="measurementUnit"
                        {...register('measurementUnit')}
                        className={cn(
                          selectBaseClass,
                          'w-full',
                          (errors.width || errors.height) && errorInputClass
                        )}
                        aria-label="Unidade das medidas"
                      >
                        {MEASUREMENT_UNIT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="width"
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted"
                      >
                        Largura ({measurementUnit})
                      </label>
                      <input
                        id="width"
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 200"
                        {...register('width')}
                        className={cn(inputBaseClass, 'w-full', errors.width && errorInputClass)}
                      />
                      {errors.width && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.width.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="height"
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted"
                      >
                        Altura ({measurementUnit})
                      </label>
                      <input
                        id="height"
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 300"
                        {...register('height')}
                        className={cn(inputBaseClass, 'w-full', errors.height && errorInputClass)}
                      />
                      {errors.height && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.height.message}</p>
                      )}
                    </div>
                  </div>

                  {prdManualMetroBlocks.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {prdManualMetroBlocks.map((block) => {
                        const labelName = block.name?.trim() || 'Material por metro';
                        const value = manualMetroPerimetersByBlockId[block.id];
                        return (
                          <div key={block.id}>
                            <label className="mb-1.5 block text-sm font-medium text-text-muted">
                              Metragem manual — {labelName}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Ex: 2.5"
                              value={typeof value === 'number' && Number.isFinite(value) ? value : ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (!raw.trim()) {
                                  setManualMetroPerimetersByBlockId((prev) => {
                                    const next = { ...prev };
                                    delete next[block.id];
                                    return next;
                                  });
                                  return;
                                }
                                const n = parseFloat(raw.replace(',', '.'));
                                setManualMetroPerimetersByBlockId((prev) => ({ ...prev, [block.id]: Number.isFinite(n) ? n : 0 }));
                              }}
                              className={cn(inputBaseClass, 'w-full')}
                              aria-label={`Metragem manual para ${labelName}`}
                            />
                          </div>
                        );
                      })}
                      <p className="text-xs text-text-muted">
                        Para os blocos em modo manual, a metragem informada será usada no cálculo do preço.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}

          {/* Acabamentos (legado: quando produto tem acabamentos) */}
          {!isPRDProduct && selectedProduct?.finishings?.length ? (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text-muted">
                Acabamentos (valor extra)
              </label>
              <div className="flex flex-wrap gap-3">
                {selectedProduct.finishings.map((f) => (
                  <label
                    key={f.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card-bg px-3 py-2 cursor-pointer hover:bg-card-bg-secondary"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFinishingIds.includes(f.id)}
                      onChange={(e) => {
                        setSelectedFinishingIds((prev) =>
                          e.target.checked
                            ? [...prev, f.id]
                            : prev.filter((id) => id !== f.id)
                        );
                      }}
                      className="rounded border-border text-primary focus:ring-primary/40"
                    />
                    <span className="text-sm text-text-secondary">
                      {f.name} (+{formatCurrency(f.priceExtra)})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {/* (UI removida) Preço sugerido era apenas uma base manual.
              O campo `Valor` continua sendo preenchido automaticamente pelo suggestedValue. */}

          {/* Valor */}
          <div>
            <label htmlFor="value" className="mb-1.5 block text-sm font-medium text-text-muted">
              Valor
              {isPRDProduct ? <span className="ml-2 text-text-secondary">(base para desconto)</span> : null}{' '}
              <span className="ml-0.5 text-primary">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-text-muted">
                R$
              </span>
              <input
                id="value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('value', { valueAsNumber: true })}
                className={cn(
                  inputBaseClass,
                  'pl-10',
                  errors.value && errorInputClass
                )}
              />
            </div>
            {errors.value && (
              <p className="mt-1.5 text-xs text-red-600">{errors.value.message}</p>
            )}

            {productionCostTotal != null && watchedValue < productionCostTotal && (
              <p className="mt-1.5 text-xs text-red-600">⚠️ Valor abaixo do custo de produção</p>
            )}

            {requiresAdminApprovalForDiscount && (
              <div className="mt-3 rounded-lg border border-red-500/40 bg-red-50/30 px-3 py-2">
                <p className="text-xs font-medium text-red-700">
                  Aprovação do admin necessária: desconto acima do limite ({MAX_DISCOUNT_PERCENT}%).
                </p>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-red-700">
                  <input
                    type="checkbox"
                    checked={adminApprovedForDiscount}
                    onChange={(e) => setAdminApprovedForDiscount(e.target.checked)}
                    className="h-4 w-4 rounded border-red-500 text-red-600 focus:ring-red-500/20"
                  />
                  Confirmo que o admin autorizou este desconto
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-xs text-primary">
          O prazo de produção começa após a aprovação da arte pelo cliente. Após a aprovação, o sistema
          inicia automaticamente 10 dias de produção.
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-base font-semibold text-text-primary">Anexos / Referências</legend>

        <div className="rounded-xl border border-border bg-card-bg-secondary/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Anexe arquivos de referência do cliente
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Aceita PDF, PNG, JPG e JPEG. Você pode anexar vários arquivos no mesmo orçamento.
              </p>
            </div>

            <div className="shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                multiple
                onChange={handleReferenceFilesChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-card-bg px-4 py-2.5 text-sm font-medium text-text-secondary ring-1 ring-border transition-colors duration-200 ease-out hover:bg-card-bg-secondary cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Adicionar Arquivos
              </button>
            </div>
          </div>

          {referenceFiles.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {referenceFiles.map((file) => {
                const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');

                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card-bg px-4 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card-bg-secondary text-text-muted">
                      {isPdf ? <FileText className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{file.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {isPdf ? 'PDF' : 'Imagem de referência'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveReferenceFile(file.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors duration-200 ease-out hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                      aria-label={`Remover ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card-bg px-6 py-8 text-center transition-colors duration-200 ease-out hover:border-primary/60 hover:bg-card-bg-secondary cursor-pointer"
            >
              <Paperclip className="h-8 w-8 text-text-muted" />
              <span className="text-sm text-text-secondary">Clique para anexar referências do cliente</span>
              <span className="text-xs text-text-muted">PDF, PNG, JPG ou JPEG</span>
            </button>
          )}

          <div className="mt-5">
            <label htmlFor="receptionNotes" className="mb-1.5 block text-sm font-medium text-text-muted">
              Instruções para a designer
            </label>
            <textarea
              id="receptionNotes"
              rows={4}
              placeholder="Informações adicionais, combinados com o cliente ou pontos de atenção para a criação da arte..."
              {...register('receptionNotes')}
              className={cn(
                textareaBaseClass,
                'min-h-20 resize-y',
                errors.receptionNotes && errorInputClass
              )}
            />
            {errors.receptionNotes && (
              <p className="mt-1.5 text-xs text-red-600">{errors.receptionNotes.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Secao: Etapas de Producao */}
      <fieldset>
        <legend className="mb-4 text-base font-semibold text-text-primary">Etapas de Produção</legend>
        <div className="grid gap-3 md:grid-cols-3">
          <label
            htmlFor="requiresPrinting"
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors duration-200 ease-out',
              isBlueTheme
                ? 'border-border bg-card-bg hover:border-primary/60 hover:bg-card-bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50'
            )}
          >
            <input
              id="requiresPrinting"
              type="checkbox"
              {...register('requiresPrinting')}
              className={cn(
                'h-4 w-4 rounded border focus:ring-primary/30',
                isBlueTheme
                  ? 'border-border bg-card-bg accent-slate-400 checked:bg-slate-500'
                  : 'border-slate-300 bg-white accent-cyan-600 checked:bg-cyan-500 focus:ring-cyan-500/30'
              )}
            />
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                  isBlueTheme ? 'bg-transparent text-text-muted' : 'bg-purple-50 text-purple-600'
                )}
              >
                <Printer className="h-4 w-4" />
              </span>
              <p className={cn('text-sm font-medium', isBlueTheme ? 'text-text-secondary' : 'text-gray-900')}>
                Impressão
              </p>
            </div>
          </label>

          <label
            htmlFor="requiresAssembly"
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors duration-200 ease-out',
              isBlueTheme
                ? 'border-border bg-card-bg hover:border-primary/60 hover:bg-card-bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50'
            )}
          >
            <input
              id="requiresAssembly"
              type="checkbox"
              {...register('requiresAssembly')}
              className={cn(
                'h-4 w-4 rounded border focus:ring-primary/30',
                isBlueTheme
                  ? 'border-border bg-card-bg accent-slate-400 checked:bg-slate-500'
                  : 'border-slate-300 bg-white accent-cyan-600 checked:bg-cyan-500 focus:ring-cyan-500/30'
              )}
            />
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                  isBlueTheme ? 'bg-transparent text-text-muted' : 'bg-amber-50 text-amber-600'
                )}
              >
                <Wrench className="h-4 w-4" />
              </span>
              <p className={cn('text-sm font-medium', isBlueTheme ? 'text-text-secondary' : 'text-gray-900')}>
                Montagem
              </p>
            </div>
          </label>

          <label
            htmlFor="requiresInstallation"
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors duration-200 ease-out',
              isBlueTheme
                ? 'border-border bg-card-bg hover:border-primary/60 hover:bg-card-bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50'
            )}
          >
            <input
              id="requiresInstallation"
              type="checkbox"
              {...register('requiresInstallation')}
              className={cn(
                'h-4 w-4 rounded border focus:ring-primary/30',
                isBlueTheme
                  ? 'border-border bg-card-bg accent-slate-400 checked:bg-slate-500'
                  : 'border-slate-300 bg-white accent-cyan-600 checked:bg-cyan-500 focus:ring-cyan-500/30'
              )}
            />
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                  isBlueTheme ? 'bg-transparent text-text-muted' : 'bg-emerald-50 text-emerald-600'
                )}
              >
                <MapPin className="h-4 w-4" />
              </span>
              <p className={cn('text-sm font-medium', isBlueTheme ? 'text-text-secondary' : 'text-gray-900')}>
                Instalação
              </p>
            </div>
          </label>
        </div>

        {requiresInstallation && (
          <div className="mt-5 rounded-xl border border-primary/40 bg-primary/5 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Dados da Instalação</h3>
              <p className="mt-1 text-xs text-text-secondary">
                Essas informações serão usadas no resumo impresso para a equipe de instalação.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="installationStreet"
                  className="mb-1.5 block text-sm font-medium text-text-muted"
                >
                  Rua <span className="ml-0.5 text-primary">*</span>
                </label>
                <input
                  id="installationStreet"
                  type="text"
                  placeholder="Ex: Rua das Flores"
                  {...register('installationStreet')}
                  className={cn(inputBaseClass, errors.installationStreet && errorInputClass)}
                />
                {errors.installationStreet && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationStreet.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="installationNeighborhood"
                  className="mb-1.5 block text-sm font-medium text-text-muted"
                >
                  Bairro <span className="ml-0.5 text-primary">*</span>
                </label>
                <input
                  id="installationNeighborhood"
                  type="text"
                  placeholder="Ex: Centro"
                  {...register('installationNeighborhood')}
                  className={cn(inputBaseClass, errors.installationNeighborhood && errorInputClass)}
                />
                {errors.installationNeighborhood && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationNeighborhood.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="installationNumber"
                  className="mb-1.5 block text-sm font-medium text-text-muted"
                >
                  Número <span className="ml-0.5 text-primary">*</span>
                </label>
                <input
                  id="installationNumber"
                  type="text"
                  placeholder="Ex: 123"
                  {...register('installationNumber')}
                  className={cn(inputBaseClass, errors.installationNumber && errorInputClass)}
                />
                {errors.installationNumber && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationNumber.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="installationCity"
                  className="mb-1.5 block text-sm font-medium text-text-muted"
                >
                  Cidade <span className="ml-0.5 text-primary">*</span>
                </label>
                <input
                  id="installationCity"
                  type="text"
                  placeholder="Ex: Sao Paulo"
                  {...register('installationCity')}
                  className={cn(inputBaseClass, errors.installationCity && errorInputClass)}
                />
                {errors.installationCity && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationCity.message}</p>
                )}
              </div>

            </div>
          </div>
        )}
      </fieldset>

      {/* Botoes */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (requiresAdminApprovalForDiscount && !adminApprovedForDiscount)}
          className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-out shadow-sm cursor-pointer"
        >
          {isSubmitting ? 'Salvando...' : 'Criar Orcamento'}
        </button>
      </div>
    </form>
  );
}
