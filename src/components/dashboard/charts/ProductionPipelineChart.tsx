'use client';

import dynamic from 'next/dynamic';
import type { Props as ChartProps } from 'react-apexcharts';
import type { ProductionPipeline } from '@/hooks/useDashboardData';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ProductionPipelineChartProps {
  readonly data: ProductionPipeline;
}

export function ProductionPipelineChart({ data }: ProductionPipelineChartProps): React.ReactElement {
  const categories = ['Impressão', 'Montagem', 'Instalação'];
  const stages = [data.printing, data.assembly, data.installation];

  const series: ChartProps['series'] = [
    {
      name: 'Disponível',
      data: stages.map((s) => s.available),
    },
    {
      name: 'Em Andamento',
      data: stages.map((s) => s.inProgress),
    },
    {
      name: 'Concluído',
      data: stages.map((s) => s.done),
    },
  ];

  const chartOptions: ChartProps['options'] = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
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
        horizontal: true,
        borderRadius: 4,
        barHeight: '50%',
      },
    },
    colors: ['#0891B2', '#F59E0B', '#10B981'],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontWeight: 600,
      },
      formatter: (val: number): string => (val > 0 ? String(val) : ''),
    },
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
      },
    },
    grid: {
      borderColor: 'rgba(148, 163, 184, 0.2)',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      labels: { colors: '#94A3B8' },
      markers: {
        size: 6,
        shape: 'circle',
      },
    },
    tooltip: {
      y: {
        formatter: (val: number): string => `${val} orçamento${val !== 1 ? 's' : ''}`,
      },
    },
  };

  return (
    <div className="bg-card-bg rounded-xl border border-border p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        Pipeline de Produção
      </h3>
      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={220}
        width="100%"
      />
    </div>
  );
}
