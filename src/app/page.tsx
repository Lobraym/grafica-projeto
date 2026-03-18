'use client';

import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1376px] flex flex-col gap-6">
        <header className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
            <p className="text-sm text-slate-500 mt-1">Acompanhe as métricas e produção da gráfica.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-semibold border border-cyan-500/20">
              GP
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard
          title="Total Clientes"
          value={String(data.totalClients)}
          icon={Users}
          iconBgClass="bg-cyan-50 text-cyan-500"
        />
        <KPICard
          title="Orçamentos"
          value={String(data.totalQuotes)}
          icon={FileText}
          iconBgClass="bg-amber-50 text-amber-500"
        />
        <KPICard
          title="Receita Total"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          iconBgClass="bg-emerald-50 text-emerald-500"
        />
        <KPICard
          title="Ticket Médio"
          value={data.totalQuotes > 0 ? formatCurrency(data.averageTicket) : 'R$ 0,00'}
          icon={TrendingUp}
          iconBgClass="bg-purple-50 text-purple-500"
        />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthlyRevenueChart data={data.monthlyRevenue} />
          </div>
          <StatusDistributionChart data={data.statusDistribution} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendChart data={data.monthlyRevenue} />
          <ProductionPipelineChart data={data.productionPipeline} />
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          <div className="lg:col-span-2">
            <RecentQuotesTable quotes={data.recentQuotes} />
          </div>
          <ProductionOverview data={data.productionPipeline} />
        </div>
      </div>
    </div>
  );
}
