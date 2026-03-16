'use client';

import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { RecentQuotesTable } from '@/components/dashboard/RecentQuotesTable';
import { ProductionOverview } from '@/components/dashboard/ProductionOverview';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatCurrency } from '@/lib/utils';

const MonthlyRevenueChart = dynamic(
  () => import('@/components/dashboard/charts/MonthlyRevenueChart').then((m) => m.MonthlyRevenueChart),
  { ssr: false },
);

const StatusDistributionChart = dynamic(
  () => import('@/components/dashboard/charts/StatusDistributionChart').then((m) => m.StatusDistributionChart),
  { ssr: false },
);

const RevenueTrendChart = dynamic(
  () => import('@/components/dashboard/charts/RevenueTrendChart').then((m) => m.RevenueTrendChart),
  { ssr: false },
);

const ProductionPipelineChart = dynamic(
  () => import('@/components/dashboard/charts/ProductionPipelineChart').then((m) => m.ProductionPipelineChart),
  { ssr: false },
);

export default function DashboardPage(): React.ReactElement {
  const data = useDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Visão geral do negócio" />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Clientes"
          value={String(data.totalClients)}
          icon={Users}
          iconBgClass="bg-cyan-50 text-cyan-600"
        />
        <KPICard
          title="Orçamentos"
          value={String(data.totalQuotes)}
          icon={FileText}
          iconBgClass="bg-amber-50 text-amber-600"
        />
        <KPICard
          title="Receita Total"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          iconBgClass="bg-emerald-50 text-emerald-600"
        />
        <KPICard
          title="Ticket Médio"
          value={data.totalQuotes > 0 ? formatCurrency(data.averageTicket) : 'R$ 0,00'}
          icon={TrendingUp}
          iconBgClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={data.monthlyRevenue} />
        </div>
        <StatusDistributionChart data={data.statusDistribution} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueTrendChart data={data.monthlyRevenue} />
        <ProductionPipelineChart data={data.productionPipeline} />
      </div>

      {/* Bottom */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentQuotesTable quotes={data.recentQuotes} />
        </div>
        <ProductionOverview data={data.productionPipeline} />
      </div>
    </div>
  );
}
