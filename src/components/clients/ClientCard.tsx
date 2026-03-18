'use client';

import { useRouter } from 'next/navigation';
import { Phone, Mail } from 'lucide-react';
import type { Client } from '@/types/client';
import { formatPhone } from '@/lib/utils';

interface ClientCardProps {
  readonly client: Client;
}

const PERSON_TYPE_LABELS = {
  PF: 'Pessoa Física',
  PJ: 'Pessoa Jurídica',
} as const;

export function ClientCard({ client }: ClientCardProps): React.ReactElement {
  const router = useRouter();

  const firstLetter = client.name.charAt(0).toUpperCase();

  const handleClick = (): void => {
    router.push(`/clientes/${client.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card-bg p-4 shadow-sm transition-all duration-200 ease-out hover:bg-card-bg-secondary hover:border-primary/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary border-l-4 border-l-primary/50"
    >
      {/* Avatar — destaque em ciano */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-lg font-semibold text-white shadow-md shadow-cyan-500/20">
        {firstLetter}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
            {client.name}
          </h3>
          <span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/20">
            {PERSON_TYPE_LABELS[client.personType]}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
          {client.phone && (
            <span className="inline-flex items-center gap-1 text-text-secondary">
              <Phone className="h-3 w-3 text-primary" />
              {formatPhone(client.phone)}
            </span>
          )}
          {client.email && (
            <span className="inline-flex items-center gap-1 text-text-secondary">
              <Mail className="h-3 w-3 text-primary" />
              {client.email}
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg
        className="h-4 w-4 shrink-0 text-text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  );
}
