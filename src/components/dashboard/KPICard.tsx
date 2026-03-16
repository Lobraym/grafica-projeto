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
      className="bg-card-bg rounded-xl border border-border p-5 shadow-sm cursor-default"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </motion.div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-text-primary tabular-nums tracking-tight">{value}</p>
          <p className="text-sm text-text-secondary mt-0.5">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}
