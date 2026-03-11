'use client';

import { useRouter } from 'next/navigation';
import { useClientStore } from '@/stores/useClientStore';
import { PageHeader } from '@/components/layout/PageHeader';
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
    <div className="space-y-6">
      <PageHeader
        title="Novo Cliente"
        subtitle="Preencha os dados para cadastrar um novo cliente"
      />

      <div className="mx-auto max-w-2xl">
        <ClientForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
