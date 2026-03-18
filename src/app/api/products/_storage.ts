import path from 'node:path';
import fs from 'node:fs/promises';
import type { Product } from '@/types/product';

const DATA_DIR = path.join(process.cwd(), '.data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function readProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Product[];
  } catch {
    return [];
  }
}

export async function writeProducts(items: Product[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(items, null, 2), 'utf8');
}

