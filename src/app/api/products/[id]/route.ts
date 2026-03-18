import { NextResponse } from 'next/server';
import type { Product } from '@/types/product';
import { readProducts, writeProducts } from '../_storage';

type Params = {
  readonly params: { readonly id: string };
};

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  const items = await readProducts();
  const product = items.find((p) => p.id === params.id);
  if (!product) {
    return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Params): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });
  }

  const items = await readProducts();
  const index = items.findIndex((p) => p.id === params.id);
  if (index < 0) {
    return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
  }

  const current = items[index];
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const b = body as Partial<Product> & { name?: unknown };
  const name = typeof b.name === 'string' ? b.name.trim() : current.name;
  if (!name) {
    return NextResponse.json({ message: 'Nome do produto é obrigatório' }, { status: 400 });
  }

  const hasGroupId = Object.prototype.hasOwnProperty.call(b, 'groupId');
  const hasPhotoUrl = Object.prototype.hasOwnProperty.call(b, 'photoUrl');

  const groupId = hasGroupId
    ? typeof b.groupId === 'string'
      ? b.groupId.trim() || null
      : b.groupId === null
        ? null
        : undefined
    : current.groupId;

  const photoUrl = hasPhotoUrl
    ? typeof b.photoUrl === 'string'
      ? (() => {
          const trimmed = b.photoUrl.trim();
          if (!trimmed) return null;
          // Evita path traversal básico (upload endpoint valida mais).
          if (trimmed.includes('..') || trimmed.includes('\\') || trimmed.includes('/..')) return undefined;
          return trimmed.slice(0, 500);
        })()
      : b.photoUrl === null
        ? null
        : undefined
    : current.photoUrl;

  const updated: Product = {
    ...current,
    ...b,
    name,
    groupId,
    photoUrl,
    updatedAt: now,
  };

  items[index] = updated;
  await writeProducts(items);

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  const items = await readProducts();
  const next = items.filter((p) => p.id !== params.id);
  const existed = next.length !== items.length;
  if (!existed) {
    return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
  }

  await writeProducts(next);
  return NextResponse.json({ ok: true });
}

