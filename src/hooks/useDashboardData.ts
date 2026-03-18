'use client';

import { useMemo } from 'react';
import { useClientStore } from '@/stores/useClientStore';
import { useQuoteStore } from '@/stores/useQuoteStore';
import type { QuoteStatus } from '@/types/common';
import { STATUS_LABELS } from '@/types/common';
import type { Quote } from '@/types/quote';

const STATUS_CHART_COLORS: Record<QuoteStatus, string> = {
  pendente: '#0EA5E9',
  producao_arte: '#F59E0B',
  aguardando_aprovacao: '#F97316',
  em_producao: '#06B6D4',
  pronto: '#10B981',
  entregue: '#94A3B8',
} as const;

const ALL_STATUSES: readonly QuoteStatus[] = [
  'pendente',
  'producao_arte',
  'aguardando_aprovacao',
  'em_producao',
  'pronto',
  'entregue',
] as const;

interface MonthlyRevenue {
  readonly month: string;
  readonly value: number;
}

interface StatusDistItem {
  readonly status: string;
  readonly count: number;
  readonly color: string;
}

interface PipelineStage {
  readonly available: number;
  readonly inProgress: number;
  readonly done: number;
  readonly delivered: number;
}

interface ProductionPipeline {
  readonly printing: PipelineStage;
  readonly assembly: PipelineStage;
  readonly installation: PipelineStage;
}

interface DashboardData {
  readonly totalClients: number;
  readonly totalQuotes: number;
  readonly totalRevenue: number;
  readonly averageTicket: number;
  readonly quotesByStatus: Record<QuoteStatus, number>;
  readonly recentQuotes: readonly Quote[];
  readonly monthlyRevenue: readonly MonthlyRevenue[];
  readonly productionPipeline: ProductionPipeline;
  readonly statusDistribution: readonly StatusDistItem[];
}

export type {
  DashboardData,
  MonthlyRevenue,
  StatusDistItem,
  PipelineStage,
  ProductionPipeline,
};

function countByStage(
  quotes: readonly Quote[],
  stageGetter: (q: Quote) => string | undefined,
  requiresGetter: (q: Quote) => boolean | undefined,
  deliveredQuotes: readonly Quote[],
  deliveredRequiresGetter: (q: Quote) => boolean | undefined,
): PipelineStage {
  let available = 0;
  let inProgress = 0;
  let done = 0;

  for (const q of quotes) {
    if (!requiresGetter(q)) continue;
    const stage = stageGetter(q);
    if (stage === 'disponivel') available++;
    else if (stage === 'em_andamento') inProgress++;
    else if (stage === 'concluida') done++;
  }

  let delivered = 0;
  for (const q of deliveredQuotes) {
    if (deliveredRequiresGetter(q)) delivered++;
  }

  return { available, inProgress, done, delivered } as const;
}

export function useDashboardData(): DashboardData {
  const clients = useClientStore((s) => s.clients);
  const quotes = useQuoteStore((s) => s.quotes);

  return useMemo((): DashboardData => {
    const totalClients = clients.length;
    const totalQuotes = quotes.length;
    const totalRevenue = quotes.reduce((sum, q) => sum + q.value, 0);
    const averageTicket = totalQuotes > 0 ? totalRevenue / totalQuotes : 0;

    // Quotes by status
    const quotesByStatus = {} as Record<QuoteStatus, number>;
    for (const status of ALL_STATUSES) {
      quotesByStatus[status] = 0;
    }
    for (const q of quotes) {
      quotesByStatus[q.status]++;
    }

    // Recent quotes (last 5 by createdAt desc)
    const recentQuotes = [...quotes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const months: MonthlyRevenue[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const label = monthFormatter.format(monthDate).replace('.', '');

      let monthTotal = 0;
      for (const q of quotes) {
        const qDate = new Date(q.createdAt);
        const qKey = `${qDate.getFullYear()}-${qDate.getMonth()}`;
        if (qKey === monthKey) {
          monthTotal += q.value;
        }
      }

      months.push({ month: label, value: monthTotal });
    }

    // Status distribution
    const statusDistribution: StatusDistItem[] = ALL_STATUSES
      .map((status) => ({
        status: STATUS_LABELS[status],
        count: quotesByStatus[status],
        color: STATUS_CHART_COLORS[status],
      }))
      .filter((item) => item.count > 0);

    // Production pipeline (only quotes em_producao) + entregues para a série "Entregue"
    const inProduction = quotes.filter((q) => q.status === 'em_producao');
    const deliveredQuotes = quotes.filter((q) => q.status === 'entregue');

    const productionPipeline: ProductionPipeline = {
      printing: countByStage(
        inProduction,
        (q) => q.printingStage,
        (q) => q.requiresPrinting,
        deliveredQuotes,
        (q) => q.requiresPrinting,
      ),
      assembly: countByStage(
        inProduction,
        (q) => q.assemblyStage,
        (q) => q.requiresAssembly,
        deliveredQuotes,
        (q) => q.requiresAssembly,
      ),
      installation: countByStage(
        inProduction,
        (q) => q.installationStage,
        (q) => q.requiresInstallation,
        deliveredQuotes,
        (q) => q.requiresInstallation ?? false,
      ),
    };

    return {
      totalClients,
      totalQuotes,
      totalRevenue,
      averageTicket,
      quotesByStatus,
      recentQuotes,
      monthlyRevenue: months,
      productionPipeline,
      statusDistribution,
    } as const;
  }, [clients, quotes]);
}
