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

export type FinalProductionTab = 'impressao' | 'montagem' | 'instalacao';

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
  pendente: 'bg-[rgba(59,130,246,0.08)] text-[rgb(59,130,246)] border border-[rgba(59,130,246,0.2)]',
  producao_arte: 'bg-[rgba(249,115,22,0.08)] text-[rgb(249,115,22)] border border-[rgba(249,115,22,0.2)]',
  aguardando_aprovacao:
    'bg-[rgba(245,158,11,0.08)] text-[rgb(245,158,11)] border border-[rgba(245,158,11,0.2)]',
  em_producao: 'bg-[rgba(6,182,212,0.08)] text-[rgb(6,182,212)] border border-[rgba(6,182,212,0.2)]',
  pronto: 'bg-[rgba(16,185,129,0.08)] text-[rgb(16,185,129)] border border-[rgba(16,185,129,0.2)]',
  entregue: 'bg-[rgba(100,116,139,0.08)] text-[rgb(100,116,139)] border border-[rgba(100,116,139,0.2)]',
} as const;

export const STATUS_DOTS: Record<QuoteStatus, string> = {
  pendente: 'bg-[rgb(59,130,246)]',
  producao_arte: 'bg-[rgb(249,115,22)]',
  aguardando_aprovacao: 'bg-[rgb(245,158,11)]',
  em_producao: 'bg-[rgb(6,182,212)]',
  pronto: 'bg-[rgb(16,185,129)]',
  entregue: 'bg-[rgb(100,116,139)]',
} as const;
