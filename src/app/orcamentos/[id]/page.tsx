'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Download,
  Package,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Upload,
  User,
  Phone,
  Mail,
  Play,
  Printer,
  Wrench,
  Copy,
  MapPin,
  X,
  Check,
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
import { generateId } from '@/lib/utils';
import type { FileAttachment } from '@/types/common';
import { useState, useMemo, useRef } from 'react';

const URGENCY_BG: Record<ReturnType<typeof getDeadlineUrgency>, string> = {
  overdue: 'bg-red-50 text-red-700 border-red-200',
  urgent: 'bg-orange-50 text-orange-700 border-orange-200',
  normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
} as const;

function getDeadlineLabel(deadline: string): string {
  if (!isValidDateString(deadline)) return 'Prazo inicia após a aprovação da arte';
  const days = getDaysUntil(deadline);
  if (days < 0) return `${Math.abs(days)} dia(s) atrasado`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Vence amanhã';
  return `Faltam ${days} dias`;
}

export default function QuoteDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const quotes = useQuoteStore((state) => state.quotes);
  const startArtProduction = useQuoteStore((state) => state.startArtProduction);
  const addFileToQuote = useQuoteStore((state) => state.addFileToQuote);
  const removeFileFromQuote = useQuoteStore((state) => state.removeFileFromQuote);
  const renameFileInQuote = useQuoteStore((state) => state.renameFileInQuote);
  const clients = useClientStore((state) => state.clients);

  const [copiedLink, setCopiedLink] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quote = useMemo(() => quotes.find((q) => q.id === id), [quotes, id]);
  const client = useMemo(
    () => (quote ? clients.find((c) => c.id === quote.clientId) : undefined),
    [clients, quote],
  );

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-12 w-12 text-gray-300" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Orçamento não encontrado</h2>
        <p className="mt-1 text-sm text-gray-500">O orçamento solicitado não existe ou foi removido.</p>
        <button
          type="button"
          onClick={() => router.push('/orcamentos')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 transition-colors duration-200 ease-out cursor-pointer"
        >
          Voltar para Orçamentos
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

  const handleAddFiles = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const fileList = event.target.files;
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      const attachment: FileAttachment = {
        id: generateId(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type || 'application/octet-stream',
      };
      addFileToQuote(quote.id, attachment);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartRename = (fileId: string, currentName: string): void => {
    setEditingFileId(fileId);
    setEditingFileName(currentName);
  };

  const handleConfirmRename = (): void => {
    if (editingFileId && editingFileName.trim()) {
      renameFileInQuote(quote.id, editingFileId, editingFileName.trim());
    }
    setEditingFileId(null);
    setEditingFileName('');
  };

  const handleCancelRename = (): void => {
    setEditingFileId(null);
    setEditingFileName('');
  };

  const handleDownloadFile = (file: FileAttachment): void => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 print:hidden">
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
                Iniciar Produção de Arte
              </button>
            )}
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
              Detalhes do Serviço
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem icon={Package} label="Serviço" value={quote.service} />
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
            <div className="mt-5 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{hasDeadline ? `Prazo de produção: ${formatDate(quote.deadline)}` : 'Prazo de produção aguardando aprovação da arte'}</span>
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
              <div className="mt-5 pt-5 border-t border-slate-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Descrição
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {quote.description}
                </p>
              </div>
            )}

            {/* Etapas */}
            <div className="mt-5 pt-5 border-t border-slate-200 flex flex-wrap gap-3">
              {quote.requiresPrinting && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                  <Printer className="h-3.5 w-3.5" />
                  Impressão
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
                  Instalação
                </span>
              )}
              {!quote.requiresPrinting && !quote.requiresAssembly && !hasInstallation && (
                <span className="text-xs text-gray-400">Nenhuma etapa de produção definida</span>
              )}
            </div>

            {hasInstallation && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={MapPin} label="Endereço da instalação" value={installationLabel || '-'} />
                  <DetailItem
                    icon={Calendar}
                    label="Data da instalação"
                    value={scheduledInstallationDate ? formatDate(scheduledInstallationDate) : '-'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Anexos / Referências */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Anexos / Referências
              </h2>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-700 transition-colors duration-200 ease-out cursor-pointer min-h-[36px]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Adicionar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleAddFiles}
                className="hidden"
                aria-label="Selecionar arquivos para anexar"
              />
            </div>

            {quote.files.length > 0 ? (
              <div className="grid gap-2">
                {quote.files.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors duration-200">
                      <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {editingFileId === file.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingFileName}
                            onChange={(e) => setEditingFileName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRename();
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            className="flex-1 rounded-md border border-cyan-400 px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                            autoFocus
                            aria-label="Renomear arquivo"
                          />
                          <button
                            type="button"
                            onClick={handleConfirmRename}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            aria-label="Confirmar renomeação"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Cancelar renomeação"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.type}</p>
                        </>
                      )}
                    </div>

                    {editingFileId !== file.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-slate-100 hover:text-cyan-600 transition-colors duration-200 cursor-pointer"
                          aria-label={`Baixar ${file.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartRename(file.id, file.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-slate-100 hover:text-amber-600 transition-colors duration-200 cursor-pointer"
                          aria-label={`Renomear ${file.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFileFromQuote(quote.id, file.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer"
                          aria-label={`Remover ${file.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
                <Upload className="h-8 w-8 text-gray-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-gray-900">Nenhuma referência anexada</p>
                <p className="mt-1 text-xs text-gray-500">Clique em "Adicionar" para anexar arquivos</p>
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
                <p className="mt-2 text-sm text-gray-500">Cliente não encontrado</p>
              </div>
            )}
          </div>

          {/* Informacoes adicionais */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Informações
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
    <div className="flex items-start gap-3 rounded-xl bg-slate-50/60 px-4 py-3.5 ring-1 ring-slate-100">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/60">
        <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className={cn('mt-1 text-sm font-semibold text-gray-900', valueClassName)}>{value}</p>
      </div>
    </div>
  );
}
