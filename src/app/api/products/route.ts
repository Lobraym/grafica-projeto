import { NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import type { Product } from '@/types/product';
import { readProducts, writeProducts } from './_storage';

export async function GET(): Promise<NextResponse> {
  const items = await readProducts();
  return NextResponse.json(items);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });
  }

  const now = new Date().toISOString();

  const b = body as Partial<Product> & { id?: unknown; name?: unknown };
  const incomingId = typeof b.id === 'string' ? b.id : undefined;
  const id = incomingId && incomingId.trim() ? incomingId : generateId();
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) {
    return NextResponse.json({ message: 'Nome do produto é obrigatório' }, { status: 400 });
  }

  const product: Product = {
    id,
    name,
    groupId: typeof b.groupId === 'string' ? b.groupId.trim() : b.groupId === null ? null : undefined,
    photoUrl:
      typeof b.photoUrl === 'string'
        ? b.photoUrl.trim().slice(0, 500)
        : b.photoUrl === null
          ? null
          : undefined,
    description: typeof b.description === 'string' ? b.description : '',
    category: b.category,
    calculationType: b.calculationType,
    measurementUnit: b.measurementUnit,
    productMaterials: b.productMaterials,
    finishings: b.finishings,
    minQuantity: b.minQuantity ?? null,
    defaultMarginPercent: b.defaultMarginPercent,
    status: b.status,
    createdAt: now,
    updatedAt: now,
    productType: b.productType,
    billingType: b.billingType,
    minArea: b.minArea,
    marginPercent: b.marginPercent,
    active: b.active,
    costBlocks: b.costBlocks,
    priceTiers: b.priceTiers,
  };

  const items = await readProducts();
  const next = [...items, product];
  await writeProducts(next);

  return NextResponse.json(product, { status: 201 });
}

