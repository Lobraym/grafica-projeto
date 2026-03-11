import type { QuoteStatus, ProductionStage, FileAttachment } from './common';

export interface ClientApproval {
  approved: boolean | null;
  observations: string;
  artImageUrl: string;
  designerMessage: string;
  respondedAt: string | null;
}

export interface Quote {
  readonly id: string;
  readonly trackingId: string;
  clientId: string;
  service: string;
  material: string;
  size: string;
  description: string;
  deadline: string;
  value: number;
  status: QuoteStatus;
  files: FileAttachment[];
  artFile: FileAttachment | null;
  productionNotes: string;
  printingStage: ProductionStage;
  assemblyStage: ProductionStage;
  requiresPrinting: boolean;
  requiresAssembly: boolean;
  clientApproval: ClientApproval | null;
  artChecklist: {
    colorsCorrect: boolean;
    sizeCorrect: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuoteFormData {
  clientId: string;
  service: string;
  material: string;
  size: string;
  description: string;
  deadline: string;
  value: number;
  requiresPrinting: boolean;
  requiresAssembly: boolean;
}
