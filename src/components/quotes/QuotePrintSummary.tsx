import { formatCurrency, formatDate, isValidDateString } from '@/lib/utils';
import {
  formatQuoteDimension,
  getQuoteInstallationDate,
  getQuoteInstallationLabel,
  getQuoteSizeLabel,
} from '@/lib/quote-utils';
import type { Quote } from '@/types/quote';

interface QuotePrintSummaryProps {
  readonly quote: Quote;
  readonly clientName: string;
}

export function QuotePrintSummary({
  quote,
  clientName,
}: QuotePrintSummaryProps): React.ReactElement {
  const sizeLabel = getQuoteSizeLabel(quote);
  const widthLabel = formatQuoteDimension(quote.width, quote.measurementUnit);
  const heightLabel = formatQuoteDimension(quote.height, quote.measurementUnit);
  const installationLabel = getQuoteInstallationLabel(quote);
  const installationDate = getQuoteInstallationDate(quote);
  const hasDeadline = isValidDateString(quote.deadline);

  return (
    <div className="hidden print:block">
      <div className="mx-auto max-w-3xl px-8 py-10 text-black">
        <header className="border-b border-black pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">Resumo do Trabalho</p>
          <h1 className="mt-2 text-3xl font-bold">{quote.service}</h1>
          <p className="mt-2 text-sm">Cliente: {clientName}</p>
        </header>

        <section className="grid grid-cols-2 gap-x-8 gap-y-5 border-b border-black py-6 text-sm">
          <PrintField label="Tipo de servico" value={quote.service} />
          <PrintField label="Material" value={quote.material} />
          <PrintField label="Largura" value={widthLabel || '-'} />
          <PrintField label="Altura" value={heightLabel || '-'} />
          <PrintField label="Valor do servico" value={formatCurrency(quote.value)} />
          <PrintField
            label="Data da instalacao"
            value={installationDate ? formatDate(installationDate) : '-'}
          />
        </section>

        <section className="border-b border-black py-6 text-sm">
          <PrintField label="Endereco da instalacao" value={installationLabel || '-'} />
        </section>

        <section className="border-b border-black py-6 text-sm">
          <PrintField label="Medidas" value={sizeLabel || '-'} />
          <PrintField label="Descricao do trabalho" value={quote.description || '-'} multiline />
        </section>

        <footer className="pt-8 text-xs">
          <p>
            {hasDeadline
              ? `Prazo de producao: ${formatDate(quote.deadline)}`
              : 'Prazo de producao inicia apos a aprovacao da arte'}
          </p>
          <p className="mt-2">Usar este resumo como conferência do serviço e da instalação.</p>
        </footer>
      </div>
    </div>
  );
}

interface PrintFieldProps {
  readonly label: string;
  readonly value: string;
  readonly multiline?: boolean;
}

function PrintField({ label, value, multiline = false }: PrintFieldProps): React.ReactElement {
  return (
    <div className={multiline ? 'col-span-2' : undefined}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{value}</p>
    </div>
  );
}
