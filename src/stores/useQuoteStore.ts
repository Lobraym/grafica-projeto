'use client';

import { create } from 'zustand';
import type { Quote, QuoteFormData, ClientApproval } from '@/types/quote';
import type { QuoteStatus, ProductionStage, FileAttachment } from '@/types/common';
import { mockQuotes } from '@/mock/quotes';
import {
  getInitialInstallationStage,
  getQuoteScheduledInstallationDate,
  shouldUnlockInstallation,
} from '@/lib/installation-scheduling';
import { addDaysToDate, compareOptionalDates, generateId, generateTrackingId } from '@/lib/utils';

const PRODUCTION_DEADLINE_DAYS = 10;

function normalizeQuoteForProductionFlow(quote: Quote): Quote {
  const shouldPreserveInstallationStage =
    quote.installationStage === 'em_andamento' || quote.installationStage === 'concluida';

  return {
    ...quote,
    artFiles: quote.artFiles ?? (quote.artFile ? [quote.artFile] : []),
    scheduledInstallationDate: quote.scheduledInstallationDate ?? getQuoteScheduledInstallationDate(quote),
    installationStage:
      quote.status === 'em_producao' && !shouldPreserveInstallationStage
        ? getInitialInstallationStage(quote)
        : quote.installationStage ?? 'nao_iniciado',
  };
}

interface QuoteStore {
  quotes: Quote[];
  addQuote: (data: QuoteFormData) => Quote;
  updateQuote: (id: string, data: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  getQuoteById: (id: string) => Quote | undefined;
  getQuoteByTrackingId: (trackingId: string) => Quote | undefined;
  getQuotesByClient: (clientId: string) => Quote[];
  getQuotesByStatus: (status: QuoteStatus) => Quote[];
  getQuotesSortedByDeadline: () => Quote[];

  // Art production actions
  startArtProduction: (id: string) => void;
  updateArtChecklist: (id: string, field: 'colorsCorrect' | 'sizeCorrect', value: boolean) => void;
  sendForClientReview: (id: string, artImageUrl: string, designerMessage: string) => void;
  clientApprove: (id: string, observations: string) => void;
  clientReject: (id: string, observations: string) => void;
  sendToFinalProduction: (id: string, artFiles: FileAttachment[], productionNotes: string) => void;

  // Final production actions
  updatePrintingStage: (id: string, stage: ProductionStage) => void;
  updateAssemblyStage: (id: string, stage: ProductionStage) => void;
  updateInstallationStage: (id: string, stage: ProductionStage) => void;
  scheduleInstallation: (id: string, scheduledDate: string) => void;
  checkAndMarkReady: (id: string) => void;

  // Ready actions
  markAsDelivered: (id: string) => void;

  // Filtered getters for production
  getArtProductionAvailable: () => Quote[];
  getArtProductionInProgress: () => Quote[];
  getArtProductionCompleted: () => Quote[];
  getPrintingByStage: (stage: ProductionStage) => Quote[];
  getAssemblyByStage: (stage: ProductionStage) => Quote[];
  getInstallationByStage: (stage: ProductionStage) => Quote[];
  getReadyQuotes: () => Quote[];
  getDeliveredQuotes: () => Quote[];
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  quotes: mockQuotes.map(normalizeQuoteForProductionFlow),

  addQuote: (data: QuoteFormData) => {
    const newQuote: Quote = {
      ...data,
      id: generateId(),
      trackingId: generateTrackingId(),
      status: 'pendente',
      artFile: null,
      artFiles: [],
      productionNotes: '',
      printingStage: 'nao_iniciado',
      assemblyStage: 'nao_iniciado',
      installationStage: 'nao_iniciado',
      scheduledInstallationDate: '',
      installationScheduledAt: '',
      clientApproval: null,
      artChecklist: { colorsCorrect: false, sizeCorrect: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ quotes: [...state.quotes, newQuote] }));
    return newQuote;
  },

