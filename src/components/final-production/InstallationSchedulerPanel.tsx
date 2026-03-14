'use client';

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

interface InstallationSchedulerPanelProps {
  readonly quoteId: string | null;
}

export function InstallationSchedulerPanel({
  quoteId,
}: InstallationSchedulerPanelProps): React.ReactElement {
  const quote = useQuoteStore((state) => (quoteId ? state.getQuoteById(quoteId) : undefined));
  const scheduleInstallation = useQuoteStore((state) => state.scheduleInstallation);
  const client = useClientStore((state) =>
    quote ? state.clients.find((item) => item.id === quote.clientId) : undefined
  );

  if (!quote) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
        <CalendarCheck2 className="mx-auto h-10 w-10 text-slate-300" />
        <h3 className="mt-4 text-sm font-semibold text-slate-900">Selecione um pedido</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Escolha um trabalho da aba Instalação para definir a data do atendimento e confirmar com o cliente.
        </p>
      </div>
    );
  }

  const selectedDate = getQuoteScheduledInstallationDate(quote);
  const deadlineStatus = getInstallationDeadlineStatus(quote.deadline, selectedDate);
  const daysFromDeadline = getDaysBetweenDates(quote.deadline, selectedDate);
  const installationLabel = getQuoteInstallationLabel(quote) || 'Endereço da instalação não informado';
  const hasPhone = Boolean(client?.phone.trim());
  const hasSelectedDate = isValidDateString(selectedDate);
  const scheduledDateLabel = hasSelectedDate ? formatDate(selectedDate) : '-';
  const deadlineLabel = isValidDateString(quote.deadline) ? formatDate(quote.deadline) : 'Prazo aguardando aprovação';
  const whatsAppUrl =
    client && hasPhone && hasSelectedDate
      ? buildInstallationWhatsAppUrl({ client, quote, scheduledDateLabel })
      : '#';
  const messagePreview =
    client && hasSelectedDate
      ? buildInstallationWhatsAppMessage({ client, quote, scheduledDateLabel })
      : 'Selecione uma data no calendário para gerar a mensagem automática do cliente.';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
          Agendamento de Instalacao
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{quote.service}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Defina a data da equipe e avise o cliente com uma mensagem pronta no WhatsApp.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoCard label="Cliente" value={client?.name || 'Cliente não encontrado'} />
          <InfoCard label="Telefone" value={client?.phone ? formatPhone(client.phone) : 'Sem telefone'} icon={<Phone className="h-4 w-4" />} />
          <InfoCard label="Prazo limite" value={deadlineLabel} icon={<Clock3 className="h-4 w-4" />} />
          <InfoCard label="Endereco" value={installationLabel} icon={<MapPin className="h-4 w-4" />} />
        </div>
      </div>

      <InstallationCalendar
        key={quote.id}
        selectedDate={selectedDate}
        deadline={quote.deadline}
        onSelectDate={(date) => scheduleInstallation(quote.id, date)}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusCard
            label="Data escolhida"
            value={scheduledDateLabel}
            tone={hasSelectedDate ? 'neutral' : 'muted'}
          />
          <StatusCard
            label="Status do prazo"
            value={getDeadlineLabel(deadlineStatus, daysFromDeadline, hasSelectedDate)}
            tone={deadlineStatus === 'after' ? 'after' : deadlineStatus === 'within' ? 'within' : 'muted'}
          />
        </div>

        <div
          className={cn(
            'mt-4 rounded-xl border px-4 py-3 text-sm',
            deadlineStatus === 'after'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900',
          )}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {deadlineStatus === 'after'
                ? 'A instalação foi marcada para depois do prazo padrão. A mensagem do cliente vai avisar isso automaticamente.'
                : 'A data escolhida está dentro do prazo ideal de produção. O cliente receberá uma confirmação normal do agendamento.'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-cyan-600" />
          <h3 className="text-sm font-semibold text-slate-900">Mensagem para o Cliente</h3>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{messagePreview}</pre>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-out',
              hasPhone && hasSelectedDate
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'pointer-events-none bg-slate-200 text-slate-400',
            )}
          >
            Enviar no WhatsApp
          </a>

          {!hasPhone && (
            <p className="text-xs text-amber-600">Cadastre um telefone no cliente para enviar a confirmação.</p>
          )}
          {hasPhone && !hasSelectedDate && (
            <p className="text-xs text-slate-500">Escolha uma data no calendário para liberar o envio.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  readonly label: string;
  readonly value: string;
  readonly icon?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-800">
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        <span className="min-w-0 break-words">{value}</span>
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: 'within' | 'after' | 'neutral' | 'muted';
}): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3 ring-1',
        tone === 'within' && 'bg-emerald-50 text-emerald-900 ring-emerald-100',
        tone === 'after' && 'bg-rose-50 text-rose-900 ring-rose-100',
        tone === 'neutral' && 'bg-cyan-50 text-cyan-900 ring-cyan-100',
        tone === 'muted' && 'bg-slate-50 text-slate-700 ring-slate-200',
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function getDeadlineLabel(
  deadlineStatus: 'within' | 'after' | 'unknown',
  daysFromDeadline: number,
  hasSelectedDate: boolean,
): string {
  if (!hasSelectedDate || !Number.isFinite(daysFromDeadline) || deadlineStatus === 'unknown') {
    return 'Aguardando data';
  }

  if (deadlineStatus === 'after') {
    return `${Math.abs(daysFromDeadline)} dias apos o prazo`;
  }

  if (daysFromDeadline === 0) {
    return 'No ultimo dia do prazo';
  }

  return `${daysFromDeadline} dias antes do prazo`;
}
