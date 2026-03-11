'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { quoteSchema } from '@/lib/validators';
import { useClientStore } from '@/stores/useClientStore';
import type { QuoteFormData } from '@/types/quote';
import { cn } from '@/lib/utils';

type QuoteSchemaInput = z.input<typeof quoteSchema>;
type QuoteSchemaOutput = z.output<typeof quoteSchema>;

interface QuoteFormProps {
  readonly initialData?: Partial<QuoteFormData>;
  readonly onSubmit: (data: QuoteFormData) => void;
  readonly onCancel: () => void;
  readonly preselectedClientId?: string;
}

export function QuoteForm({
  initialData,
  onSubmit,
  onCancel,
  preselectedClientId,
}: QuoteFormProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);

  const handleFormSubmit = (data: QuoteSchemaOutput): void => {
    const formData: QuoteFormData = {
      clientId: data.clientId,
      service: data.service,
      material: data.material,
      size: data.size ?? '',
      description: data.description ?? '',
      deadline: data.deadline,
      value: data.value,
      requiresPrinting: data.requiresPrinting ?? true,
      requiresAssembly: data.requiresAssembly ?? false,
    };
    onSubmit(formData);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteSchemaInput, unknown, QuoteSchemaOutput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: preselectedClientId ?? initialData?.clientId ?? '',
      service: initialData?.service ?? '',
      material: initialData?.material ?? '',
      size: initialData?.size ?? '',
      description: initialData?.description ?? '',
      deadline: initialData?.deadline ?? '',
      value: initialData?.value ?? 0,
      requiresPrinting: initialData?.requiresPrinting ?? true,
      requiresAssembly: initialData?.requiresAssembly ?? false,
    },
  });

  const inputBaseClass =
    'block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-200 ease-out h-10';

  const errorInputClass = 'border-red-300 focus:border-red-500 focus:ring-red-500/20';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Secao: Informacoes do Cliente */}
      <fieldset>
        <legend className="text-base font-semibold text-gray-900 mb-4">Informacoes do Cliente</legend>
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-1.5">
            Cliente <span className="text-red-500">*</span>
          </label>
          <select
            id="clientId"
            {...register('clientId')}
            disabled={Boolean(preselectedClientId)}
            className={cn(
              inputBaseClass,
              'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%239ca3af%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
              errors.clientId && errorInputClass,
              preselectedClientId && 'bg-gray-50 text-gray-500 cursor-not-allowed'
            )}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1.5 text-xs text-red-600">{errors.clientId.message}</p>
          )}
        </div>
      </fieldset>

      {/* Secao: Detalhes do Servico */}
      <fieldset>
        <legend className="text-base font-semibold text-gray-900 mb-4">Detalhes do Servico</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Servico */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-slate-700 mb-1.5">
              Servico <span className="text-red-500">*</span>
            </label>
            <input
              id="service"
              type="text"
              placeholder="Ex: Cartao de visita, Banner, Adesivo"
              {...register('service')}
              className={cn(inputBaseClass, errors.service && errorInputClass)}
            />
            {errors.service && (
              <p className="mt-1.5 text-xs text-red-600">{errors.service.message}</p>
            )}
          </div>

          {/* Material */}
          <div>
            <label htmlFor="material" className="block text-sm font-medium text-slate-700 mb-1.5">
              Material <span className="text-red-500">*</span>
            </label>
            <input
              id="material"
              type="text"
              placeholder="Ex: Couche 300g, Vinilico, Lona"
              {...register('material')}
              className={cn(inputBaseClass, errors.material && errorInputClass)}
            />
            {errors.material && (
              <p className="mt-1.5 text-xs text-red-600">{errors.material.message}</p>
            )}
          </div>

          {/* Tamanho */}
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-slate-700 mb-1.5">
              Tamanho
            </label>
            <input
              id="size"
              type="text"
              placeholder="Ex: 9x5cm, A4, 2x1m"
              {...register('size')}
              className={cn(inputBaseClass, errors.size && errorInputClass)}
            />
            {errors.size && (
              <p className="mt-1.5 text-xs text-red-600">{errors.size.message}</p>
            )}
          </div>

          {/* Prazo */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1.5">
              Prazo de Entrega <span className="text-red-500">*</span>
            </label>
            <input
              id="deadline"
              type="date"
              {...register('deadline')}
              className={cn(inputBaseClass, errors.deadline && errorInputClass)}
            />
            {errors.deadline && (
              <p className="mt-1.5 text-xs text-red-600">{errors.deadline.message}</p>
            )}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-1.5">
              Valor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium select-none">
                R$
              </span>
              <input
                id="value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('value', { valueAsNumber: true })}
                className={cn(inputBaseClass, 'pl-10', errors.value && errorInputClass)}
              />
            </div>
            {errors.value && (
              <p className="mt-1.5 text-xs text-red-600">{errors.value.message}</p>
            )}
          </div>
        </div>

        {/* Descricao */}
        <div className="mt-5">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
            Descricao
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Detalhes adicionais sobre o servico..."
            {...register('description')}
            className={cn(inputBaseClass, 'resize-none', errors.description && errorInputClass)}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>
      </fieldset>

      {/* Secao: Etapas de Producao */}
      <fieldset>
        <legend className="text-base font-semibold text-gray-900 mb-4">Etapas de Producao</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <label
            htmlFor="requiresPrinting"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:border-slate-300 transition-colors duration-200 ease-out has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50"
          >
            <input
              id="requiresPrinting"
              type="checkbox"
              {...register('requiresPrinting')}
              className="h-4 w-4 rounded border-gray-300 accent-cyan-600 focus:ring-cyan-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Impressao</span>
              <p className="text-xs text-gray-500">Requer etapa de impressao</p>
            </div>
          </label>

          <label
            htmlFor="requiresAssembly"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:border-slate-300 transition-colors duration-200 ease-out has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50"
          >
            <input
              id="requiresAssembly"
              type="checkbox"
              {...register('requiresAssembly')}
              className="h-4 w-4 rounded border-gray-300 accent-cyan-600 focus:ring-cyan-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Montagem</span>
              <p className="text-xs text-gray-500">Requer etapa de montagem</p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Botoes */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-out cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-out shadow-sm cursor-pointer"
        >
          {isSubmitting ? 'Salvando...' : 'Criar Orcamento'}
        </button>
      </div>
    </form>
  );
}