  updateQuote: (id: string, data: Partial<Quote>) => {
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString() } : q
      ),
    }));
  },

  deleteQuote: (id: string) => {
    set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) }));
  },

  getQuoteById: (id: string) => get().quotes.find((q) => q.id === id),

  getQuoteByTrackingId: (trackingId: string) =>
    get().quotes.find((q) => q.trackingId === trackingId),

  getQuotesByClient: (clientId: string) =>
    get().quotes.filter((q) => q.clientId === clientId),

  getQuotesByStatus: (status: QuoteStatus) =>
    get().quotes.filter((q) => q.status === status),

  getQuotesSortedByDeadline: () =>
    [...get().quotes]
      .filter((q) => q.status !== 'entregue')
      .sort((a, b) => compareOptionalDates(a.deadline, b.deadline)),

  // Art Production
  startArtProduction: (id: string) => {
    get().updateQuote(id, { status: 'producao_arte' });
  },

  updateArtChecklist: (id: string, field: 'colorsCorrect' | 'sizeCorrect', value: boolean) => {
    const quote = get().getQuoteById(id);
    if (!quote) return;
    get().updateQuote(id, {
      artChecklist: { ...quote.artChecklist, [field]: value },
    });
  },

  sendForClientReview: (id: string, artImageUrl: string, designerMessage: string) => {
    const approval: ClientApproval = {
      approved: null,
      observations: '',
      artImageUrl,
      designerMessage,
      respondedAt: null,
    };
    get().updateQuote(id, {
      status: 'aguardando_aprovacao',
      clientApproval: approval,
    });
  },

  clientApprove: (id: string, observations: string) => {
    const quote = get().getQuoteById(id);
    if (!quote?.clientApproval) return;
    const approvedAt = new Date();
    get().updateQuote(id, {
      deadline: addDaysToDate(approvedAt, PRODUCTION_DEADLINE_DAYS),
      clientApproval: {
        ...quote.clientApproval,
        approved: true,
        observations,
        respondedAt: approvedAt.toISOString(),
      },
    });
  },

  clientReject: (id: string, observations: string) => {
    const quote = get().getQuoteById(id);
    if (!quote?.clientApproval) return;
    get().updateQuote(id, {
      status: 'producao_arte',
      clientApproval: {
        ...quote.clientApproval,
        approved: false,
        observations,
        respondedAt: new Date().toISOString(),
      },
    });
  },

  sendToFinalProduction: (id: string, artFiles: FileAttachment[], productionNotes: string) => {
    const quote = get().getQuoteById(id);
    if (!quote || artFiles.length === 0) return;
    get().updateQuote(id, {
      status: 'em_producao',
      artFile: artFiles[0],
      artFiles,
      productionNotes,
      printingStage: quote.requiresPrinting ? 'disponivel' : 'nao_iniciado',
      assemblyStage: quote.requiresAssembly ? 'disponivel' : 'nao_iniciado',
      installationStage: getInitialInstallationStage({
        ...quote,
        status: 'em_producao',
      }),
    });
  },

  // Final production
  updatePrintingStage: (id: string, stage: ProductionStage) => {
    get().updateQuote(id, { printingStage: stage });
    if (stage === 'concluida') {
      const quote = get().getQuoteById(id);
      if (quote && shouldUnlockInstallation(quote)) {
        get().updateQuote(id, { installationStage: 'disponivel' });
      }
      get().checkAndMarkReady(id);
    }
  },

  updateAssemblyStage: (id: string, stage: ProductionStage) => {
    get().updateQuote(id, { assemblyStage: stage });
    if (stage === 'concluida') {
      const quote = get().getQuoteById(id);
      if (quote && shouldUnlockInstallation(quote)) {
        get().updateQuote(id, { installationStage: 'disponivel' });
      }
      get().checkAndMarkReady(id);
    }
  },

  updateInstallationStage: (id: string, stage: ProductionStage) => {
    get().updateQuote(id, { installationStage: stage });
    if (stage === 'concluida') get().checkAndMarkReady(id);
  },

  scheduleInstallation: (id: string, scheduledDate: string) => {
    get().updateQuote(id, {
      scheduledInstallationDate: scheduledDate,
      installationDate: scheduledDate,
      installationScheduledAt: new Date().toISOString(),
    });
  },

  checkAndMarkReady: (id: string) => {
    // Re-read to get latest state after updateQuote
    const updatedQuote = get().getQuoteById(id);
    if (!updatedQuote) return;
    const updatedPrintingDone = !updatedQuote.requiresPrinting || updatedQuote.printingStage === 'concluida';
    const updatedAssemblyDone = !updatedQuote.requiresAssembly || updatedQuote.assemblyStage === 'concluida';
    const updatedInstallationDone =
      !updatedQuote.requiresInstallation || updatedQuote.installationStage === 'concluida';

    if (updatedPrintingDone && updatedAssemblyDone && updatedInstallationDone) {
      get().updateQuote(id, { status: 'pronto' });
    }
  },

  markAsDelivered: (id: string) => {
    get().updateQuote(id, { status: 'entregue' });
  },

  // Filtered getters
  getArtProductionAvailable: () =>
    get().quotes.filter(
      (q) => q.status === 'producao_arte' && !q.artChecklist.colorsCorrect && !q.artChecklist.sizeCorrect
    ),

  getArtProductionInProgress: () =>
    get().quotes.filter(
      (q) => q.status === 'producao_arte' && (q.artChecklist.colorsCorrect || q.artChecklist.sizeCorrect)
    ),

  getArtProductionCompleted: () =>
    get().quotes.filter(
      (q) =>
        q.status === 'em_producao' &&
        q.clientApproval?.approved === true
    ),

  getPrintingByStage: (stage: ProductionStage) =>
    get().quotes.filter(
      (q) => q.status === 'em_producao' && q.requiresPrinting && q.printingStage === stage
    ),

  getAssemblyByStage: (stage: ProductionStage) =>
    get().quotes.filter(
      (q) => q.status === 'em_producao' && q.requiresAssembly && q.assemblyStage === stage
    ),

  getInstallationByStage: (stage: ProductionStage) =>
    get().quotes.filter(
      (q) => q.status === 'em_producao' && q.requiresInstallation && q.installationStage === stage
    ),

  getReadyQuotes: () => get().quotes.filter((q) => q.status === 'pronto'),

  getDeliveredQuotes: () => get().quotes.filter((q) => q.status === 'entregue'),
}));
