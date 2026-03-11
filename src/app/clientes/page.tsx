'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { useClientStore } from '@/stores/useClientStore';
import { ALPHABET } from '@/lib/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { AlphabetGrid } from '@/components/ui/AlphabetGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClientCard } from '@/components/clients/ClientCard';

export default function ClientesPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const clients = useClientStore((s) => s.clients);

  const availableLetters = useMemo(
    () => Array.from(new Set(clients.map((c) => c.name.charAt(0).toUpperCase()))).sort(),
    [clients]
  );

  const isSearching = searchQuery.trim().length > 0;

  const displayedClients = useMemo(() => {
    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      return clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.cpfCnpj.includes(q)
      );
    }
    if (activeLetter) {
      return clients.filter((c) => c.name.charAt(0).toUpperCase() === activeLetter);
    }
    return [];
  }, [clients, isSearching, searchQuery, activeLetter]);

  const handleLetterClick = useCallback((letter: string): void => {
    setActiveLetter((prev) => (prev === letter ? null : letter));
    setSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((value: string): void => {
    setSearchQuery(value);
    if (value.trim()) {
      setActiveLetter(null);
    }
  }, []);

  const showClients = isSearching || activeLetter !== null;

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" subtitle={`${clients.length} clientes cadastrados`}>
        <Link
          href="/clientes/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Link>
      </PageHeader>

      {/* Busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar por nome, telefone, email ou CPF/CNPJ..."
        />
        {isSearching && (
          <span className="shrink-0 text-sm text-gray-500">
            {displayedClients.length} resultado{displayedClients.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Alfabeto */}
      {!isSearching && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <AlphabetGrid
            letters={ALPHABET}
            activeLetter={activeLetter}
            onLetterClick={handleLetterClick}
            availableLetters={availableLetters}
          />
        </div>
      )}

      {/* Lista de Clientes */}
      {showClients && displayedClients.length > 0 && (
        <div className="space-y-2">
          {activeLetter && !isSearching && (
            <h2 className="text-lg font-semibold text-gray-900">
              Letra {activeLetter}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({displayedClients.length} cliente{displayedClients.length !== 1 ? 's' : ''})
              </span>
            </h2>
          )}

          <div className="grid gap-2">
            {displayedClients.map((client, index) => (
              <div
                key={client.id}
                style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
              >
                <ClientCard client={client} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {showClients && displayedClients.length === 0 && (
        <EmptyState
          title={
            isSearching
              ? 'Nenhum cliente encontrado'
              : `Nenhum cliente com a letra ${activeLetter}`
          }
          description={
            isSearching
              ? 'Tente buscar com outros termos.'
              : 'Cadastre um novo cliente para vê-lo aqui.'
          }
          icon={Users}
        />
      )}

      {!showClients && clients.length === 0 && (
        <EmptyState
          title="Nenhum cliente cadastrado"
          description="Comece cadastrando seu primeiro cliente."
          icon={Users}
        />
      )}

      {!showClients && clients.length > 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Selecione uma letra ou busque para visualizar os clientes
          </p>
        </div>
      )}
    </div>
  );
}
