import { z } from 'zod';

export const addressSchema = z.object({
  cep: z.string().optional().default(''),
  street: z.string().optional().default(''),
  number: z.string().optional().default(''),
  complement: z.string().optional().default(''),
  neighborhood: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
});

export const clientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  personType: z.enum(['PF', 'PJ'], { error: 'Selecione o tipo de pessoa' }),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').or(z.literal('')).optional().default(''),
  address: addressSchema,
  notes: z.string().optional().default(''),
});

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  service: z.string().min(2, 'Informe o serviço'),
  material: z.string().min(2, 'Informe o material'),
  size: z.string().optional().default(''),
  description: z.string().optional().default(''),
  deadline: z.string().min(1, 'Informe o prazo'),
  value: z.number().min(0.01, 'Informe o valor'),
  requiresPrinting: z.boolean().default(true),
  requiresAssembly: z.boolean().default(false),
});

export type ClientSchemaType = z.infer<typeof clientSchema>;
export type QuoteSchemaType = z.infer<typeof quoteSchema>;
