import type { Product, ProductMaterial, ProductFinishing } from '@/types/product';

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
