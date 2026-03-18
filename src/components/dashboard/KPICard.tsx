'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  readonly title: string;
  readonly value: string;
  readonly icon: LucideIcon;
  readonly iconBgClass?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconBgClass = 'bg-cyan-50 text-cyan-600',
}: KPICardProps): React.ReactElement {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4 cursor-default transition-transform duration-300 hover:-translate-y-1"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </motion.div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5 tabular-nums tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
