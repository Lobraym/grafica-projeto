'use client';

import { create } from 'zustand';
import type { Product, ProductFormData, ProductMaterial, ProductFinishing } from '@/types/product';
import { generateId } from '@/lib/utils';

const API_BASE = '/api/products';

type AddProductInput = ProductFormData | (Partial<Product> & Pick<Product, 'name'>);
type UpdateProductInput = Partial<Product> & { name?: string };

/** Migra produto legado para manter o `defaultMarginPercent` consistente. */
function migrateProduct(p: Record<string, unknown>): Product {
  const product = p as unknown as Product;
  return {
    ...product,
    defaultMarginPercent: product.defaultMarginPercent ?? 0,
  };
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_BASE, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map((p) => migrateProduct(p as Record<string, unknown>));
  } catch {
    return [];
  }
}

async function upsertProductToApi(payload: Product): Promise<Product | null> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

async function updateProductToApi(id: string, payload: Partial<Product>): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

async function deleteProductFromApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}

interface ProductStore {
  products: Product[];
  hydrate: () => void;
  addProduct: (data: AddProductInput) => Product;
  updateProduct: (id: string, data: UpdateProductInput) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getActiveProducts: () => Product[];
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],

  hydrate: () => {
    void (async () => {
      const items = await fetchProducts();
      set({ products: items });
    })();
  },

  addProduct: (data: AddProductInput) => {
    const now = new Date().toISOString();
    const id = generateId();
    const newProduct: Product = {
      id,
      name: data.name.trim(),
      groupId: 'groupId' in data ? (data.groupId ?? null) : undefined,
      photoUrl: 'photoUrl' in data ? (data.photoUrl ?? null) : undefined,
      createdAt: now,
      updatedAt: now,
      // legado
      category: 'category' in data ? data.category : undefined,
      description: 'description' in data ? data.description : '',
      calculationType: 'calculationType' in data ? data.calculationType : undefined,
      measurementUnit: 'measurementUnit' in data ? data.measurementUnit : undefined,
      productMaterials: 'productMaterials' in data ? data.productMaterials : undefined,
      finishings: 'finishings' in data ? data.finishings : undefined,
      minQuantity: 'minQuantity' in data ? data.minQuantity : null,
      defaultMarginPercent: 'defaultMarginPercent' in data ? data.defaultMarginPercent : undefined,
      status: 'status' in data ? data.status : undefined,
      // PRD
      productType: 'productType' in data ? data.productType : undefined,
      billingType: 'billingType' in data ? data.billingType : undefined,
      minArea: 'minArea' in data ? data.minArea : undefined,
      marginPercent: 'marginPercent' in data ? data.marginPercent : undefined,
      active: 'active' in data ? data.active : undefined,
      costBlocks: 'costBlocks' in data ? data.costBlocks : undefined,
      priceTiers: 'priceTiers' in data ? data.priceTiers : undefined,
    };

    set((state) => ({ products: [...state.products, newProduct] }));

    void (async () => {
      const saved = await upsertProductToApi({ ...newProduct, id });
      if (!saved) return;
      set((state) => ({
        products: state.products.map((p) => (p.id === saved.id ? saved : p)),
      }));
    })();

    return newProduct;
  },

  updateProduct: (id: string, data: UpdateProductInput) => {
    const now = new Date().toISOString();
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id
          ? {
              ...p,
              ...(data.name ? { name: data.name.trim() } : {}),
              updatedAt: now,
              // legacy
              ...(('category' in data ? { category: data.category } : {}) as Partial<Product>),
              ...(('description' in data ? { description: data.description?.trim() ?? '' } : {}) as Partial<Product>),
              ...(('calculationType' in data ? { calculationType: data.calculationType } : {}) as Partial<Product>),
              ...(('measurementUnit' in data ? { measurementUnit: data.measurementUnit } : {}) as Partial<Product>),
              ...(('productMaterials' in data ? { productMaterials: data.productMaterials } : {}) as Partial<Product>),
              ...(('finishings' in data ? { finishings: data.finishings } : {}) as Partial<Product>),
              ...(('minQuantity' in data ? { minQuantity: data.minQuantity ?? null } : {}) as Partial<Product>),
              ...(('defaultMarginPercent' in data ? { defaultMarginPercent: data.defaultMarginPercent } : {}) as Partial<Product>),
              ...(('status' in data ? { status: data.status } : {}) as Partial<Product>),
              // PRD
              ...(('productType' in data ? { productType: data.productType } : {}) as Partial<Product>),
              ...(('billingType' in data ? { billingType: data.billingType } : {}) as Partial<Product>),
              ...(('minArea' in data ? { minArea: data.minArea } : {}) as Partial<Product>),
              ...(('marginPercent' in data ? { marginPercent: data.marginPercent } : {}) as Partial<Product>),
              ...(('active' in data ? { active: data.active } : {}) as Partial<Product>),
              ...(('costBlocks' in data ? { costBlocks: data.costBlocks } : {}) as Partial<Product>),
              ...(('priceTiers' in data ? { priceTiers: data.priceTiers } : {}) as Partial<Product>),
              ...(('groupId' in data ? { groupId: data.groupId } : {}) as Partial<Product>),
              ...(('photoUrl' in data ? { photoUrl: data.photoUrl } : {}) as Partial<Product>),
            }
          : p
      ),
    }));

    void (async () => {
      const saved = await updateProductToApi(id, data as Partial<Product>);
      if (!saved) return;
      set((state) => ({
        products: state.products.map((p) => (p.id === saved.id ? saved : p)),
      }));
    })();
  },

  deleteProduct: (id: string) => {
    set((state) => {
      return { products: state.products.filter((p) => p.id !== id) };
    });

    void deleteProductFromApi(id);
  },

  getProductById: (id: string) => get().products.find((p) => p.id === id),
  getActiveProducts: () =>
    get().products.filter((p) => {
      const status = p.status ?? (typeof p.active === 'boolean' ? (p.active ? 'ativo' : 'inativo') : undefined);
      return status === 'ativo';
    }),
}));
