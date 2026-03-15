import type { ProductCategory, CalculationType, ProductMeasurementUnit } from '@/types/product';

export const PRODUCT_CATEGORIES: ReadonlyArray<{ value: ProductCategory; label: string }> = [
  { value: 'comunicacao_visual', label: 'Comunicação Visual' },
  { value: 'impressao_digital', label: 'Impressão Digital' },
];

export const CALCULATION_TYPES: ReadonlyArray<{ value: CalculationType; label: string }> = [
  { value: 'por_area', label: 'Por área (m²)' },
  { value: 'por_quantidade', label: 'Por quantidade' },
  { value: 'por_unidade', label: 'Por unidade' },
];

export const MEASUREMENT_UNITS: ReadonlyArray<{ value: ProductMeasurementUnit; label: string }> = [
  { value: 'unidade', label: 'Unidade' },
  { value: 'm2', label: 'm²' },
  { value: 'metro_linear', label: 'Metro linear' },
  { value: 'folha', label: 'Folha' },
  { value: 'milheiro', label: 'Milheiro' },
];
