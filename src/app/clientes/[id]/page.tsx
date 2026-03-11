'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  User,
  Building2,
  Calendar,
  StickyNote,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useClientStore } from '@/stores/useClientStore';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// bundle-dynamic-imports: formulário pesado (RHF + Zod) carrega sob demanda
const ClientForm = dynamic(
  () => import('@/components/clients/ClientForm').then((m) => m.ClientForm),
  { ssr: false }
);
import {
  formatPhone,
  formatCurrency,
  formatDate,
  formatCEP,
  getDaysUntil,
  getDeadlineUrgency,
} from '@/lib/utils';
import type { ClientFormData } from '@/types/client';

const URGENCY_STYLES = {
  overdue: 'text-red-600',
  urgent: 'text-orange-600',
  normal: 'text-gray-500',
} as const;

export default function ClienteDetalhePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const clients = useClientStore((s) => s.clients);
  const updateClient = useClientStore((s) => s.updateClient);
  const deleteClient = useClientStore((s) => s.deleteClient);
  const quotes = useQuoteStore((s) => s.quotes);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const client = useMemo(() => clients.find((c) => c.id === id), [clients, id]);
  const clientQuotes = useMemo(
    () => (client ? quotes.filter((q) => q.clientId === client.id) : []),
    [client, quotes],
  );

  if (!client) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente nao encontrado" />
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <User className="mx-auto h-10 w-10 text-red-300" />
          <h3 className="mt-3 text-sm font-semibold text-red-800">
            Cliente nao encontrado
          </h3>
          <p className="mt-1 text-sm text-red-600">
            O cliente solicitado nao existe ou foi removido.
          </p>
          <Link
            href="/clientes"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para clientes
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdate = (data: ClientFormData): void => {
    updateClient(id, data);
    setIsEditing(false);
  };

  const handleDelete = (): void => {
    deleteClient(id);
    router.push('/clientes');
  };

  const hasAddress =
    client.address.street ||
    client.address.city ||
    client.address.state;

  if (isEditing) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Cliente"
          subtitle={client.name}
        />
        <div className="mx-auto max-w-2xl">
          <ClientForm
            initialData={{
              name: client.name,
              personType: client.personType,
              cpfCnpj: client.cpfCnpj,
              phone: client.phone,
              email: client.email,
              address: client.address,
              notes: client.notes,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title={client.name} subtitle={`Cadastrado em ${formatDate(client.createdAt)}`}>
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 ease-out cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </button>
      </PageHeader>

      {/* Info do Cliente */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dados Principais */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <User className="h-4 w-4 text-gray-400" />
            Dados do Cliente
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={client.personType === 'PF' ? User : Building2}
              label="Tipo"
              value={client.personType === 'PF' ? 'Pessoa Fisica' : 'Pessoa Juridica'}
            />
            <InfoItem
              icon={FileText}
              label={client.personType === 'PF' ? 'CPF' : 'CNPJ'}
              value={client.cpfCnpj}
            />
            <InfoItem
              icon={Phone}
              label="Telefone"
              value={formatPhone(client.phone)}
            />
            <InfoItem
              icon={Mail}
              label="Email"
              value={client.email || 'Nao informado'}
              muted={!client.email}
            />
          </div>

          {/* Endereco */}
          {hasAddress && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-gray-400" />
                Endereco
              </h3>
              <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                {client.address.street && (
                  <p>
                    {client.address.street}
                    {client.address.number ? `, ${client.address.number}` : ''}
                    {client.address.complement ? ` - ${client.address.complement}` : ''}
                  </p>
                )}
                {client.address.neighborhood && <p>{client.address.neighborhood}</p>}
                {(client.address.city || client.address.state) && (
                  <p>
                    {client.address.city}
                    {client.address.state ? ` - ${client.address.state}` : ''}
                  </p>
                )}
                {client.address.cep && (
                  <p className="text-gray-500">{formatCEP(client.address.cep)}</p>
                )}
              </div>
            </div>
          )}

          {/* Observacoes */}
          {client.notes && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <StickyNote className="h-4 w-4 text-gray-400" />
                Observacoes
              </h3>
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-amber-50 p-4 text-sm text-gray-700">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Resumo</h3>
            <div className="mt-4 space-y-3">
              <SummaryRow label="Total de orcamentos" value={String(clientQuotes.length)} />
              <SummaryRow
                label="Valor total"
                value={formatCurrency(clientQuotes.reduce((sum, q) => sum + q.value, 0))}
                highlight
              />
              <SummaryRow
                label="Em andamento"
                value={String(clientQuotes.filter((q) => q.status !== 'entregue').length)}
              />
            </div>
          </div>

          <Link
            href={`/orcamentos/novo?clientId=${client.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 transition-colors duration-200 ease-out cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Orcamento
          </Link>
        </div>
      </div>

      {/* Historico de Orcamentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FileText className="h-4 w-4 text-gray-400" />
            Historico de Orcamentos
          </h2>
        </div>

        {clientQuotes.length === 0 ? (
          <EmptyState
            title="Nenhum orcamento"
            description="Este cliente ainda nao possui orcamentos cadastrados."
            icon={FileText}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {clientQuotes.map((quote) => {
              const daysUntil = getDaysUntil(quote.deadline);
              const urgency = getDeadlineUrgency(quote.deadline);

              return (
                <Link
                  key={quote.id}
                  href={`/orcamentos/${quote.id}`}
                  className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {quote.service}
                      </p>
                      <StatusBadge status={quote.status} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {quote.material}
                      {quote.size ? ` - ${quote.size}` : ''}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(quote.value)}
                      </p>
                      <p className={`text-xs ${URGENCY_STYLES[urgency]}`}>
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {quote.status === 'entregue'
                          ? `Entregue em ${formatDate(quote.updatedAt)}`
                          : daysUntil < 0
                            ? `${Math.abs(daysUntil)} dia${Math.abs(daysUntil) !== 1 ? 's' : ''} atrasado`
                            : daysUntil === 0
                              ? 'Entrega hoje'
                              : `${daysUntil} dia${daysUntil !== 1 ? 's' : ''} restante${daysUntil !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir o cliente "${client.name}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

interface InfoItemProps {
  readonly icon: React.ElementType;
  readonly label: string;
  readonly value: string;
  readonly muted?: boolean;
}

function InfoItem({ icon: Icon, label, value, muted = false }: InfoItemProps): React.ReactElement {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`truncate text-sm font-medium ${muted ? 'text-gray-400 italic' : 'text-gray-900'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  readonly label: string;
  readonly value: string;
  readonly highlight?: boolean;
}

function SummaryRow({ label, value, highlight = false }: SummaryRowProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-cyan-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
