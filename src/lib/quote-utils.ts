import type { Quote, QuoteMeasurementUnit } from '@/types/quote';

type QuoteDimensions = Pick<Quote, 'width' | 'height' | 'measurementUnit' | 'size'>;
type QuoteInstallation = Pick<
  Quote,
  | 'requiresInstallation'
  | 'installationStreet'
  | 'installationNeighborhood'
  | 'installationNumber'
  | 'installationCity'
  | 'installationDate'
  | 'scheduledInstallationDate'
>;

export function getQuoteSizeLabel(quote: QuoteDimensions): string {
  const width = quote.width?.trim() ?? '';
  const height = quote.height?.trim() ?? '';

  if (width && height) {
    return `${formatQuoteDimension(width, quote.measurementUnit)} L x ${formatQuoteDimension(height, quote.measurementUnit)} A`;
  }

  return quote.size.trim();
}

export function formatQuoteDimension(value?: string, unit?: QuoteMeasurementUnit): string {
  const normalizedValue = value?.trim() ?? '';

  if (!normalizedValue) {
    return '';
  }

  if (!unit) {
    return normalizedValue;
  }

  return `${normalizedValue} ${unit}`;
}

export function hasQuoteInstallation(quote: QuoteInstallation): boolean {
  return quote.requiresInstallation === true;
}

export function getQuoteInstallationLabel(quote: QuoteInstallation): string {
  return [
    [quote.installationStreet, quote.installationNumber].filter(Boolean).join(', '),
    quote.installationNeighborhood,
    quote.installationCity,
  ]
    .map((value) => value?.trim() ?? '')
    .filter(Boolean)
    .join(' - ');
}

export function getQuoteInstallationDate(quote: QuoteInstallation): string {
  return quote.scheduledInstallationDate?.trim() || quote.installationDate?.trim() || '';
}
