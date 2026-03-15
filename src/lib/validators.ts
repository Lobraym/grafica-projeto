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

const productMaterialSchema = z.object({
  materialId: z.string(),
  price: z.number().min(0),
  cost: z.number().min(0),
  marginPercent: z.number().min(0).max(100),
});

const productFinishingSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  priceExtra: z.number().min(0),
});

export const materialSchema = z.object({
  name: z.string().min(1, 'Nome do material é obrigatório'),
  basePrice: z.number().min(0, 'Preço não pode ser negativo'),
  cost: z.number().min(0, 'Custo não pode ser negativo'),
  profitMarginPercent: z.number().min(0, 'Mín. 0').max(100, 'Máx. 100').default(0),
});

export const productSchema = z
  .object({
    name: z.string().min(1, 'Nome do produto é obrigatório'),
    category: z.enum(
      ['comunicacao_visual', 'impressao_digital'],
      { message: 'Selecione uma categoria' }
    ),
    description: z.string().optional().default(''),
    calculationType: z.enum(['por_area', 'por_quantidade', 'por_unidade'], {
      message: 'Selecione o tipo de cálculo',
    }),
    measurementUnit: z.enum(['unidade', 'm2', 'metro_linear', 'folha', 'milheiro'], {
      message: 'Selecione a unidade',
    }),
    productMaterials: z.array(productMaterialSchema).default([]),
    finishings: z.array(productFinishingSchema).default([]),
    minQuantity: z.number().int().min(0).nullable(),
    defaultMarginPercent: z.number().min(0, 'Mín. 0').max(100, 'Máx. 100').default(0),
    status: z.enum(['ativo', 'inativo'], { message: 'Selecione o status' }),
  })
  .superRefine((data, ctx) => {
    if (data.calculationType === 'por_quantidade') {
      if (data.minQuantity == null || data.minQuantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['minQuantity'],
          message: 'Quantidade mínima é obrigatória (mín. 1) quando o tipo é por quantidade',
        });
      }
    }
  });

export type ClientSchemaType = z.infer<typeof clientSchema>;
export type QuoteSchemaType = z.infer<typeof quoteSchema>;
export type MaterialSchemaType = z.infer<typeof materialSchema>;
export type ProductSchemaType = z.infer<typeof productSchema>;
