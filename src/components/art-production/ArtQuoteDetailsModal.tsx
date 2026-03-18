'use client';

import {
  Download,
  ExternalLink,
  FileImage,
  FileText,
  Layers,
  Mail,
  MapPin,
  Phone,
  Ruler,
  StickyNote,
  UserRound,
  X,
} from 'lucide-react';
import { useClientStore } from '@/stores/useClientStore';
import type { Quote } from '@/types/quote';
import { cn, formatDate, formatPhone } from '@/lib/utils';
import {
  formatQuoteDimension,
  getQuoteInstallationDate,
  getQuoteInstallationLabel,
} from '@/lib/quote-utils';
import { useTheme } from '@/context/ThemeContext';

interface ArtQuoteDetailsModalProps {
  readonly quote: Quote;
  readonly onClose: () => void;
  readonly notesLabel?: string;
}

export function ArtQuoteDetailsModal({
  quote,
  onClose,
  notesLabel = 'Instrucoes para a Designer',
}: ArtQuoteDetailsModalProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);
  const client = clients.find((item) => item.id === quote.clientId);
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';
  const widthLabel = formatQuoteDimension(quote.width, quote.measurementUnit);
  const heightLabel = formatQuoteDimension(quote.height, quote.measurementUnit);
  const installationLabel = getQuoteInstallationLabel(quote);
  const installationDate = getQuoteInstallationDate(quote);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div
        className={cn(
          'w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl',
          isBlueTheme ? 'border-border bg-card-bg' : 'border-slate-200 bg-white'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between border-b px-6 py-4',
            isBlueTheme ? 'border-border' : 'border-slate-200'
          )}
        >
          <div>
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.2em]',
                isBlueTheme ? 'text-primary' : 'text-cyan-600'
              )}
            >
              Detalhes do Orçamento
            </p>
            <h3 className={cn('mt-1 text-lg font-semibold', isBlueTheme ? 'text-text-primary' : 'text-slate-900')}>
              {quote.service}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'rounded-lg p-2 transition-colors duration-200 ease-out cursor-pointer',
              isBlueTheme
                ? 'text-text-muted hover:bg-card-bg-secondary hover:text-text-primary'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            )}
            aria-label="Fechar detalhes"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[80vh] gap-0 overflow-y-auto lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6 p-6">
            <section
              className={cn(
                'rounded-xl border p-5',
                isBlueTheme ? 'border-border bg-card-bg-secondary/60' : 'border-slate-200 bg-slate-50/60'
              )}
            >
              <div className="mb-4 flex items-center gap-2">
                <UserRound className={cn('h-4 w-4', isBlueTheme ? 'text-primary' : 'text-cyan-600')} />
                <h4 className={cn('text-sm font-semibold', isBlueTheme ? 'text-text-primary' : 'text-slate-900')}>
                  Informacoes do Cliente
                </h4>
              </div>

              {client ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoItem label="Nome" value={client.name} />
                  <InfoItem label="Telefone" value={formatPhone(client.phone)} icon={<Phone className="h-3.5 w-3.5" />} />
                  <InfoItem label="Email" value={client.email || '-'} icon={<Mail className="h-3.5 w-3.5" />} />
                  <InfoItem
                    label="Cidade"
                    value={
                      [client.address.city, client.address.state].filter(Boolean).join(' - ') || '-'
                    }
                    icon={<MapPin className="h-3.5 w-3.5" />}
                  />
                </div>
              ) : (
                <p className={cn('text-sm', isBlueTheme ? 'text-text-muted' : 'text-slate-500')}>
                  Cliente nao encontrado.
                </p>
              )}
            </section>

            <section
              className={cn(
                'rounded-xl border p-5',
                isBlueTheme ? 'border-border bg-card-bg' : 'border-slate-200 bg-white'
              )}
            >
              <div className="mb-4 flex items-center gap-2">
                <Layers className={cn('h-4 w-4', isBlueTheme ? 'text-primary' : 'text-cyan-600')} />
                <h4 className={cn('text-sm font-semibold', isBlueTheme ? 'text-text-primary' : 'text-slate-900')}>
                  Resumo do Trabalho
                </h4>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Servico" value={quote.service || '-'} />
                <InfoItem label="Material" value={quote.material || '-'} />
                <InfoItem label="Largura" value={widthLabel || '-'} icon={<Ruler className="h-3.5 w-3.5" />} />
                <InfoItem label="Altura" value={heightLabel || '-'} icon={<Ruler className="h-3.5 w-3.5" />} />
                <InfoItem label="Quantidade" value={String(quote.quantity ?? '-')} />
              </div>

              <div className={cn('mt-5 rounded-lg p-4', isBlueTheme ? 'bg-card-bg-secondary' : 'bg-slate-50')}>
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-[0.18em]',
                    isBlueTheme ? 'text-text-muted' : 'text-slate-500'
                  )}
                >
                  Descricao do Trabalho
                </p>
                <p
                  className={cn(
                    'mt-2 whitespace-pre-wrap text-sm leading-relaxed',
                    isBlueTheme ? 'text-text-primary' : 'text-slate-700'
                  )}
                >
                  {quote.description || '-'}
                </p>
              </div>

              {installationLabel && (
                <div
                  className={cn(
                    'mt-4 rounded-lg p-4',
                    isBlueTheme ? 'border border-accent/30 bg-accent/10' : 'bg-emerald-50/70'
                  )}
                >
                  <p
                    className={cn(
                      'text-xs font-semibold uppercase tracking-[0.18em]',
                      isBlueTheme ? 'text-accent' : 'text-emerald-700'
                    )}
                  >
                    Instalacao
                  </p>
                  <p className={cn('mt-2 text-sm', isBlueTheme ? 'text-text-primary' : 'text-emerald-900')}>
                    {installationLabel}
                  </p>
                  {installationDate && (
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        isBlueTheme ? 'text-text-muted' : 'text-emerald-700'
                      )}
                    >
                      Data agendada: {formatDate(installationDate)}
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside
            className={cn(
              'border-t p-6 lg:border-l lg:border-t-0',
              isBlueTheme ? 'border-border bg-card-bg-secondary/50' : 'border-slate-200 bg-slate-50/50'
            )}
          >
            <div className="mb-4">
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.2em]',
                  isBlueTheme ? 'text-primary' : 'text-cyan-600'
                )}
              >
                Referencias do Cliente
              </p>
              <h4 className={cn('mt-1 text-sm font-semibold', isBlueTheme ? 'text-text-primary' : 'text-slate-900')}>
                Anexos para a criacao da arte
              </h4>
            </div>

            {quote.files.length > 0 ? (
              <div className="space-y-3">
                {quote.files.map((file) => {
                  const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');

                  return (
                    <div
                      key={file.id}
                      className={cn(
                        'rounded-xl border p-4 shadow-sm',
                        isBlueTheme ? 'border-border bg-card-bg-secondary' : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          {isPdf ? (
                            <FileText className="h-5 w-5" />
                          ) : (
                            <FileImage className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-sm font-medium',
                              isBlueTheme ? 'text-text-primary' : 'text-slate-900'
                            )}
                          >
                            {file.name}
                          </p>
                          <p
                            className={cn(
                              'mt-1 text-xs',
                              isBlueTheme ? 'text-text-muted' : 'text-slate-500'
                            )}
                          >
                            {isPdf ? 'PDF de referencia' : 'Imagem de referencia'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            'inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200 ease-out',
                            isBlueTheme
                              ? 'border-border bg-card-bg-secondary text-text-primary hover:bg-card-bg'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Visualizar
                        </a>
                        <a
                          href={file.url}
                          download={file.name}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white transition-colors duration-200 ease-out hover:bg-cyan-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Baixar
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center',
                  isBlueTheme ? 'border-border bg-card-bg-secondary' : 'border-slate-300 bg-white'
                )}
              >
                <FileText className={cn('h-8 w-8', isBlueTheme ? 'text-text-muted' : 'text-slate-300')} />
                <p
                  className={cn(
                    'mt-3 text-sm font-medium',
                    isBlueTheme ? 'text-text-primary' : 'text-slate-700'
                  )}
                >
                  Nenhuma referencia anexada
                </p>
                <p className={cn('mt-1 text-xs', isBlueTheme ? 'text-text-muted' : 'text-slate-500')}>
                  Quando a recepcao adicionar PDFs ou imagens, eles aparecerao aqui para a designer.
                </p>
              </div>
            )}

            <div
              className={cn(
                'mt-5 rounded-xl border p-4',
                isBlueTheme ? 'border-border bg-card-bg-secondary' : 'border-amber-200 bg-amber-50/70'
              )}
            >
              <p
                className={cn(
                  'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]',
                  isBlueTheme ? 'text-accent' : 'text-amber-700'
                )}
              >
                <StickyNote className="h-3.5 w-3.5" />
                {notesLabel}
              </p>
              <p
                className={cn(
                  'mt-2 whitespace-pre-wrap text-sm leading-relaxed',
                  isBlueTheme ? 'text-text-muted' : 'text-amber-900'
                )}
              >
                {quote.receptionNotes?.trim() || '-'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  readonly label: string;
  readonly value: string;
  readonly icon?: React.ReactNode;
}

function InfoItem({ label, value, icon }: InfoItemProps): React.ReactElement {
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';
  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 ring-1',
        isBlueTheme ? 'bg-card-bg-secondary ring-border' : 'bg-white ring-slate-200'
      )}
    >
      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-[0.16em]',
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
        {icon ? <span className={cn(isBlueTheme ? 'text-text-muted' : 'text-slate-400')}>{icon}</span> : null}
        <span className="min-w-0 break-words">{value}</span>
      </p>
    </div>
  );
}
