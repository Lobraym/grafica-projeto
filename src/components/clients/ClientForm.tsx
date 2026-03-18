'use client';

import { useEffect, useCallback } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/lib/validators';
import { BRAZILIAN_STATES } from '@/lib/constants';
import { formatCPF, formatCNPJ, formatPhone, formatCEP } from '@/lib/utils';
import { useCEPLookup } from '@/hooks/useCEPLookup';
import {
  Loader2,
  User,
  Building2,
  MapPin,
  FileText,
  ChevronDown,
  Save,
} from 'lucide-react';
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

const inputBase =
  'w-full rounded-lg border border-border bg-card-bg px-4 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted/40 shadow-inner shadow-black/10';

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

  const handlePersonTypeChange = (type: PersonType): void => {
    setValue('personType', type);
    setValue('cpfCnpj', '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Dados do Cliente */}
      <div className="relative border border-border rounded-xl p-6 md:p-8 pt-8 md:pt-10 mb-8">
        <div className="absolute -top-3.5 left-6 bg-card-bg px-3 flex items-center gap-2">
          <User className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(8,145,178,0.4)]" />
          <span className="text-sm font-semibold text-text-primary tracking-wide">
            Dados do Cliente
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-2">
              Nome completo <span className="text-primary ml-0.5">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={inputBase}
              placeholder="Ex: João da Silva"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <span className="block text-sm font-medium text-text-muted mb-2">
              Tipo de pessoa <span className="text-primary ml-0.5">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['PF', 'PJ'] as const).map((type) => (
                <label key={type} className="cursor-pointer relative">
                  <input
                    type="radio"
                    value={type}
                    checked={personType === type}
                    onChange={() => handlePersonTypeChange(type)}
                    className="peer sr-only"
                  />
                  <div
                    className={`w-full text-center py-3 rounded-lg border font-medium transition-all flex items-center justify-center gap-2 ${
                      personType === type
                        ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(8,145,178,0.15)] font-semibold'
                        : 'border-border bg-card-bg text-text-muted hover:border-text-muted hover:text-text-primary'
                    }`}
                  >
                    {type === 'PF' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                    {type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </div>
                </label>
              ))}
            </div>
            {errors.personType && (
              <p className="mt-1 text-xs text-red-600">{errors.personType.message}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <label htmlFor="cpfCnpj" className="block text-sm font-medium text-text-muted mb-2">
              {personType === 'PF' ? 'CPF' : 'CNPJ'}{' '}
              <span className="text-primary ml-0.5">*</span>
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
                    const formatted =
                      personType === 'PF'
                        ? formatCPF(e.target.value)
                        : formatCNPJ(e.target.value);
                    field.onChange(formatted);
                  }}
                  className={inputBase}
                  placeholder={
                    personType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'
                  }
                />
              )}
            />
            {errors.cpfCnpj && (
              <p className="mt-1 text-xs text-red-600">{errors.cpfCnpj.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-muted mb-2">
              Telefone <span className="text-primary ml-0.5">*</span>
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
                  className={inputBase}
                  placeholder="(00) 00000-0000"
                />
              )}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={inputBase}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="relative border border-border rounded-xl p-6 md:p-8 pt-8 md:pt-10 mb-8">
        <div className="absolute -top-3.5 left-6 bg-card-bg px-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(8,145,178,0.4)]" />
          <span className="text-sm font-semibold text-text-primary tracking-wide">
            Endereço
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-5">
            <label htmlFor="cep" className="block text-sm font-medium text-text-muted mb-2">
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
                    className={inputBase}
                    placeholder="00000-000"
                  />
                )}
              />
              {cepLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
              )}
            </div>
          </div>

          <div className="hidden md:block col-span-7" />

          <div className="col-span-1 md:col-span-9">
            <label htmlFor="street" className="block text-sm font-medium text-text-muted mb-2">
              Rua
            </label>
            <input
              id="street"
              type="text"
              {...register('address.street')}
              className={inputBase}
              placeholder="Nome da rua"
            />
          </div>

          <div className="col-span-1 md:col-span-3">
            <label htmlFor="number" className="block text-sm font-medium text-text-muted mb-2">
              Número
            </label>
            <input
              id="number"
              type="text"
              {...register('address.number')}
              className={inputBase}
              placeholder="123"
            />
          </div>

          <div className="col-span-1 md:col-span-6">
            <label htmlFor="complement" className="block text-sm font-medium text-text-muted mb-2">
              Complemento
            </label>
            <input
              id="complement"
              type="text"
              {...register('address.complement')}
              className={inputBase}
              placeholder="Apto, Sala..."
            />
          </div>

          <div className="col-span-1 md:col-span-6">
            <label htmlFor="neighborhood" className="block text-sm font-medium text-text-muted mb-2">
              Bairro
            </label>
            <input
              id="neighborhood"
              type="text"
              {...register('address.neighborhood')}
              className={inputBase}
              placeholder="Bairro"
            />
          </div>

          <div className="col-span-1 md:col-span-9">
            <label htmlFor="city" className="block text-sm font-medium text-text-muted mb-2">
              Cidade
            </label>
            <input
              id="city"
              type="text"
              {...register('address.city')}
              className={inputBase}
              placeholder="Cidade"
            />
          </div>

          <div className="col-span-1 md:col-span-3">
            <label htmlFor="state" className="block text-sm font-medium text-text-muted mb-2">
              Estado
            </label>
            <div className="relative">
              <select
                id="state"
                {...register('address.state')}
                className={`${inputBase} appearance-none pr-10 cursor-pointer`}
              >
                <option value="" disabled hidden>
                  UF
                </option>
                {BRAZILIAN_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-text-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="relative border border-border rounded-xl p-6 md:p-8 pt-8 md:pt-10 mb-8">
        <div className="absolute -top-3.5 left-6 bg-card-bg px-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(8,145,178,0.4)]" />
          <span className="text-sm font-semibold text-text-primary tracking-wide">
            Observações
          </span>
        </div>

        <div>
          <textarea
            id="notes"
            rows={4}
            {...register('notes')}
            className={`${inputBase} resize-y`}
            placeholder="Anotações adicionais sobre o cliente..."
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-4 pt-6 mt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-border text-text-primary font-medium hover:bg-card-bg-secondary hover:text-text-primary transition-colors text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(8,145,178,0.25)] hover:shadow-[0_0_20px_rgba(8,145,178,0.35)] text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Salvar Cliente
        </button>
      </div>
    </form>
  );
}
