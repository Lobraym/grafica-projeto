'use client';

import { useEffect, useCallback } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/lib/validators';
import { BRAZILIAN_STATES } from '@/lib/constants';
import { formatCPF, formatCNPJ, formatPhone, formatCEP } from '@/lib/utils';
import { useCEPLookup } from '@/hooks/useCEPLookup';
import { Loader2 } from 'lucide-react';
import type { ClientFormData } from '@/types/client';
import type { PersonType } from '@/types/common';

interface ClientFormProps {
  readonly initialData?: ClientFormData;
  readonly onSubmit: (data: ClientFormData) => void;
  readonly onCancel: () => void;
}

const DEFAULT_FORM_VALUES: ClientFormData = {
  name: '',
  personType: 'PF',
  cpfCnpj: '',
  phone: '',
  email: '',
  address: {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  },
  notes: '',
};

export function ClientForm({
  initialData,
  onSubmit,
  onCancel,
}: ClientFormProps): React.ReactElement {
  const { lookupCEP, loading: cepLoading } = useCEPLookup();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as Resolver<ClientFormData>,
    defaultValues: initialData ?? DEFAULT_FORM_VALUES,
  });

  const personType = watch('personType');
  const cepValue = watch('address.cep');

  // CEP auto-lookup
  const handleCEPLookup = useCallback(
    async (rawCep: string): Promise<void> => {
      const digits = rawCep.replace(/\D/g, '');
      if (digits.length !== 8) return;

      const result = await lookupCEP(rawCep);
      if (!result) return;

      setValue('address.street', result.street, { shouldValidate: true });
      setValue('address.neighborhood', result.neighborhood, { shouldValidate: true });
      setValue('address.city', result.city, { shouldValidate: true });
      setValue('address.state', result.state, { shouldValidate: true });
    },
    [lookupCEP, setValue],
  );

  useEffect(() => {
    const digits = cepValue?.replace(/\D/g, '') ?? '';
    if (digits.length === 8) {
      void handleCEPLookup(cepValue);
    }
  }, [cepValue, handleCEPLookup]);

  // Clear cpfCnpj when switching person type
  const handlePersonTypeChange = (type: PersonType): void => {
    setValue('personType', type);
    setValue('cpfCnpj', '');
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
    >
      {/* Dados Pessoais */}
      <fieldset className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-900">
          Dados do Cliente
        </legend>

        <div className="mt-2 space-y-5">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              placeholder="Nome do cliente"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Tipo de Pessoa */}
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Tipo de pessoa <span className="text-red-500">*</span>
            </span>
            <div className="mt-2 flex gap-3">
              {(['PF', 'PJ'] as const).map((type) => (
                <label
                  key={type}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                    personType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={type}
                    checked={personType === type}
                    onChange={() => handlePersonTypeChange(type)}
                    className="sr-only"
                  />
                  {type === 'PF' ? 'Pessoa Fisica' : 'Pessoa Juridica'}
                </label>
              ))}
            </div>
            {errors.personType && (
              <p className="mt-1 text-xs text-red-500">{errors.personType.message}</p>
            )}
          </div>

          {/* CPF/CNPJ */}
          <div>
            <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700">
              {personType === 'PF' ? 'CPF' : 'CNPJ'} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="cpfCnpj"
              control={control}
              render={({ field }) => (
                <input
                  id="cpfCnpj"
                  type="text"
                  value={field.value}
                  onChange={(e) => {
                    const formatted = personType === 'PF'
                      ? formatCPF(e.target.value)
                      : formatCNPJ(e.target.value);
                    field.onChange(formatted);
                  }}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder={personType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
              )}
            />
            {errors.cpfCnpj && (
              <p className="mt-1 text-xs text-red-500">{errors.cpfCnpj.message}</p>
            )}
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone <span className="text-red-500">*</span>
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input
                    id="phone"
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="(00) 00000-0000"
                  />
                )}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {/* Endereco */}
      <fieldset className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-900">
          Endereco
        </legend>

        <div className="mt-2 space-y-5">
          {/* CEP */}
          <div className="max-w-xs">
            <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
              CEP
            </label>
            <div className="relative">
              <Controller
                name="address.cep"
                control={control}
                render={({ field }) => (
                  <input
                    id="cep"
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(formatCEP(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="00000-000"
                  />
                )}
              />
              {cepLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500 mt-0.5" />
              )}
            </div>
          </div>

          {/* Rua + Numero */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_120px]">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Rua
              </label>
              <input
                id="street"
                type="text"
                {...register('address.street')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="Nome da rua"
              />
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                Numero
              </label>
              <input
                id="number"
                type="text"
                {...register('address.number')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="123"
              />
            </div>
          </div>

          {/* Complemento + Bairro */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="complement" className="block text-sm font-medium text-gray-700">
                Complemento
              </label>
              <input
                id="complement"
                type="text"
                {...register('address.complement')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="Apto, Sala..."
              />
            </div>

            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                Bairro
              </label>
              <input
                id="neighborhood"
                type="text"
                {...register('address.neighborhood')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="Bairro"
              />
            </div>
          </div>

          {/* Cidade + Estado */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_100px]">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <input
                id="city"
                type="text"
                {...register('address.city')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="state"
                {...register('address.state')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                <option value="">UF</option>
                {BRAZILIAN_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Observacoes */}
      <fieldset className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-900">
          Observacoes
        </legend>

        <div className="mt-2">
          <textarea
            id="notes"
            rows={4}
            {...register('notes')}
            className="block w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            placeholder="Anotacoes sobre o cliente..."
          />
        </div>
      </fieldset>

      {/* Acoes */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar Cliente
        </button>
      </div>
    </form>
  );
}
