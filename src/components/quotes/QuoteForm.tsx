'use client';

import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { FileImage, FileText, MapPin, Paperclip, Printer, Trash2, Upload, Wrench } from 'lucide-react';
import { quoteSchema } from '@/lib/validators';
import { useClientStore } from '@/stores/useClientStore';
import type { QuoteFormData, QuoteMeasurementUnit } from '@/types/quote';
import type { FileAttachment } from '@/types/common';
import { cn, generateId } from '@/lib/utils';

type QuoteSchemaInput = z.input<typeof quoteSchema>;
type QuoteSchemaOutput = z.output<typeof quoteSchema>;

interface QuoteFormProps {
  readonly initialData?: Partial<QuoteFormData>;
  readonly onSubmit: (data: QuoteFormData) => void;
  readonly onCancel: () => void;
  readonly preselectedClientId?: string;
}

const MEASUREMENT_UNIT_OPTIONS: ReadonlyArray<{
  readonly value: QuoteMeasurementUnit;
  readonly label: string;
}> = [
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },
  { value: 'm', label: 'm' },
] as const;

export function QuoteForm({
  initialData,
  onSubmit,
  onCancel,
  preselectedClientId,
}: QuoteFormProps): React.ReactElement {
  const clients = useClientStore((state) => state.clients);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceFiles, setReferenceFiles] = useState<FileAttachment[]>(initialData?.files ?? []);

  const handleReferenceFilesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map((file) => ({
      id: generateId(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
    }));

    setReferenceFiles((current) => [...current, ...newFiles]);
    event.target.value = '';
  };

  const handleRemoveReferenceFile = (fileId: string): void => {
    setReferenceFiles((current) => current.filter((file) => file.id !== fileId));
  };

  const handleFormSubmit = (data: QuoteSchemaOutput): void => {
    const width = data.width.trim();
    const height = data.height.trim();
    const size = width && height
      ? `${width} ${data.measurementUnit} x ${height} ${data.measurementUnit}`
      : data.size.trim();

    const formData: QuoteFormData = {
      clientId: data.clientId,
      service: data.service,
      material: data.material,
      quantity: data.quantity,
      width,
      height,
      measurementUnit: data.measurementUnit,
      size,
      description: data.description ?? '',
      receptionNotes: data.receptionNotes ?? '',
      deadline: initialData?.deadline ?? '',
      value: data.value,
      files: referenceFiles,
      requiresPrinting: data.requiresPrinting ?? true,
      requiresAssembly: data.requiresAssembly ?? false,
      requiresInstallation: data.requiresInstallation ?? false,
      installationStreet: data.requiresInstallation ? data.installationStreet.trim() : '',
      installationNeighborhood: data.requiresInstallation ? data.installationNeighborhood.trim() : '',
      installationNumber: data.requiresInstallation ? data.installationNumber.trim() : '',
      installationCity: data.requiresInstallation ? data.installationCity.trim() : '',
      installationDate: data.requiresInstallation ? initialData?.installationDate ?? '' : '',
    };
    onSubmit(formData);
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<QuoteSchemaInput, unknown, QuoteSchemaOutput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: preselectedClientId ?? initialData?.clientId ?? '',
      service: initialData?.service ?? '',
      material: initialData?.material ?? '',
      quantity: initialData?.quantity ?? 1,
      width: initialData?.width ?? '',
      height: initialData?.height ?? '',
      measurementUnit: initialData?.measurementUnit ?? 'cm',
      size: initialData?.size ?? '',
      description: initialData?.description ?? '',
      receptionNotes: initialData?.receptionNotes ?? '',
      deadline: initialData?.deadline ?? '',
      value: initialData?.value ?? 0,
      requiresPrinting: initialData?.requiresPrinting ?? true,
      requiresAssembly: initialData?.requiresAssembly ?? false,
      requiresInstallation: initialData?.requiresInstallation ?? false,
      installationStreet: initialData?.installationStreet ?? '',
      installationNeighborhood: initialData?.installationNeighborhood ?? '',
      installationNumber: initialData?.installationNumber ?? '',
      installationCity: initialData?.installationCity ?? '',
      installationDate: initialData?.installationDate ?? '',
    },
  });

  const requiresInstallation = useWatch({ control, name: 'requiresInstallation' });

  const inputBaseClass =
    'block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-200 ease-out h-10';
  const textareaBaseClass =
    'block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-200 ease-out';
  const selectBaseClass =
    'h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-200 ease-out';

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

          {/* Quantidade */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              placeholder="Ex: 100"
              {...register('quantity', { valueAsNumber: true })}
              className={cn(inputBaseClass, errors.quantity && errorInputClass)}
            />
            {errors.quantity && (
              <p className="mt-1.5 text-xs text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          {/* Medidas */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Medidas
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <label
                  htmlFor="measurementUnit"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Unidade
                </label>
                <select
                  id="measurementUnit"
                  {...register('measurementUnit')}
                  className={cn(
                    selectBaseClass,
                    'w-full',
                    (errors.width || errors.height) && errorInputClass
                  )}
                  aria-label="Unidade das medidas"
                >
                  {MEASUREMENT_UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="width"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Largura
                </label>
                <input
                  id="width"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 20"
                  {...register('width')}
                  className={cn(inputBaseClass, 'w-full', errors.width && errorInputClass)}
                />
                {errors.width && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.width.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="height"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Altura
                </label>
                <input
                  id="height"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 30"
                  {...register('height')}
                  className={cn(inputBaseClass, 'w-full', errors.height && errorInputClass)}
                />
                {errors.height && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.height.message}</p>
                )}
              </div>
            </div>
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
            rows={5}
            placeholder="Detalhes adicionais sobre o servico..."
            {...register('description')}
            className={cn(textareaBaseClass, 'min-h-24 resize-y', errors.description && errorInputClass)}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs text-cyan-800">
          O prazo de produção começa após a aprovação da arte pelo cliente.
          Após a aprovação, o sistema inicia automaticamente 10 dias de produção.
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-base font-semibold text-gray-900 mb-4">Anexos / Referencias</legend>

        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Anexe arquivos de referencia do cliente
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Aceita PDF, PNG, JPG e JPEG. Voce pode anexar varios arquivos no mesmo orcamento.
              </p>
            </div>

            <div className="shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                multiple
                onChange={handleReferenceFilesChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors duration-200 ease-out hover:bg-slate-100 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Adicionar Arquivos
              </button>
            </div>
          </div>

          {referenceFiles.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {referenceFiles.map((file) => {
                const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');

                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      {isPdf ? <FileText className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {isPdf ? 'PDF' : 'Imagem de referencia'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveReferenceFile(file.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 ease-out hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      aria-label={`Remover ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-8 text-center transition-colors duration-200 ease-out hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <Paperclip className="h-8 w-8 text-slate-400" />
              <span className="text-sm text-slate-600">Clique para anexar referencias do cliente</span>
              <span className="text-xs text-slate-400">PDF, PNG, JPG ou JPEG</span>
            </button>
          )}

          <div className="mt-5">
            <label htmlFor="receptionNotes" className="block text-sm font-medium text-slate-700 mb-1.5">
              Instrucoes para a designer
            </label>
            <textarea
              id="receptionNotes"
              rows={4}
              placeholder="Informacoes adicionais, combinados com o cliente ou pontos de atencao para a criacao da arte..."
              {...register('receptionNotes')}
              className={cn(textareaBaseClass, 'min-h-20 resize-y bg-white', errors.receptionNotes && errorInputClass)}
            />
            {errors.receptionNotes && (
              <p className="mt-1.5 text-xs text-red-600">{errors.receptionNotes.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Secao: Etapas de Producao */}
      <fieldset>
        <legend className="text-base font-semibold text-gray-900 mb-4">Etapas de Producao</legend>
        <div className="grid gap-3 md:grid-cols-3">
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
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Printer className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-gray-900">Impressao</p>
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
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Wrench className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-gray-900">Montagem</p>
            </div>
          </label>

          <label
            htmlFor="requiresInstallation"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:border-slate-300 transition-colors duration-200 ease-out has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/50"
          >
            <input
              id="requiresInstallation"
              type="checkbox"
              {...register('requiresInstallation')}
              className="h-4 w-4 rounded border-gray-300 accent-cyan-600 focus:ring-cyan-500"
            />
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <MapPin className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-gray-900">Instalacao</p>
            </div>
          </label>
        </div>

        {requiresInstallation && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-emerald-900">Dados da Instalacao</h3>
              <p className="mt-1 text-xs text-emerald-700">
                Essas informacoes serao usadas no resumo impresso para a equipe de instalacao.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="installationStreet"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Rua <span className="text-red-500">*</span>
                </label>
                <input
                  id="installationStreet"
                  type="text"
                  placeholder="Ex: Rua das Flores"
                  {...register('installationStreet')}
                  className={cn(inputBaseClass, errors.installationStreet && errorInputClass)}
                />
                {errors.installationStreet && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationStreet.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="installationNeighborhood"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Bairro <span className="text-red-500">*</span>
                </label>
                <input
                  id="installationNeighborhood"
                  type="text"
                  placeholder="Ex: Centro"
                  {...register('installationNeighborhood')}
                  className={cn(inputBaseClass, errors.installationNeighborhood && errorInputClass)}
                />
                {errors.installationNeighborhood && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationNeighborhood.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="installationNumber"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Numero <span className="text-red-500">*</span>
                </label>
                <input
                  id="installationNumber"
                  type="text"
                  placeholder="Ex: 123"
                  {...register('installationNumber')}
                  className={cn(inputBaseClass, errors.installationNumber && errorInputClass)}
                />
                {errors.installationNumber && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationNumber.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="installationCity"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  id="installationCity"
                  type="text"
                  placeholder="Ex: Sao Paulo"
                  {...register('installationCity')}
                  className={cn(inputBaseClass, errors.installationCity && errorInputClass)}
                />
                {errors.installationCity && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.installationCity.message}</p>
                )}
              </div>

            </div>
          </div>
        )}
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
