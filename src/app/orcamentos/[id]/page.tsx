'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Package,
  FileText,
  User,
  Phone,
  Mail,
  Play,
  Printer,
  Wrench,
  Copy,
  MapPin,
} from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useClientStore } from '@/stores/useClientStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QuoteStatusTimeline } from '@/components/quotes/QuoteStatusTimeline';
import { QuotePrintSummary } from '@/components/quotes/QuotePrintSummary';
import {
  formatCurrency,
  formatDate,
  getDaysUntil,
  getDeadlineUrgency,
  formatPhone,
  isValidDateString,
  cn,
} from '@/lib/utils';
import {
  formatQuoteDimension,
  getQuoteInstallationDate,
  getQuoteInstallationLabel,
  getQuoteSizeLabel,
  hasQuoteInstallation,
} from '@/lib/quote-utils';
import { useState, useMemo } from 'react';

const URGENCY_BG: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'bg-red-50 text-red-700 border-red-200',
  urgent: 'bg-orange-50 text-orange-700 border-orange-200',
  normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
} as const;

function getDeadlineLabel(deadline: string): string {
  if (!isValidDateString(deadline)) return 'Prazo inicia apos a aprovacao da arte';
  const days = getDaysUntil(deadline);
  if (days < 0) return `${Math.abs(days)} dia(s) atrasado`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Vence amanha';
  return `Faltam ${days} dias`;
}

export default function QuoteDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const quotes = useQuoteStore((state) => state.quotes);
  const startArtProduction = useQuoteStore((state) => state.startArtProduction);
  const clients = useClientStore((state) => state.clients);

  const [copiedLink, setCopiedLink] = useState(false);

  const quote = useMemo(() => quotes.find((q) => q.id === id), [quotes, id]);
  const client = useMemo(
    () => (quote ? clients.find((c) => c.id === quote.clientId) : undefined),
    [clients, quote],
  );

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-12 w-12 text-gray-300" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Orcamento nao encontrado</h2>
        <p className="mt-1 text-sm text-gray-500">O orcamento solicitado nao existe ou foi removido.</p>
        <button
          type="button"
          onClick={() => router.push('/orcamentos')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 transition-colors duration-200 ease-out cursor-pointer"
        >
          Voltar para Orcamentos
        </button>
      </div>
    );
  }

  const urgency = getDeadlineUrgency(quote.deadline);
  const hasDeadline = isValidDateString(quote.deadline);
  const sizeLabel = getQuoteSizeLabel(quote);
  const widthLabel = formatQuoteDimension(quote.width, quote.measurementUnit);
  const heightLabel = formatQuoteDimension(quote.height, quote.measurementUnit);
  const scheduledInstallationDate = getQuoteInstallationDate(quote);
  const installationLabel = getQuoteInstallationLabel(quote);
  const hasInstallation = hasQuoteInstallation(quote);

  const handleStartProduction = (): void => {
    startArtProduction(quote.id);
  };

  const handleCopyLink = async (): Promise<void> => {
    const trackingUrl = `${window.location.origin}/acompanhamento/${quote.trackingId}`;
    try {
      await navigator.clipboard.writeText(trackingUrl);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = trackingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintSummary = (): void => {
    window.print();
  };

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/orcamentos')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-gray-500 hover:bg-slate-50 hover:text-gray-700 transition-colors duration-200 ease-out cursor-pointer"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">{quote.service}</h1>
                <StatusBadge status={quote.status} />
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                ID: {quote.trackingId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSummary}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Imprimir Resumo
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              {copiedLink ? 'Copiado!' : 'Copiar Link'}
            </button>

            {quote.status === 'pendente' && (
              <button
                type="button"
                onClick={handleStartProduction}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 transition-colors duration-200 ease-out cursor-pointer"
              >
                <Play className="h-4 w-4" />
                Iniciar Producao de Arte
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Progresso
        </h2>
        <QuoteStatusTimeline status={quote.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Detalhes do Servico */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Detalhes do Servico
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem icon={Package} label="Servico" value={quote.service} />
              <DetailItem icon={Package} label="Material" value={quote.material} />
              {widthLabel && <DetailItem icon={Package} label="Largura" value={widthLabel} />}
              {heightLabel && <DetailItem icon={Package} label="Altura" value={heightLabel} />}
              {sizeLabel && <DetailItem icon={Package} label="Medidas" value={sizeLabel} />}
              <DetailItem
                icon={DollarSign}
                label="Valor"
                value={formatCurrency(quote.value)}
                valueClassName="text-lg font-bold text-gray-900"
              />
            </div>

            {/* Prazo */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{hasDeadline ? `Prazo de producao: ${formatDate(quote.deadline)}` : 'Prazo de producao aguardando aprovacao da arte'}</span>
                </div>
                {hasDeadline && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                      URGENCY_BG[urgency]
                    )}
                  >
                    {getDeadlineLabel(quote.deadline)}
                  </span>
                )}
              </div>
            </div>

            {/* Descricao */}
            {quote.description && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Descricao
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {quote.description}
                </p>
              </div>
            )}

            {/* Etapas */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
              {quote.requiresPrinting && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                  <Printer className="h-3.5 w-3.5" />
                  Impressao
                </span>
              )}
              {quote.requiresAssembly && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                  <Wrench className="h-3.5 w-3.5" />
                  Montagem
                </span>
              )}
              {hasInstallation && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <MapPin className="h-3.5 w-3.5" />
                  Instalacao
                </span>
              )}
              {!quote.requiresPrinting && !quote.requiresAssembly && !hasInstallation && (
                <span className="text-xs text-gray-400">Nenhuma etapa de producao definida</span>
              )}
            </div>

            {hasInstallation && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={MapPin} label="Endereco da instalacao" value={installationLabel || '-'} />
                  <DetailItem
                    icon={Calendar}
                    label="Data da instalacao"
                    value={scheduledInstallationDate ? formatDate(scheduledInstallationDate) : '-'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Anexos / Referencias */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Anexos / Referencias
            </h2>

            {quote.files.length > 0 ? (
              <div className="grid gap-2">
                {quote.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <FileText className="h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Nenhuma referencia anexada</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Dados do Cliente */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Cliente
            </h2>

            {client ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-sm font-semibold text-white">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.cpfCnpj}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200">
                  {client.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      {formatPhone(client.phone)}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.address.city && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      {client.address.city}
                      {client.address.state ? `, ${client.address.state}` : ''}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/clientes/${client.id}`)}
                  className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
                >
                  Ver Perfil do Cliente
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <User className="h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Cliente nao encontrado</p>
              </div>
            )}
          </div>

          {/* Informacoes adicionais */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Informacoes
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Criado em</span>
                <span className="font-medium text-gray-900">{formatDate(quote.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Atualizado em</span>
                <span className="font-medium text-gray-900">{formatDate(quote.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ID Rastreio</span>
                <span className="font-mono text-xs text-gray-700">{quote.trackingId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuotePrintSummary quote={quote} clientName={client?.name ?? 'Cliente'} />
    </>
  );
}

// Componente auxiliar para itens de detalhe
interface DetailItemProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value: string;
  readonly valueClassName?: string;
}

function DetailItem({
  icon: Icon,
  label,
  value,
  valueClassName,
}: DetailItemProps): React.ReactElement {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={cn('mt-0.5 text-sm font-medium text-gray-900', valueClassName)}>{value}</p>
      </div>
    </div>
  );
}
