'use client';

import { create } from 'zustand';
import type { Material, MaterialFormData } from '@/types/product';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'grafica_materials';

function loadFromStorage(): Material[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Material[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m) => ({
      ...m,
      cost: m.cost ?? 0,
      profitMarginPercent: m.profitMarginPercent ?? 0,
    }));
  } catch {
    return [];
  }
}

function saveToStorage(items: Material[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function getInitialMaterials(): Material[] {
  const stored = loadFromStorage();
  return stored;
}

interface MaterialStore {
  materials: Material[];
  hydrate: () => void;
  addMaterial: (data: MaterialFormData) => Material;
  updateMaterial: (id: string, data: Partial<MaterialFormData>) => void;
  deleteMaterial: (id: string) => void;
  getMaterialById: (id: string) => Material | undefined;
}

export const useMaterialStore = create<MaterialStore>((set, get) => ({
  materials: [],

  hydrate: () => {
    set({ materials: getInitialMaterials() });
  },

  addMaterial: (data: MaterialFormData) => {
    const newMaterial: Material = {
      id: generateId(),
      name: data.name.trim(),
      unit: (data.unit ?? '').trim(),
      basePrice: Number(Number(data.basePrice).toFixed(2)),
      cost: Number(Number(data.cost).toFixed(2)),
      profitMarginPercent: Number(Number(data.profitMarginPercent ?? 0).toFixed(1)),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const next = [...state.materials, newMaterial];
      saveToStorage(next);
      return { materials: next };
    });
    return newMaterial;
  },

  updateMaterial: (id: string, data: Partial<MaterialFormData>) => {
    set((state) => {
      const next = state.materials.map((m) =>
        m.id === id
          ? {
              ...m,
              ...(data.name !== undefined && { name: data.name.trim() }),
              ...(data.unit !== undefined && { unit: data.unit.trim() }),
              ...(data.basePrice !== undefined && { basePrice: Number(Number(data.basePrice).toFixed(2)) }),
              ...(data.cost !== undefined && { cost: Number(Number(data.cost).toFixed(2)) }),
              ...(data.profitMarginPercent !== undefined && { profitMarginPercent: Number(Number(data.profitMarginPercent).toFixed(1)) }),
            }
          : m
      );
      saveToStorage(next);
      return { materials: next };
    });
  },

  deleteMaterial: (id: string) => {
    set((state) => {
      const next = state.materials.filter((m) => m.id !== id);
      saveToStorage(next);
      return { materials: next };
    });
  },

  getMaterialById: (id: string) => get().materials.find((m) => m.id === id),
}));
