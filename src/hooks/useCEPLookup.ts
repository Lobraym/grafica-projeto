'use client';

import { useState, useCallback } from 'react';
import type { Address } from '@/types/client';

const MOCK_CEPS: Record<string, Omit<Address, 'number' | 'complement'>> = {
  '01310100': { cep: '01310-100', street: 'Av. Paulista', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
  '04567000': { cep: '04567-000', street: 'Rua Augusta', neighborhood: 'Consolação', city: 'São Paulo', state: 'SP' },
  '20040020': { cep: '20040-020', street: 'Av. Rio Branco', neighborhood: 'Centro', city: 'Rio de Janeiro', state: 'RJ' },
  '01045001': { cep: '01045-001', street: 'Rua 25 de Março', neighborhood: 'Centro', city: 'São Paulo', state: 'SP' },
};

export function useCEPLookup() {
  const [loading, setLoading] = useState(false);

  const lookupCEP = useCallback(
    async (cep: string): Promise<Omit<Address, 'number' | 'complement'> | null> => {
      const digits = cep.replace(/\D/g, '');
      if (digits.length !== 8) return null;

      setLoading(true);
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);

      return MOCK_CEPS[digits] ?? null;
    },
    []
  );

  return { lookupCEP, loading } as const;
}
