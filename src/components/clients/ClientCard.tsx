'use client';

import { useRouter } from 'next/navigation';
import { Phone, Mail } from 'lucide-react';
import type { Client } from '@/types/client';
import { formatPhone } from '@/lib/utils';

interface ClientCardProps {
  readonly client: Client;
}

const PERSON_TYPE_STYLES = {
  PF: 'bg-sky-50 text-sky-700 ring-sky-600/10',
  PJ: 'bg-violet-50 text-violet-700 ring-violet-600/10',
} as const;

const PERSON_TYPE_LABELS = {
  PF: 'Pessoa Fisica',
  PJ: 'Pessoa Juridica',
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
      className="group flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:border-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
    >
      {/* Avatar */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-lg font-semibold text-white shadow-sm">
        {firstLetter}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors duration-200 ease-out">
            {client.name}
          </h3>
          <span
            className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${PERSON_TYPE_STYLES[client.personType]}`}
          >
            {PERSON_TYPE_LABELS[client.personType]}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          {client.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {formatPhone(client.phone)}
            </span>
          )}
          {client.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {client.email}
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg
        className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-400"
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
