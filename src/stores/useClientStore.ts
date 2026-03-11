'use client';

import { create } from 'zustand';
import type { Client, ClientFormData } from '@/types/client';
import { mockClients } from '@/mock/clients';
import { generateId } from '@/lib/utils';

interface ClientStore {
  clients: Client[];
  addClient: (data: ClientFormData) => Client;
  updateClient: (id: string, data: Partial<ClientFormData>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  searchClients: (query: string) => Client[];
  getClientsByLetter: (letter: string) => Client[];
  getAvailableLetters: () => string[];
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: mockClients,

  addClient: (data: ClientFormData) => {
    const newClient: Client = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ clients: [...state.clients, newClient] }));
    return newClient;
  },

  updateClient: (id: string, data: Partial<ClientFormData>) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...data } : client
      ),
    }));
  },

  deleteClient: (id: string) => {
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
    }));
  },

  getClientById: (id: string) => {
    return get().clients.find((client) => client.id === id);
  },

  searchClients: (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().clients;
    return get().clients.filter(
      (client) =>
        client.name.toLowerCase().includes(q) ||
        client.phone.includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.cpfCnpj.includes(q)
    );
  },

  getClientsByLetter: (letter: string) => {
    return get().clients.filter(
      (client) => client.name.charAt(0).toUpperCase() === letter.toUpperCase()
    );
  },

  getAvailableLetters: () => {
    const letters = new Set(
      get().clients.map((client) => client.name.charAt(0).toUpperCase())
    );
    return Array.from(letters).sort();
  },
}));
