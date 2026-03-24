import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import { generateId } from '@/lib/utils';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

function getExtensionFromMime(mime: string): string | null {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return null;
}

function sanitizeFileBaseName(name: string): string {
  // Remove qualquer separador/paths e caracteres perigosos.
  const base = path.basename(name).replace(/[^a-zA-Z0-9_-]/g, '');
  return base.slice(0, 60) || 'produto';
}

async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // ignore
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Arquivo inválido' }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ message: 'Tipo de arquivo não suportado' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'Arquivo muito grande (máx. 2MB)' }, { status: 400 });
  }

  const ext = getExtensionFromMime(file.type);
  if (!ext) return NextResponse.json({ message: 'Extensão inválida' }, { status: 400 });

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'produtos');
  await ensureDir(uploadsDir);

  const safeBase = sanitizeFileBaseName(file.name || 'produto');
  const id = generateId();
  const filename = `${id}_${safeBase}.${ext}`;
  const fullPath = path.join(uploadsDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(fullPath, buffer);

  const photoUrl = `/uploads/produtos/${filename}`;
  return NextResponse.json({ photoUrl });
}

