import type { Product, ProductMaterial } from '@/types/product';

type QuoteMeasurementUnit = 'cm' | 'mm' | 'm';

function toMeters(value: number, unit: QuoteMeasurementUnit): number {
  if (unit === 'm') return value;
  if (unit === 'cm') return value / 100;
  if (unit === 'mm') return value / 1000;
  return value;
}

function parseNumber(str: string): number {
  const n = parseFloat(String(str).replace(',', '.').trim());
  return Number.isFinite(n) ? n : 0;
}

export interface QuotePriceParams {
  width?: string;
  height?: string;
  quoteMeasurementUnit?: QuoteMeasurementUnit;
  quantity?: number;
  selectedFinishingIds?: string[];
}

/**
 * Calcula preço do orçamento: Produto → Material → Dimensão/Qtd → Acabamentos.
 * Usa o material selecionado (preço/custo do productMaterial) e soma acabamentos selecionados.
 */
export function calculateQuotePrice(
  product: Product,
  productMaterial: ProductMaterial | null,
  params: QuotePriceParams
): { subtotal: number; finishingsTotal: number; total: number } {
  const {
    width = '',
    height = '',
    quoteMeasurementUnit = 'cm',
    quantity = 1,
    selectedFinishingIds = [],
  } = params;

  const price = productMaterial?.price ?? 0;
  const cost = productMaterial?.cost ?? 0;

  let subtotal = 0;

  switch (product.calculationType) {
    case 'por_area': {
      const w = parseNumber(width);
      const h = parseNumber(height);
      if (w <= 0 || h <= 0) {
        subtotal = cost;
        break;
      }
      const wM = toMeters(w, quoteMeasurementUnit);
      const hM = toMeters(h, quoteMeasurementUnit);
      const areaM2 = wM * hM;
      subtotal = areaM2 * price;
      break;
    }
    case 'por_quantidade':
    case 'por_unidade':
      subtotal = price * quantity;
      break;
    default:
      subtotal = price;
  }

  const withCostMin = Math.max(subtotal, cost);
  subtotal = Math.round(withCostMin * 100) / 100;

  const selectedFinishings = (product.finishings ?? []).filter((f) =>
    selectedFinishingIds.includes(f.id)
  );
  const finishingsTotal = selectedFinishings.reduce((sum, f) => sum + (f.priceExtra ?? 0), 0);
  const total = Math.round((subtotal + finishingsTotal) * 100) / 100;

  return { subtotal, finishingsTotal, total };
}

/**
 * @deprecated Use calculateQuotePrice com productMaterial.
 * Mantido para compatibilidade durante migração.
 */
export function calculateProductPrice(
  product: {
    calculationType: Product['calculationType'];
    basePrice?: number;
    minProductionCost?: number;
    minQuantity?: number;
  },
  params: QuotePriceParams
): number {
  const basePrice = product.basePrice ?? 0;
  const minProductionCost = product.minProductionCost ?? 0;
  const { width = '', height = '', quoteMeasurementUnit = 'cm', quantity = 1 } = params;

  let calculated = 0;

  switch (product.calculationType) {
    case 'por_area': {
      const w = parseNumber(width);
      const h = parseNumber(height);
      if (w <= 0 || h <= 0) return minProductionCost;
      const wM = toMeters(w, quoteMeasurementUnit);
      const hM = toMeters(h, quoteMeasurementUnit);
      calculated = wM * hM * basePrice;
      break;
    }
    case 'por_quantidade':
    case 'por_unidade':
      calculated = basePrice * quantity;
      break;
    default:
      calculated = basePrice;
  }

  return Math.round(Math.max(calculated, minProductionCost) * 100) / 100;
}

export function convertToMeters(value: number, unit: QuoteMeasurementUnit): number {
  return toMeters(value, unit);
}

export interface QuotePRDPriceParams extends QuotePriceParams {
  /**
   * `costBlocks[].id` -> `costBlockOption.id`
   * para calcular os custos reais do PRD.
   */
  selectedCostBlockOptionIds?: Record<string, string>;

  /**
   * Quando um bloco de "Material por metro" estiver com `calc=manual`,
   * o atendente informa a metragem/perímetro estimado manualmente (em metros).
   */
  manualMetroPerimetersByBlockId?: Record<string, number>;
}

/**
 * Calcula preço do PRD (regras 3.1 e 3.2) usando:
 * - `product.costBlocks` (opções por bloco com custo real)
 * - `product.priceTiers` (faixas de preço para terceirizado por quantidade)
 * - `product.marginPercent`
 *
 * Para migração gradual, use este cálculo quando `product.costBlocks` e/ou
 * `product.priceTiers` estiverem presentes.
 */
