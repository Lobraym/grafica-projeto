'use client';

import dynamic from 'next/dynamic';
import type { Props as ChartProps } from 'react-apexcharts';
import type { MonthlyRevenue } from '@/hooks/useDashboardData';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface MonthlyRevenueChartProps {
  readonly data: readonly MonthlyRevenue[];
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps): React.ReactElement {
  const categories = data.map((d) => d.month);
  const values = data.map((d) => d.value);

  const chartOptions: ChartProps['options'] = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      selection: { enabled: false },
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      animations: {
        enabled: true,
        speed: 600,
        animateGradually: { enabled: true, delay: 80 },
        dynamicAnimation: { enabled: true, speed: 300 },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '50%',
      },
    },
    colors: ['#0891B2'],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '12px',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '12px',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        },
        formatter: (val: number): string =>
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val),
      },
    },
    grid: {
      borderColor: 'rgba(148, 163, 184, 0.2)',
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val: number): string =>
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(val),
      },
    },
  };

  const series: ChartProps['series'] = [
    { name: 'Receita', data: values },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col h-[400px]">
      <h3 className="text-sm font-semibold text-slate-800 tracking-wide uppercase mb-6">
        Receita Mensal
      </h3>
      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={320}
        width="100%"
      />
    </div>
  );
}
