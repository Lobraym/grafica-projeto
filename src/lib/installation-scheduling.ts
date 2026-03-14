import type { Client } from '@/types/client';
import type { Quote } from '@/types/quote';
import { getDaysBetweenDates, isValidDateString } from '@/lib/utils';
import { getQuoteInstallationDate } from '@/lib/quote-utils';

type InstallationRuleFields = Pick<
  Quote,
  'status' | 'requiresPrinting' | 'requiresAssembly' | 'requiresInstallation' | 'printingStage' | 'assemblyStage' | 'installationStage'
>;

export function areInstallationPrerequisitesDone(quote: InstallationRuleFields): boolean {
  const printingDone = !quote.requiresPrinting || quote.printingStage === 'concluida';
  const assemblyDone = !quote.requiresAssembly || quote.assemblyStage === 'concluida';
  return printingDone && assemblyDone;
}

export function getInitialInstallationStage(quote: InstallationRuleFields): Quote['installationStage'] {
  if (!quote.requiresInstallation) {
    return 'nao_iniciado';
  }

  return areInstallationPrerequisitesDone(quote) ? 'disponivel' : 'nao_iniciado';
}

export function shouldUnlockInstallation(quote: InstallationRuleFields): boolean {
  return (
    quote.status === 'em_producao' &&
    quote.requiresInstallation === true &&
    quote.installationStage === 'nao_iniciado' &&
    areInstallationPrerequisitesDone(quote)
  );
}

export function getInstallationDeadlineStatus(
  deadline: string,
  scheduledDate: string,
): 'within' | 'after' | 'unknown' {
  if (!isValidDateString(deadline) || !isValidDateString(scheduledDate)) {
    return 'unknown';
  }

  return getDaysBetweenDates(scheduledDate, deadline) >= 0 ? 'within' : 'after';
}

export function getQuoteScheduledInstallationDate(quote: Pick<Quote, 'installationDate' | 'scheduledInstallationDate'>): string {
  return getQuoteInstallationDate(quote);
}

export function buildInstallationWhatsAppUrl({
  client,
  quote,
  scheduledDateLabel,
}: {
  client: Pick<Client, 'phone' | 'name'>;
  quote: Pick<Quote, 'service' | 'deadline' | 'installationDate' | 'scheduledInstallationDate'>;
  scheduledDateLabel: string;
}): string {
  const phoneDigits = normalizePhoneForWhatsApp(client.phone);
  const message = buildInstallationWhatsAppMessage({ client, quote, scheduledDateLabel });

  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export function buildInstallationWhatsAppMessage({
  client,
  quote,
  scheduledDateLabel,
}: {
  client: Pick<Client, 'name'>;
  quote: Pick<Quote, 'service' | 'deadline' | 'installationDate' | 'scheduledInstallationDate'>;
  scheduledDateLabel: string;
}): string {
  const scheduledDate = getQuoteScheduledInstallationDate(quote);
  const status = getInstallationDeadlineStatus(quote.deadline, scheduledDate);

  return status === 'after'
    ? [
        `Olá, ${client.name}!`,
        '',
        `Seu serviço de ${quote.service} foi agendado para instalação em ${scheduledDateLabel}.`,
        'Esse agendamento ficou para uma data posterior ao prazo inicial de produção, mas já está confirmado pela nossa equipe.',
        '',
        'Qualquer dúvida, estamos à disposição.',
      ].join('\n')
    : [
        `Olá, ${client.name}!`,
        '',
        `Confirmamos o agendamento da instalação do serviço ${quote.service} para o dia ${scheduledDateLabel}.`,
        'Nossa equipe já está programada para realizar o atendimento nessa data.',
        '',
        'Qualquer dúvida, estamos à disposição.',
      ].join('\n');
}

function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}
