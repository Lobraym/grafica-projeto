'use client';

import { create } from 'zustand';
import type { Product, ProductFormData, ProductMaterial, ProductFinishing } from '@/types/product';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'grafica_products';

/** Migra produto no formato antigo para o novo (productMaterials, finishings) */
function migrateProduct(p: Record<string, unknown>): Product {
  const product = p as unknown as Product;
  if (product.productMaterials && Array.isArray(product.productMaterials)) {
    return {
      ...product,
      defaultMarginPercent: product.defaultMarginPercent ?? 0,
    };
  }
  const old = p as {
    compatibleMaterialIds?: string[];
    basePrice?: number;
    minProductionCost?: number;
    profitMarginPercent?: number;
    finishingOptions?: Record<string, boolean>;
    acceptsFinishing?: boolean;
  };
  const productMaterials: ProductMaterial[] = (old.compatibleMaterialIds ?? []).map((materialId) => ({
    materialId,
    price: old.basePrice ?? 0,
    cost: old.minProductionCost ?? 0,
    marginPercent: old.profitMarginPercent ?? 0,
  }));
  const finishings: ProductFinishing[] = [];
  if (old.acceptsFinishing && old.finishingOptions) {
    const names: Record<string, string> = {
      laminacao: 'Laminação',
      corte: 'Corte',
      dobra: 'Dobra',
      verniz: 'Verniz',
      ilhos: 'Ilhós',
      refile: 'Refile',
    };
    (Object.entries(old.finishingOptions) as [string, boolean][]).forEach(([key, enabled]) => {
      if (enabled) {
        finishings.push({
          id: generateId(),
          name: names[key] ?? key,
          priceExtra: 0,
        });
      }
    });
  }
  return {
    ...product,
    productMaterials,
    finishings,
    minQuantity: product.minQuantity ?? null,
    defaultMarginPercent: product.defaultMarginPercent ?? (old.profitMarginPercent ?? 0),
  };
}

function loadFromStorage(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => migrateProduct(p));
  } catch {
    return [];
  }
}

function saveToStorage(items: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function demoProducts(): Product[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'prod-banner',
      name: 'Banner',
      category: 'comunicacao_visual',
      description: '',
      calculationType: 'por_area',
      measurementUnit: 'm2',
      productMaterials: [],
      finishings: [
        { id: 'fin-1', name: 'Laminação', priceExtra: 10 },
        { id: 'fin-2', name: 'Ilhós', priceExtra: 10 },
      ],
      minQuantity: null,
      defaultMarginPercent: 30,
      status: 'ativo',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-cartao',
      name: 'Cartão de Visita',
      category: 'impressao_digital',
      description: '',
      calculationType: 'por_quantidade',
      measurementUnit: 'milheiro',
      productMaterials: [],
      finishings: [{ id: 'fin-3', name: 'Verniz', priceExtra: 15 }],
      minQuantity: 100,
      defaultMarginPercent: 25,
      status: 'ativo',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-envelope',
      name: 'Envelope',
      category: 'impressao_digital',
      description: '',
      calculationType: 'por_unidade',
      measurementUnit: 'unidade',
      productMaterials: [],
      finishings: [],
      minQuantity: null,
      defaultMarginPercent: 20,
      status: 'ativo',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function getInitialProducts(): Product[] {
  const stored = loadFromStorage();
  if (stored.length > 0) return stored;
  const initial = demoProducts();
  saveToStorage(initial);
  return initial;
}

interface ProductStore {
  products: Product[];
  hydrate: () => void;
  addProduct: (data: ProductFormData) => Product;
  updateProduct: (id: string, data: ProductFormData) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getActiveProducts: () => Product[];
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],

  hydrate: () => {
    set({ products: getInitialProducts() });
  },

  addProduct: (data: ProductFormData) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: generateId(),
      name: data.name.trim(),
      category: data.category,
      description: data.description?.trim() ?? '',
      calculationType: data.calculationType,
      measurementUnit: data.measurementUnit,
      productMaterials: (data.productMaterials ?? []).map((pm) => ({
        ...pm,
        price: Number(Number(pm.price).toFixed(2)),
        cost: Number(Number(pm.cost).toFixed(2)),
        marginPercent: Number(Number(pm.marginPercent).toFixed(1)),
      })),
      finishings: (data.finishings ?? []).map((f) => ({
        ...f,
        priceExtra: Number(Number(f.priceExtra).toFixed(2)),
      })),
      minQuantity: data.minQuantity ?? null,
      defaultMarginPercent: Number(Number(data.defaultMarginPercent ?? 0).toFixed(1)),
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const next = [...state.products, newProduct];
      saveToStorage(next);
      return { products: next };
    });
    return newProduct;
  },

  updateProduct: (id: string, data: ProductFormData) => {
    const now = new Date().toISOString();
    set((state) => {
      const next = state.products.map((p) =>
        p.id === id
          ? {
              ...p,
              name: data.name.trim(),
              category: data.category,
              description: data.description?.trim() ?? '',
              calculationType: data.calculationType,
              measurementUnit: data.measurementUnit,
              productMaterials: (data.productMaterials ?? []).map((pm) => ({
                ...pm,
                price: Number(Number(pm.price).toFixed(2)),
                cost: Number(Number(pm.cost).toFixed(2)),
                marginPercent: Number(Number(pm.marginPercent).toFixed(1)),
              })),
              finishings: (data.finishings ?? []).map((f) => ({
                ...f,
                priceExtra: Number(Number(f.priceExtra).toFixed(2)),
              })),
              minQuantity: data.minQuantity ?? null,
              defaultMarginPercent: Number(Number(data.defaultMarginPercent ?? 0).toFixed(1)),
              status: data.status,
              updatedAt: now,
            }
          : p
      );
      saveToStorage(next);
      return { products: next };
    });
  },

  deleteProduct: (id: string) => {
    set((state) => {
      const next = state.products.filter((p) => p.id !== id);
      saveToStorage(next);
      return { products: next };
    });
  },

  getProductById: (id: string) => get().products.find((p) => p.id === id),
  getActiveProducts: () => get().products.filter((p) => p.status === 'ativo'),
}));
