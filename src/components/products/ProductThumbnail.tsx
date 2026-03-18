'use client';

import type { Product } from '@/types/product';

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

interface ProductThumbnailProps {
  readonly product: Product;
  readonly fallbackColorHex: string;
}

export function ProductThumbnail({ product, fallbackColorHex }: ProductThumbnailProps): React.ReactElement {
  const initials = getInitials(product.name);

  return (
    <div
      className="h-10 w-10 overflow-hidden rounded-lg bg-card-bg-secondary border border-border flex items-center justify-center shrink-0"
      style={product.photoUrl ? undefined : { backgroundColor: fallbackColorHex }}
    >
      {product.photoUrl ? (
        // thumbnail de produto
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.photoUrl ?? undefined}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-semibold text-white">{initials}</span>
      )}
    </div>
  );
}

