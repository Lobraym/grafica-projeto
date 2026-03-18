import { generateId } from '@/lib/utils';
import type { CostBlock, PriceTier, Product } from '@/types/product';

type BillingBadge = 'm2' | 'quantidade';

export interface ProductTemplateCard {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly icone: string;
  readonly cobrancaBadge: BillingBadge;
}

type TemplateInput = {
  readonly nome: string;
  readonly tipo: Product['productType'];
  readonly cobranca: 'M2' | 'QTD';
  readonly areaMinima?: number;
  readonly margem: number;
  readonly icone: string;
  readonly descricao: string;
  readonly fornecedor?: string;
  readonly faixasPreco?: Array<{ quantidade: number; custo: number }>;
  readonly blocos: Array<{
    readonly nome: string;
    readonly tipo: 'M2' | 'METRO' | 'FIXO';
    readonly temOpcoes: boolean;
    readonly opcoes?: Array<{ nome: string; custo: number }>;
    // METRO (temOpcoes: false)
    readonly calc?: string;
    readonly custoRolo?: number;
    readonly tamanhoRolo?: number;
  }>;
};

function billingTypeFromTemplate(cobranca: TemplateInput['cobranca']): Product['billingType'] {
  if (cobranca === 'M2') return 'm2';
  return 'quantidade';
}

function toOptionUnit(blockType: CostBlock['blockType']): string {
  switch (blockType) {
    case 'material_m2':
      return 'm2';
    case 'material_metro':
      return 'metro';
    case 'custo_fixo':
      return 'unidade';
    case 'energia_maquina':
      return 'hora';
    default:
      return 'unidade';
  }
}

function mapBlockToCostBlocks(template: TemplateInput): CostBlock[] {
  return template.blocos
    .map((b) => {
      const blockType: CostBlock['blockType'] =
        b.tipo === 'M2' ? 'material_m2' : b.tipo === 'FIXO' ? 'custo_fixo' : 'material_metro';

      // METRO (temOpcoes: false): wizard precisa de 1 opção mesmo se temOpcoes=false
      if (b.tipo === 'METRO') {
        const custoRolo = b.custoRolo ?? 0;
        const tamanhoRolo = b.tamanhoRolo ?? 1;
        const custoPorMetro = tamanhoRolo > 0 ? custoRolo / tamanhoRolo : 0;

        return {
          id: generateId(),
          name: b.nome,
          blockType,
          temOpcoes: false,
          custoRolo,
          tamanhoRolo,
          calc: b.calc as CostBlock['calc'],
          options: [
            {
              id: generateId(),
              label: 'Padrão',
              unit: toOptionUnit(blockType),
              value: Math.round(custoPorMetro * 100) / 100,
            },
          ],
        };
      }

      // M2 / FIXO com opções
      const options = (b.opcoes ?? []).map((opt) => ({
        id: generateId(),
        label: opt.nome,
        unit: toOptionUnit(blockType),
        value: opt.custo,
      }));

      // Garante que o wizard não quebra mesmo se alguma opção vier vazia.
      return {
        id: generateId(),
        name: b.nome,
        blockType,
        options: options.length
          ? options
          : [
              {
                id: generateId(),
                label: 'Padrão',
                unit: toOptionUnit(blockType),
                value: 0,
              },
            ],
      };
    })
    .filter(Boolean);
}

function mapFaixasToPriceTiers(params: {
  readonly fornecedor: string;
  readonly faixasPreco: Array<{ quantidade: number; custo: number }>;
}): PriceTier[] {
  const sorted = [...params.faixasPreco].sort((a, b) => a.quantidade - b.quantidade);
  if (sorted.length === 0) return [];

  return sorted.map((tier, idx) => {
    const next = sorted[idx + 1];
    const quantityTo = typeof next?.quantidade === 'number' ? next.quantidade - 1 : null;
    return {
      id: generateId(),
      quantityFrom: tier.quantidade,
      quantityTo: quantityTo != null ? quantityTo : null,
      supplier: params.fornecedor,
      cost: tier.custo,
    };
  });
}