export function calculateQuotePricePRD(
  product: Product,
  params: QuotePRDPriceParams
): { subtotal: number; finishingsTotal: number; total: number } {
  const {
    width = '',
    height = '',
    quoteMeasurementUnit = 'cm',
    quantity = 1,
    selectedCostBlockOptionIds = {},
    manualMetroPerimetersByBlockId = {},
  } = params;

  const billingType = product.billingType;
  const marginPercent =
    typeof product.marginPercent === 'number' ? product.marginPercent : product.defaultMarginPercent ?? 0;

  const blocks = product.costBlocks ?? [];
  const tiers = product.priceTiers ?? [];

  const w = parseNumber(width);
  const h = parseNumber(height);
  const wM = toMeters(w, quoteMeasurementUnit);
  const hM = toMeters(h, quoteMeasurementUnit);
  const areaM2 = wM * hM;
  let perimeterM = 2 * (wM + hM);

  // Para billing "METRO" o sistema ignora largura/altura e usa o input de "metragem linear"
  // (representado aqui por `quantity`) como perímetro estimado.
  if (billingType === 'metro_linear') {
    perimeterM = Number.isFinite(quantity) ? quantity : 0;
  }

  let costMaterial = 0;
  let costMetro = 0;
  let costEnergy = 0;
  let costFixed = 0;

  const pickValueForBlock = (blockId: string): number => {
    const optId = selectedCostBlockOptionIds[blockId];
    const block = blocks.find((b) => b.id === blockId);
    const opt = block?.options?.find((o) => o.id === optId);
    // Suporta diferentes formatos vindo da API/cadastro:
    // - { label, value } (modelo atual)
    // - { nome, custo } (formato legado / do backend)
    const anyOpt = opt as unknown as { value?: unknown; custo?: unknown };
    const maybeValue = anyOpt?.value;
    if (typeof maybeValue === 'number') return maybeValue;
    const maybeCusto = anyOpt?.custo;
    if (typeof maybeCusto === 'number') return maybeCusto;
    return 0;
  };

  const getCostPerMetro = (blockId: string): number => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return 0;

    const custoRolo = block.custoRolo;
    const tamanhoRolo = block.tamanhoRolo;
    if (
      typeof custoRolo === 'number' &&
      Number.isFinite(custoRolo) &&
      typeof tamanhoRolo === 'number' &&
      Number.isFinite(tamanhoRolo) &&
      tamanhoRolo > 0
    ) {
      return Math.round((custoRolo / tamanhoRolo) * 100) / 100;
    }

    // Fallback: usa o valor da opção (quando existir).
    return pickValueForBlock(blockId);
  };

  const getPerimetroEstimadoForMetroBlock = (blockId: string, calc?: unknown): number => {
    const safeCalc = typeof calc === 'string' ? calc : 'perimetro';
    const dimsAvailable = wM > 0 || hM > 0;

    // Se o produto for cobrado por "metro linear", não temos L/A na UI.
    // Para evitar custo zerado, usamos o `perimeterM` calculado a partir do `quantity`.
    if (billingType === 'metro_linear' && !dimsAvailable) {
      return perimeterM;
    }

    switch (safeCalc) {
      case 'perimetro':
        return 2 * (wM + hM);
      case 'largura2':
        return 2 * wM;
      case 'largura1':
        return wM;
      case 'altura2':
        return 2 * hM;
      case 'manual':
        return manualMetroPerimetersByBlockId[blockId] ?? 0;
      default:
        return perimeterM;
    }
  };

  // Caso: por quantidade (faixa do fornecedor + extras fixos)
  if (billingType === 'quantidade') {
    const q = quantity;
    const tier = tiers.find(
      (t) => q >= t.quantityFrom && (t.quantityTo === null || q <= t.quantityTo)
    );
    const baseCost = tier?.cost ?? 0;

    for (const block of blocks) {
      if (block.blockType === 'custo_fixo') {
        costFixed += pickValueForBlock(block.id);
      }
    }

    const subtotal = baseCost + costFixed;
    const total = Math.round(subtotal * (1 + marginPercent / 100) * 100) / 100;
    return { subtotal, finishingsTotal: costFixed, total };
  }

  // Caso: produção própria / demais billingTypes (usa custos por blocos)
  for (const block of blocks) {
    switch (block.blockType) {
      case 'material_m2':
        {
          const v = pickValueForBlock(block.id);
          if (areaM2 > 0) costMaterial += areaM2 * v;
        }
        break;
      case 'material_metro':
        {
          const perimetroEstimado = getPerimetroEstimadoForMetroBlock(block.id, block.calc);
          const costPerMetro = getCostPerMetro(block.id);
          if (perimetroEstimado > 0 && costPerMetro > 0) costMetro += perimetroEstimado * costPerMetro;
        }
        break;
      case 'energia_maquina':
        // Assumimos coerência com o PRD do exemplo: energia como custo por m².
        {
          const v = pickValueForBlock(block.id);
          if (areaM2 > 0) costEnergy += areaM2 * v;
        }
        break;
      case 'custo_fixo':
        // Aplicado uma vez por orçamento.
        {
          const v = pickValueForBlock(block.id);
          costFixed += v;
        }
        break;
    }
  }

  const subtotal = costMaterial + costMetro + costEnergy + costFixed;
  const total = Math.round(subtotal * (1 + marginPercent / 100) * 100) / 100;

  return { subtotal, finishingsTotal: costFixed, total };
}
