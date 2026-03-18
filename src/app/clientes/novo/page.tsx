'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useClientStore } from '@/stores/useClientStore';
import { ClientForm } from '@/components/clients/ClientForm';
import type { ClientFormData } from '@/types/client';

export default function NovoClientePage(): React.ReactElement {
  const router = useRouter();
  const addClient = useClientStore((state) => state.addClient);

  const handleSubmit = (data: ClientFormData): void => {
    addClient(data);
    router.push('/clientes');
  };

  const handleCancel = (): void => {
    router.push('/clientes');
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <Link
          href="/clientes"
          className="group inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <div className="w-7 h-7 rounded-md bg-card-bg border border-border flex items-center justify-center group-hover:border-text-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Voltar para lista
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            Novo Cliente
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Preencha os dados abaixo para cadastrar um novo cliente no sistema.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card-bg shadow-lg shadow-black/20 p-6 md:p-8 mb-12">
        <ClientForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