const TEMPLATE_INPUTS: Record<string, TemplateInput> = {
  banner: {
    nome: 'Banner',
    tipo: 'proprio',
    cobranca: 'M2',
    areaMinima: 0.5,
    margem: 45,
    icone: '🖼️',
    descricao: 'Lona impressa com madeira e perfil',
    blocos: [
      {
        nome: 'Lona impressa',
        tipo: 'M2',
        temOpcoes: true,
        opcoes: [
          { nome: 'Fosca', custo: 12 },
          { nome: 'Brilho', custo: 15 },
        ],
      },
    ],
  },

  placa_lona: {
    nome: 'Placa de Lona',
    tipo: 'proprio',
    cobranca: 'M2',
    areaMinima: 0.5,
    margem: 45,
    icone: '🪧',
    descricao: 'Lona com metalon e cantoneira',
    blocos: [
      {
        nome: 'Lona',
        tipo: 'M2',
        temOpcoes: true,
        opcoes: [
          { nome: 'Fosca', custo: 12 },
          { nome: 'Brilho', custo: 15 },
          { nome: 'Blacklight', custo: 28 },
        ],
      },
      {
        nome: 'Metalon',
        tipo: 'METRO',
        temOpcoes: false,
        calc: 'perimetro',
        custoRolo: 36,
        tamanhoRolo: 6,
      },
      {
        nome: 'Cantoneira',
        tipo: 'METRO',
        temOpcoes: false,
        calc: 'largura2',
        custoRolo: 30,
        tamanhoRolo: 6,
      },
      {
        nome: 'Acabamento',
        tipo: 'FIXO',
        temOpcoes: true,
        opcoes: [
          { nome: 'Ilhós', custo: 5 },
          { nome: 'Sem acabamento', custo: 0 },
        ],
      },
    ],
  },

  adesivo: {
    nome: 'Adesivo',
    tipo: 'proprio',
    cobranca: 'M2',
    areaMinima: 0.1,
    margem: 50,
    icone: '🏷️',
    descricao: 'Adesivo impresso por m²',
    blocos: [
      {
        nome: 'Vinil adesivo',
        tipo: 'M2',
        temOpcoes: true,
        opcoes: [
          { nome: 'Brilho', custo: 18 },
          { nome: 'Fosco', custo: 22 },
          { nome: 'Transparente', custo: 25 },
        ],
      },
    ],
  },

  cartao_visita: {
    nome: 'Cartão de Visita',
    tipo: 'terceirizado',
    cobranca: 'QTD',
    margem: 30,
    icone: '📇',
    descricao: 'Terceirizado — tabela por quantidade',
    fornecedor: 'Zap Gráfica',
    faixasPreco: [
      { quantidade: 100, custo: 28 },
      { quantidade: 250, custo: 42 },
      { quantidade: 500, custo: 65 },
      { quantidade: 1000, custo: 98 },
    ],
    blocos: [
      {
        nome: 'Acabamento',
        tipo: 'FIXO',
        temOpcoes: true,
        opcoes: [
          { nome: 'Laminação Fosca', custo: 0 },
          { nome: 'Laminação Brilho', custo: 0 },
          { nome: 'Verniz UV', custo: 15 },
        ],
      },
      {
        nome: 'Impressão',
        tipo: 'FIXO',
        temOpcoes: true,
        opcoes: [
          { nome: 'Só frente', custo: 0 },
          { nome: 'Frente e verso', custo: 20 },
        ],
      },
    ],
  },

  flyer: {
    nome: 'Flyer',
    tipo: 'terceirizado',
    cobranca: 'QTD',
    margem: 30,
    icone: '📄',
    descricao: 'Terceirizado — tabela por quantidade',
    fornecedor: 'Zap Gráfica',
    faixasPreco: [
      { quantidade: 500, custo: 45 },
      { quantidade: 1000, custo: 65 },
      { quantidade: 2000, custo: 90 },
      { quantidade: 5000, custo: 160 },
    ],
    blocos: [
      {
        nome: 'Formato',
        tipo: 'FIXO',
        temOpcoes: true,
        opcoes: [
          { nome: 'A5 (148×210mm)', custo: 0 },
          { nome: 'A6 (105×148mm)', custo: 0 },
        ],
      },
    ],
  },

  lona_simples: {
    nome: 'Lona Simples',
    tipo: 'proprio',
    cobranca: 'M2',
    areaMinima: 1,
    margem: 40,
    icone: '🖨️',
    descricao: 'Impressão de lona sem estrutura',
    blocos: [
      {
        nome: 'Lona',
        tipo: 'M2',
        temOpcoes: true,
        opcoes: [
          { nome: 'Fosca', custo: 12 },
          { nome: 'Brilho', custo: 15 },
        ],
      },
    ],
  },
};

export const PRODUCT_TEMPLATES: readonly ProductTemplateCard[] = [
  {
    id: 'banner',
    nome: 'Banner',
    descricao: 'Lona impressa com madeira e perfil',
    icone: TEMPLATE_INPUTS.banner.icone,
    cobrancaBadge: 'm2',
  },
  {
    id: 'placa_lona',
    nome: 'Placa de Lona',
    descricao: 'Lona com metalon e cantoneira',
    icone: TEMPLATE_INPUTS.placa_lona.icone,
    cobrancaBadge: 'm2',
  },
  {
    id: 'adesivo',
    nome: 'Adesivo',
    descricao: 'Adesivo impresso por m²',
    icone: TEMPLATE_INPUTS.adesivo.icone,
    cobrancaBadge: 'm2',
  },
] as const;

export function buildTemplateInitialData(templateId: string): Partial<Product> | null {
  const t = TEMPLATE_INPUTS[templateId];
  if (!t) return null;

  const billingType = billingTypeFromTemplate(t.cobranca);
  const minArea = typeof t.areaMinima === 'number' ? t.areaMinima : null;
  const marginPercent = t.margem;

  const costBlocks = mapBlockToCostBlocks(t);

  const priceTiers: PriceTier[] =
    billingType === 'quantidade' && t.fornecedor && t.faixasPreco
      ? mapFaixasToPriceTiers({ fornecedor: t.fornecedor, faixasPreco: t.faixasPreco })
      : [];

  return {
    name: t.nome,
    productType: t.tipo,
    billingType,
    minArea,
    marginPercent,
    active: true,
    costBlocks,
    priceTiers,
  };
}

