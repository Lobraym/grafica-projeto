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
  pendente: 'bg-sky-50 text-sky-700',
  producao_arte: 'bg-amber-50 text-amber-700',
  aguardando_aprovacao: 'bg-orange-50 text-orange-700',
  em_producao: 'bg-cyan-50 text-cyan-700',
  pronto: 'bg-emerald-50 text-emerald-700',
  entregue: 'bg-slate-100 text-slate-500',
} as const;

export const STATUS_DOTS: Record<QuoteStatus, string> = {
  pendente: 'bg-sky-500',
  producao_arte: 'bg-amber-500',
  aguardando_aprovacao: 'bg-orange-500',
  em_producao: 'bg-cyan-500',
  pronto: 'bg-emerald-500',
  entregue: 'bg-slate-400',
} as const;
