'use client';

import { create } from 'zustand';
import type { ProductGroup, ProductGroupInput } from '@/types/product-group';

const API_BASE = '/api/product-groups';

type ProductGroupInputPayload = ProductGroupInput;

async function fetchGroups(): Promise<ProductGroup[]> {
  try {
    const res = await fetch(API_BASE, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return data as ProductGroup[];
  } catch {
    return [];
  }
}

async function addGroupToApi(payload: ProductGroupInputPayload): Promise<ProductGroup | null> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as ProductGroup;
  } catch {
    return null;
  }
}

async function updateGroupToApi(id: string, payload: Partial<ProductGroupInputPayload>): Promise<ProductGroup | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as ProductGroup;
  } catch {
    return null;
  }
}

async function deleteGroupFromApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}

interface ProductGroupStore {
  groups: ProductGroup[];
  hydrate: () => void;
  addGroup: (data: ProductGroupInputPayload) => ProductGroup | null;
  updateGroup: (id: string, data: Partial<ProductGroupInputPayload>) => void;
  deleteGroup: (id: string) => void;
  getGroupById: (id: string) => ProductGroup | undefined;
}

export const useProductGroupStore = create<ProductGroupStore>((set, get) => ({
  groups: [],

  hydrate: () => {
    void (async () => {
      const items = await fetchGroups();
      set({ groups: items });
    })();
  },

  addGroup: (data: ProductGroupInputPayload) => {
    const optimistic: ProductGroup = {
      id: data.id ?? `tmp_${Date.now().toString(36)}`,
      name: data.name,
      colorHex: data.colorHex,
      iconEmoji: data.iconEmoji,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ groups: [...state.groups, optimistic] }));

    void (async () => {
      const saved = await addGroupToApi(data);
      if (!saved) return;
      set((state) => ({
        groups: state.groups.map((g) => (g.id === optimistic.id ? saved : g)),
      }));
    })();

    return optimistic;
  },

  updateGroup: (id: string, data: Partial<ProductGroupInputPayload>) => {
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g)),
    }));

    void (async () => {
      const saved = await updateGroupToApi(id, data);
      if (!saved) return;
      set((state) => ({
        groups: state.groups.map((g) => (g.id === saved.id ? saved : g)),
      }));
    })();
  },

  deleteGroup: (id: string) => {
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
    void deleteGroupFromApi(id);
  },

  getGroupById: (id: string) => get().groups.find((g) => g.id === id),
}));

