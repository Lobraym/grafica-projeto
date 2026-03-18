import { NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import type { ProductGroup, ProductGroupInput } from '@/types/product-group';
import { readGroups, writeGroups } from './_storage';

function isValidHexColor(colorHex: unknown): colorHex is string {
  if (typeof colorHex !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(colorHex.trim());
}

function normalizeEmoji(input: unknown): string {
  if (typeof input !== 'string') return '📦';
  const s = input.trim();
  if (!s) return '📦';
  // Conta caracteres por codepoint para evitar truncar emoji “pelo meio”.
  const len = Array.from(s).length;
  return len > 4 ? Array.from(s).slice(0, 4).join('') : s;
}

function normalizeGroupInput(payload: unknown): ProductGroupInput | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;

  const id = typeof p.id === 'string' ? p.id.trim() : undefined;
  const name = typeof p.name === 'string' ? p.name.trim() : '';
  const colorHex = p.colorHex;
  const iconEmoji = p.iconEmoji;

  if (!name) return null;
  if (!isValidHexColor(colorHex)) return null;

  return {
    id: id && id ? id : undefined,
    name,
    colorHex: colorHex.trim(),
    iconEmoji: normalizeEmoji(iconEmoji),
  };
}

export async function GET(): Promise<NextResponse> {
  const items = await readGroups();
  return NextResponse.json(items);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Payload inválido' }, { status: 400 });
  }

  const incoming = normalizeGroupInput(body);
  if (!incoming) {
    return NextResponse.json({ message: 'Dados do grupo inválidos' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = incoming.id?.trim() ? incoming.id.trim() : generateId();

  const productGroup: ProductGroup = {
    id,
    name: incoming.name,
    colorHex: incoming.colorHex,
    iconEmoji: incoming.iconEmoji,
    createdAt: now,
    updatedAt: now,
  };

  const items = await readGroups();
  const next = [...items, productGroup];
  await writeGroups(next);

  return NextResponse.json(productGroup, { status: 201 });
}

