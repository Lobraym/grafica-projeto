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

/**
 * Modelagem alinhada ao PRD (cadastro de produto wizard).
 * Mantemos compatibilidade com o modelo legado (category/calculationType/etc.)
 * adicionando estas propriedades como opcionais no `Product`.
 */
export type ProductType = 'proprio' | 'terceirizado';
export type BillingType = 'm2' | 'quantidade' | 'unidade' | 'metro_linear';
export type CostBlockType = 'material_m2' | 'material_metro' | 'custo_fixo' | 'energia_maquina';

export type CostBlockOptionUnit =
  | 'm2'
  | 'metro'
  | 'unidade'
  | 'peça'
  | 'hora';

export interface CostBlockOption {
  readonly id: string;
  /**
   * Ex.: Fosca, Brilho, Blacklight (ou qualquer variação do bloco).
   */
  label: string;
  /**
   * Unidade do valor (R$/m², R$/m, R$/peça, R$/hora etc.)
   */
  unit: CostBlockOptionUnit | string;
  /**
   * Valor de custo real do PRD (não é "acréscimo", é o custo por unidade).
   */
  value: number;
}

export interface CostBlock {
  readonly id: string;
  /**
   * Ex.: Lona, Metalon, Impressão (energia/máquina), Acabamento (custo fixo)
   */
  name: string;
  blockType: CostBlockType;
  /**
   * Opções/variações do bloco com custo próprio real.
   */
  options: CostBlockOption[];

  /**
   * Quando `false`, a UI do orçamento não deve renderizar opções deste bloco.
   * Usado principalmente para blocos de "Material por metro".
   */
  temOpcoes?: boolean;

  /**
   * Campos específicos do bloco de "Material por metro".
   */
  custoRolo?: number;
  tamanhoRolo?: number;
  calc?: 'perimetro' | 'largura2' | 'largura1' | 'altura2' | 'manual';
}

export interface PriceTier {
  readonly id: string;
  /**
   * Faixa de quantidade.
   * Ex.: 100-249, 250-499, 500-999...
   */
  quantityFrom: number;
  /**
   * `null` para "sem limite superior" (última faixa).
   */
  quantityTo: number | null;
  supplier: string;
  /**
   * Custo real do fornecedor para a faixa.
   */
  cost: number;
}

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
  /**
   * Organização do produto em um grupo (módulo de cadastro por cards).
   * `null`/`undefined` => “Sem grupo”.
   */
  groupId?: string | null;
  /**
   * URL/path da foto do produto para thumbnail no grid.
   * `null`/`undefined` => sem foto (a UI mostra placeholder).
   */
  photoUrl?: string | null;
  /**
   * Campos legados (compatibilidade com o módulo antigo).
   * Quando o wizard do PRD estiver em uso, estes podem ficar `undefined`.
   */
  category?: ProductCategory;
  description?: string;
  calculationType?: CalculationType;
  measurementUnit?: ProductMeasurementUnit;
  /** Materiais que este produto pode usar, com preço/custo/margem por material */
  productMaterials?: ProductMaterial[];
  /** Acabamentos disponíveis com valor extra */
  finishings?: ProductFinishing[];
  /** Apenas para tipo "por quantidade" */
  minQuantity?: number | null;
  /** Margem padrão quando o material não define */
  defaultMarginPercent?: number;
  status?: ProductStatus;
  createdAt: string;
  updatedAt: string;

  /**
   * Campos do PRD (wizard).
   * Se presentes, devem ser usados pela recepção/desenho para cálculo do orçamento.
   */
  productType?: ProductType;
  billingType?: BillingType;
  minArea?: number | null;
  marginPercent?: number;
  active?: boolean;
  costBlocks?: CostBlock[];
  priceTiers?: PriceTier[];
}

export interface ProductFormData {
  name: string;
  groupId?: string | null;
  photoUrl?: string | null;
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
