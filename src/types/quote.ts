import type { QuoteStatus, ProductionStage, FileAttachment } from './common';

export type QuoteMeasurementUnit = 'cm' | 'mm' | 'm';

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
  quantity?: number;
  width?: string;
  height?: string;
  measurementUnit?: QuoteMeasurementUnit;
  size: string;
  description: string;
  receptionNotes?: string;
  deadline: string;
  value: number;
  status: QuoteStatus;
  files: FileAttachment[];
  artFile: FileAttachment | null;
  artFiles?: FileAttachment[];
  productionNotes: string;
  printingStage: ProductionStage;
  assemblyStage: ProductionStage;
  installationStage?: ProductionStage;
  requiresPrinting: boolean;
  requiresAssembly: boolean;
  requiresInstallation?: boolean;
  installationStreet?: string;
  installationNeighborhood?: string;
  installationNumber?: string;
  installationCity?: string;
  installationDate?: string;
  scheduledInstallationDate?: string;
  installationScheduledAt?: string;
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
  quantity: number;
  width: string;
  height: string;
  measurementUnit: QuoteMeasurementUnit;
  size: string;
  description: string;
  receptionNotes: string;
  deadline: string;
  value: number;
  files: FileAttachment[];
  requiresPrinting: boolean;
  requiresAssembly: boolean;
  requiresInstallation: boolean;
  installationStreet: string;
  installationNeighborhood: string;
  installationNumber: string;
  installationCity: string;
  installationDate: string;
}
