'use client';

import { useMemo } from 'react';
import { AlertCircle, CalendarCheck2, Clock3, MapPin, MessageCircle, Phone } from 'lucide-react';
import { InstallationCalendar } from '@/components/final-production/InstallationCalendar';
import { useClientStore } from '@/stores/useClientStore';
import { useQuoteStore } from '@/stores/useQuoteStore';
import {
  buildInstallationWhatsAppMessage,
  buildInstallationWhatsAppUrl,
  getInstallationDeadlineStatus,
  getQuoteScheduledInstallationDate,
} from '@/lib/installation-scheduling';
import { getQuoteInstallationLabel } from '@/lib/quote-utils';
import { cn, formatDate, formatPhone, getDaysBetweenDates, isValidDateString } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface InstallationSchedulerPanelProps {
  readonly quoteId: string | null;
}

export function InstallationSchedulerPanel({
  quoteId,
}: InstallationSchedulerPanelProps): React.ReactElement {
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';

  const quotes = useQuoteStore((state) => state.quotes);
  const scheduleInstallation = useQuoteStore((state) => state.scheduleInstallation);
  const quote = useMemo(
    () => (quoteId ? quotes.find((q) => q.id === quoteId) : undefined),
    [quotes, quoteId]
  );
  const clients = useClientStore((state) => state.clients);
  const client = useMemo(
    () => (quote ? clients.find((item) => item.id === quote.clientId) : undefined),
    [clients, quote]
  );

  if (!quote) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-dashed px-6 py-10 text-center shadow-sm',
          isBlueTheme ? 'border-border bg-card-bg' : 'border-slate-300 bg-white'
        )}
      >
        <CalendarCheck2 className={cn('mx-auto h-10 w-10', isBlueTheme ? 'text-text-muted' : 'text-slate-300')} aria-hidden="true" />
        <h3 className={cn('mt-4 text-sm font-semibold', isBlueTheme ? 'text-text-primary' : 'text-slate-900')}>Selecione um pedido</h3>
        <p className={cn('mt-2 text-sm leading-relaxed', isBlueTheme ? 'text-text-muted' : 'text-slate-500')}>
          Escolha um trabalho da aba Instalação para definir a data do atendimento e confirmar com o cliente.
        </p>
      </div>
    );
  }

  const selectedDate = getQuoteScheduledInstallationDate(quote);
  const deadlineStatus = getInstallationDeadlineStatus(quote.deadline, selectedDate);
  const daysFromDeadline = getDaysBetweenDates(quote.deadline, selectedDate);
  const installationLabel = getQuoteInstallationLabel(quote) || 'Endereço não informado';
  const hasPhone = Boolean(client?.phone?.trim());
  const hasSelectedDate = isValidDateString(selectedDate);
  const scheduledDateLabel = hasSelectedDate ? formatDate(selectedDate) : '-';
  const deadlineLabel = isValidDateString(quote.deadline) ? formatDate(quote.deadline) : 'Aguardando aprovação';
  const whatsAppUrl =
    client && hasPhone && hasSelectedDate
      ? buildInstallationWhatsAppUrl({ client, quote, scheduledDateLabel })
      : '#';
  const messagePreview =
    client && hasSelectedDate
      ? buildInstallationWhatsAppMessage({ client, quote, scheduledDateLabel })
      : 'Selecione uma data no calendário para gerar a mensagem automática do cliente.';

  return (
    <div className={cn('rounded-2xl border shadow-sm', isBlueTheme ? 'border-border bg-card-bg' : 'border-slate-200 bg-white')}>
      {/* Header do painel */}
      <div className={cn('border-b px-6 py-4', isBlueTheme ? 'border-border' : 'border-slate-200')}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Agendamento de Instalação
            </p>
            <h2 className={cn('mt-1 text-lg font-semibold', isBlueTheme ? 'text-text-primary' : 'text-slate-900')}>{quote.service}</h2>
          </div>
          <p className={cn('text-sm', isBlueTheme ? 'text-text-muted' : 'text-slate-500')}>
            Defina a data e avise o cliente via WhatsApp
          </p>
        </div>
      </div>

      {/* Layout horizontal: Info + Calendário + Mensagem */}
      <div
        className={cn(
          'grid gap-0 lg:grid-cols-[1fr_auto_1fr] divide-y lg:divide-y-0 lg:divide-x',
          isBlueTheme ? 'divide-border' : 'divide-slate-200'
        )}
      >
        {/* Coluna 1: Informações do pedido + Status */}
        <div className="p-5 space-y-4">
          <div className="grid gap-3 grid-cols-2">
            <InfoCard isBlueTheme={isBlueTheme} label="Cliente" value={client?.name || 'Cliente não encontrado'} />
            <InfoCard
              isBlueTheme={isBlueTheme}
              label="Telefone"
              value={client?.phone ? formatPhone(client.phone) : 'Sem telefone'}
              icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            />
            <InfoCard isBlueTheme={isBlueTheme} label="Prazo limite" value={deadlineLabel} icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} />
            <InfoCard isBlueTheme={isBlueTheme} label="Endereço" value={installationLabel} icon={<MapPin className="h-4 w-4" aria-hidden="true" />} />
          </div>

          {/* Status cards */}
          <div className="grid gap-3 grid-cols-2">
            <StatusCard
              isBlueTheme={isBlueTheme}
              label="Data escolhida"
              value={scheduledDateLabel}
              tone={hasSelectedDate ? 'neutral' : 'muted'}
            />
            <StatusCard
              isBlueTheme={isBlueTheme}
              label="Status do prazo"
              value={getDeadlineStatusLabel(deadlineStatus, daysFromDeadline, hasSelectedDate)}
              tone={deadlineStatus === 'after' ? 'after' : deadlineStatus === 'within' ? 'within' : 'muted'}
            />
          </div>

          {/* Alerta de prazo */}
          <div
            className={cn(
              'rounded-xl border px-4 py-3 text-sm',
              deadlineStatus === 'after'
                ? isBlueTheme
                  ? 'border-amber-500/20 bg-amber-500/5 text-amber-200'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
                : isBlueTheme
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900',
            )}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                {deadlineStatus === 'after'
                  ? 'A instalação foi marcada para depois do prazo. A mensagem do cliente vai avisar isso automaticamente.'
                  : 'Data dentro do prazo ideal. O cliente receberá uma confirmação normal do agendamento.'}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna 2: Calendário */}
        <div className="p-5">
          <InstallationCalendar
            key={quote.id}
            selectedDate={selectedDate}
            deadline={quote.deadline}
            onSelectDate={(date) => scheduleInstallation(quote.id, date)}
          />
        </div>

        {/* Coluna 3: Mensagem WhatsApp */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-cyan-600" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900">Mensagem para o Cliente</h3>
          </div>

          <div
            className={cn(
              'rounded-xl p-4 max-h-[280px] overflow-y-auto',
              isBlueTheme ? 'bg-card-bg-secondary' : 'bg-slate-50'
            )}
          >
            <pre className={cn('whitespace-pre-wrap text-sm leading-relaxed', isBlueTheme ? 'text-text-muted' : 'text-slate-700')}>{messagePreview}</pre>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasPhone && hasSelectedDate ? (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium min-h-[44px] transition-colors duration-200 ease-out cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Enviar no WhatsApp
              </a>
            ) : (
              <span
                aria-disabled="true"
                className={cn(
                  'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium min-h-[44px] cursor-not-allowed',
                  isBlueTheme ? 'bg-card-bg-secondary text-text-muted' : 'bg-slate-200 text-slate-400'
                )}
              >
                Enviar no WhatsApp
              </span>
            )}

            {!hasPhone && (
              <p className="text-xs text-amber-700">Cadastre um telefone no cliente para enviar a confirmação.</p>
            )}
            {hasPhone && !hasSelectedDate && (
              <p className="text-xs text-slate-500">Escolha uma data no calendário para liberar o envio.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
  isBlueTheme,
}: {
  readonly label: string;
  readonly value: string;
  readonly icon?: React.ReactNode;
  readonly isBlueTheme: boolean;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3 ring-1',
        isBlueTheme ? 'bg-card-bg-secondary ring-border' : 'bg-slate-50 ring-slate-200'
      )}
    >
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.16em]',
          isBlueTheme ? 'text-text-muted' : 'text-slate-500'
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'mt-2 flex items-center gap-2 text-sm',
          isBlueTheme ? 'text-text-primary' : 'text-slate-800'
        )}
      >
        {icon ? <span className={cn('text-sm', isBlueTheme ? 'text-text-muted' : 'text-slate-400')} aria-hidden="true">{icon}</span> : null}
        <span className="min-w-0 break-words">{value}</span>
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
  isBlueTheme,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: 'within' | 'after' | 'neutral' | 'muted';
  readonly isBlueTheme: boolean;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3 ring-1',
        isBlueTheme
          ? tone === 'within' && 'bg-emerald-500/5 text-emerald-200 ring-emerald-500/20'
          : tone === 'within' && 'bg-emerald-50 text-emerald-900 ring-emerald-100',
        isBlueTheme
          ? tone === 'after' && 'bg-red-500/5 text-red-200 ring-red-500/20'
          : tone === 'after' && 'bg-red-50 text-red-900 ring-red-100',
        isBlueTheme
          ? tone === 'neutral' && 'bg-primary/5 text-primary ring-primary/15'
          : tone === 'neutral' && 'bg-cyan-50 text-cyan-900 ring-cyan-100',
        isBlueTheme
          ? tone === 'muted' && 'bg-card-bg-secondary text-text-muted ring-border'
          : tone === 'muted' && 'bg-slate-50 text-slate-700 ring-slate-200',
      )}
    >
      <p className={cn('text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75', isBlueTheme ? 'text-text-muted' : '')}>
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function getDeadlineStatusLabel(
  deadlineStatus: 'within' | 'after' | 'unknown',
  daysFromDeadline: number,
  hasSelectedDate: boolean,
): string {
  if (!hasSelectedDate || !Number.isFinite(daysFromDeadline) || deadlineStatus === 'unknown') {
    return 'Aguardando data';
  }

  if (deadlineStatus === 'after') {
    return `${Math.abs(daysFromDeadline)} dias após o prazo`;
  }

  if (daysFromDeadline === 0) {
    return 'No último dia do prazo';
  }

  return `${daysFromDeadline} dias antes do prazo`;
}
