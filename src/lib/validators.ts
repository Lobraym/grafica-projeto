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
  quantity: z.number().min(1, 'Informe a quantidade'),
  width: z.string().optional().default(''),
  height: z.string().optional().default(''),
  measurementUnit: z.enum(['cm', 'mm', 'm']).default('cm'),
  size: z.string().optional().default(''),
  description: z.string().optional().default(''),
  receptionNotes: z.string().optional().default(''),
  deadline: z.string().optional().default(''),
  value: z.number().min(0.01, 'Informe o valor'),
  requiresPrinting: z.boolean().default(true),
  requiresAssembly: z.boolean().default(false),
  requiresInstallation: z.boolean().default(false),
  installationStreet: z.string().optional().default(''),
  installationNeighborhood: z.string().optional().default(''),
  installationNumber: z.string().optional().default(''),
  installationCity: z.string().optional().default(''),
  installationDate: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  const width = data.width.trim();
  const height = data.height.trim();

  if ((width && !height) || (!width && height)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['width'],
      message: 'Informe largura e altura',
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['height'],
      message: 'Informe largura e altura',
    });
  }

  if (data.requiresInstallation) {
    if (!data.installationStreet.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installationStreet'],
        message: 'Informe a rua da instalação',
      });
    }

    if (!data.installationNeighborhood.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installationNeighborhood'],
        message: 'Informe o bairro da instalação',
      });
    }

    if (!data.installationNumber.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installationNumber'],
        message: 'Informe o numero da instalação',
      });
    }

    if (!data.installationCity.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installationCity'],
        message: 'Informe a cidade da instalação',
      });
    }
  }
});

export type ClientSchemaType = z.infer<typeof clientSchema>;
export type QuoteSchemaType = z.infer<typeof quoteSchema>;
