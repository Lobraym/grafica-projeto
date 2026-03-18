import path from 'node:path';
import fs from 'node:fs/promises';
import type { ProductGroup } from '@/types/product-group';

const DATA_DIR = path.join(process.cwd(), '.data');
const GROUPS_FILE = path.join(DATA_DIR, 'product-groups.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function readGroups(): Promise<ProductGroup[]> {
  try {
    const raw = await fs.readFile(GROUPS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ProductGroup[];
  } catch {
    return [];
  }
}

export async function writeGroups(items: ProductGroup[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(GROUPS_FILE, JSON.stringify(items, null, 2), 'utf8');
}

