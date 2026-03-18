export const METRIC_COLORS = {
  totalClients: {
    base: 'var(--metric-total-clients, #06b6d4)',
    hover: 'var(--metric-total-clients-hover, #22d3ee)',
  },
  quotes: {
    base: 'var(--metric-quotes, #f59e0b)',
    hover: 'var(--metric-quotes-hover, #fbbf24)',
  },
  totalRevenue: {
    base: 'var(--metric-total-revenue, #10b981)',
    hover: 'var(--metric-total-revenue-hover, #34d399)',
  },
  averageTicket: {
    base: 'var(--metric-average-ticket, #8b5cf6)',
    hover: 'var(--metric-average-ticket-hover, #a78bfa)',
  },
} as const;

export type QuoteStatusKey =
  | 'pending'
  | 'art'
  | 'approval'
  | 'production'
  | 'ready'
  | 'delivered';

export const STATUS_COLORS: Record<
  QuoteStatusKey,
  { dot: string; text: string; badgeBg: string; badgeBorder: string }
> = {
  pending: {
    dot: '#3b82f6',
    text: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.08)',
    badgeBorder: 'rgba(59, 130, 246, 0.2)',
  },
  art: {
    dot: '#f97316',
    text: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.08)',
    badgeBorder: 'rgba(249, 115, 22, 0.2)',
  },
  approval: {
    dot: '#f59e0b',
    text: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.08)',
    badgeBorder: 'rgba(245, 158, 11, 0.2)',
  },
  production: {
    dot: '#06b6d4',
    text: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.08)',
    badgeBorder: 'rgba(6, 182, 212, 0.2)',
  },
  ready: {
    dot: '#10b981',
    text: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.08)',
    badgeBorder: 'rgba(16, 185, 129, 0.2)',
  },
  delivered: {
    dot: '#64748b',
    text: '#64748b',
    badgeBg: 'rgba(100, 116, 139, 0.08)',
    badgeBorder: 'rgba(100, 116, 139, 0.2)',
  },
};

