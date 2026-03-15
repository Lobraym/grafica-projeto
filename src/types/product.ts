export type ProductCategory =
  | 'comunicacao_visual'
  | 'impressao_digital';

export type CalculationType =
  | 'por_area'
  | 'por_quantidade'
  | 'por_unidade';

export type ProductMeasurementUnit =
  | 'unidade'
  | 'm2'
  | 'metro_linear'
  | 'folha'
  | 'milheiro';

export type ProductStatus = 'ativo' | 'inativo';

/** Material global: pode ser usado em vários produtos */
export interface Material {
  readonly id: string;
  name: string;
  unit: string;
  basePrice: number;
  cost: number;
  profitMarginPercent: number;
  createdAt: string;
}

/** Configuração de um material dentro de um produto (preço/custo por produto) */
export interface ProductMaterial {
  materialId: string;
  price: number;
  cost: number;
  marginPercent: number;
}

/** Acabamento com valor adicional */
export interface ProductFinishing {
  id: string;
  name: string;
  priceExtra: number;
}

export interface Product {
  readonly id: string;
  name: string;
  category: ProductCategory;
  description: string;
  calculationType: CalculationType;
  measurementUnit: ProductMeasurementUnit;
  /** Materiais que este produto pode usar, com preço/custo/margem por material */
  productMaterials: ProductMaterial[];
  /** Acabamentos disponíveis com valor extra */
  finishings: ProductFinishing[];
  /** Apenas para tipo "por quantidade" */
  minQuantity: number | null;
  /** Margem padrão quando o material não define */
  defaultMarginPercent: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  description: string;
  calculationType: CalculationType;
  measurementUnit: ProductMeasurementUnit;
  productMaterials: ProductMaterial[];
  finishings: ProductFinishing[];
  minQuantity: number | null;
  defaultMarginPercent: number;
  status: ProductStatus;
}

export interface MaterialFormData {
  name: string;
  unit?: string;
  basePrice: number;
  cost: number;
  profitMarginPercent: number;
}
