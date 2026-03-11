export type QuoteStatus =
  | 'pendente'
  | 'producao_arte'
  | 'aguardando_aprovacao'
  | 'em_producao'
  | 'pronto'
  | 'entregue';

export type PersonType = 'PF' | 'PJ';

export type ProductionStage = 'nao_iniciado' | 'disponivel' | 'em_andamento' | 'concluida';

export type ArtProductionTab = 'disponivel' | 'em_producao' | 'concluidas';

export type FinalProductionTab = 'impressao' | 'montagem';

export interface FileAttachment {
  readonly id: string;
  name: string;
  url: string;
  type: string;
}

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  pendente: 'Pendente',
  producao_arte: 'Produção de Arte',
  aguardando_aprovacao: 'Aguardando Aprovação',
  em_producao: 'Em Produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
} as const;

export const STATUS_COLORS: Record<QuoteStatus, string> = {
  pendente: 'bg-blue-100 text-blue-800',
  producao_arte: 'bg-yellow-100 text-yellow-800',
  aguardando_aprovacao: 'bg-orange-100 text-orange-800',
  em_producao: 'bg-green-100 text-green-800',
  pronto: 'bg-emerald-100 text-emerald-800',
  entregue: 'bg-gray-100 text-gray-600',
} as const;

export const STATUS_DOTS: Record<QuoteStatus, string> = {
  pendente: 'bg-blue-500',
  producao_arte: 'bg-yellow-500',
  aguardando_aprovacao: 'bg-orange-500',
  em_producao: 'bg-green-500',
  pronto: 'bg-emerald-500',
  entregue: 'bg-gray-400',
} as const;
