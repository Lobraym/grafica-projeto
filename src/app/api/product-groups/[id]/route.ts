import { NextResponse } from 'next/server';
import type { ProductGroup } from '@/types/product-group';
import { readGroups, writeGroups } from '../_storage';

function isValidHexColor(colorHex: unknown): colorHex is string {
  if (typeof colorHex !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(colorHex.trim());
}

function normalizeEmoji(input: unknown): string {
  if (typeof input !== 'string') return '📦';
  const s = input.trim();
  if (!s) return '📦';
  const len = Array.from(s).length;
  return len > 4 ? Array.from(s).slice(0, 4).join('') : s;
}

function normalizePartial(payload: unknown): Partial<ProductGroup> | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;

  const name = typeof p.name === 'string' ? p.name.trim() : undefined;
  const colorHex = p.colorHex;
  const iconEmoji = p.iconEmoji;

  if (name !== undefined && !name) return null;

  const out: Partial<ProductGroup> = {};
  if (name !== undefined) out.name = name;
  if (colorHex !== undefined) {
    if (!isValidHexColor(colorHex)) return null;
    out.colorHex = colorHex.trim();
  }
  if (iconEmoji !== undefined) out.iconEmoji = normalizeEmoji(iconEmoji);

  return out;
}

type Params = {
  readonly params: { readonly id: string };
};

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  const items = await readGroups();
  const group = items.find((g) => g.id === params.id);
  if (!group) return NextResponse.json({ message: 'Grupo não encontrado' }, { status: 404 });
  return NextResponse.json(group);
}

export async function PUT(request: Request, { params }: Params): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });
  }

  const currentGroups = await readGroups();
  const index = currentGroups.findIndex((g) => g.id === params.id);
  if (index < 0) return NextResponse.json({ message: 'Grupo não encontrado' }, { status: 404 });

  const partial = normalizePartial(body);
  if (!partial) return NextResponse.json({ message: 'Dados do grupo inválidos' }, { status: 400 });

  // Se vierem props vazias como string, já tratamos acima.
  const now = new Date().toISOString();
  const updated: ProductGroup = {
    ...currentGroups[index],
    ...partial,
    // preserva id/createdAt
    id: currentGroups[index].id,
    createdAt: currentGroups[index].createdAt,
    updatedAt: now,
  };

  const next = [...currentGroups];
  next[index] = updated;
  await writeGroups(next);

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
  const items = await readGroups();
  const next = items.filter((g) => g.id !== params.id);
  const existed = next.length !== items.length;
  if (!existed) return NextResponse.json({ message: 'Grupo não encontrado' }, { status: 404 });
  await writeGroups(next);
  return NextResponse.json({ ok: true });
}

