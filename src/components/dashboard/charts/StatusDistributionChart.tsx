'use client';

import dynamic from 'next/dynamic';
import type { Props as ChartProps } from 'react-apexcharts';
import type { StatusDistItem } from '@/hooks/useDashboardData';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StatusDistributionChartProps {
  readonly data: readonly StatusDistItem[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps): React.ReactElement {
  const labels = data.map((d) => d.status);
  const values = data.map((d) => d.count);
  const colors = data.map((d) => d.color);

  const chartOptions: ChartProps['options'] = {
    chart: {
      type: 'donut',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      animations: {
        enabled: true,
        speed: 600,
        animateGradually: { enabled: true, delay: 100 },
      },
    },
    labels,
    colors,
    dataLabels: { enabled: false },
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
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: '#94A3B8',
              fontSize: '13px',
            },
            value: {
              show: true,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: '#94A3B8',
              fontSize: '20px',
              fontWeight: 700,
            },
            total: {
              show: true,
              label: 'Total',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: '#94A3B8',
              fontSize: '13px',
              formatter: (w: { globals: { seriesTotals: number[] } }): string =>
                String(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    stroke: {
      width: 2,
      colors: ['var(--card-bg)'],
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
        Distribuição por Status
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-6">Sem dados disponíveis.</p>
      ) : (
        <Chart
          options={chartOptions}
          series={values}
          type="donut"
          height={300}
          width="100%"
        />
      )}
    </div>
  );
}
