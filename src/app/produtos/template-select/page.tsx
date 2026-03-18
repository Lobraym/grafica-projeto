'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PRODUCT_TEMPLATES, buildTemplateInitialData, type ProductTemplateCard } from '@/lib/product-templates';
import { cn } from '@/lib/utils';

function buildNextUrl(params: { readonly groupId: string | null; readonly templateId?: string }): string {
  const q: string[] = [];
  if (params.groupId) q.push(`groupId=${encodeURIComponent(params.groupId)}`);
  if (params.templateId) q.push(`templateId=${encodeURIComponent(params.templateId)}`);
  const query = q.length ? `?${q.join('&')}` : '';
  return `/produtos/novo${query}`;
}

export default function TemplateSelectPage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [pending, setPending] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const templates: readonly ProductTemplateCard[] = useMemo(() => PRODUCT_TEMPLATES, []);

  useEffect(() => {
    // Bloqueia scroll da tela enquanto o overlay estiver aberto (modal-like).
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const navigateAfterLoading = (nextUrl: string, templateId: string | null): void => {
    if (pending) return;
    setPending(true);
    setActiveTemplateId(templateId);

    window.setTimeout(() => {
      router.push(nextUrl);
    }, 300);
  };

  const handleBack = (): void => {
    if (pending) return;
    router.push('/produtos');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1a]/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Seleção de template de produto"
    >
      <div className="w-full max-w-3xl mx-auto rounded-2xl border border-gray-700/50 bg-[#111827] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800/60 transition-colors cursor-pointer',
                pending && 'opacity-60 cursor-not-allowed'
              )}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4 text-teal-400" aria-hidden="true" />
              <span>Voltar</span>
            </button>

            <div className="flex flex-col items-end">
              <h1 className="text-xl font-semibold text-white">Novo Produto</h1>
              <p className="mt-1 text-sm text-gray-400">Escolha um template para começar</p>
            </div>
          </div>

          {pending && (
            <div className="mt-4 rounded-xl border border-gray-700/50 bg-gray-800/40 px-4 py-3 text-sm text-gray-300">
              {activeTemplateId ? 'Carregando template…' : 'Carregando…'}
            </div>
          )}

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Começar do zero
            </div>

            <button
              type="button"
              onClick={() => navigateAfterLoading(buildNextUrl({ groupId }), null)}
              role="button"
              aria-label="Começar do zero"
              disabled={pending}
              className={cn(
                'group w-full flex items-center justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800/50 p-4 transition-all duration-200',
                'hover:border-teal-500/50 hover:bg-gray-800 hover:translate-y-0',
                pending && 'opacity-60 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-teal-400 text-[32px] leading-none" aria-hidden="true">
                  ⬚
                </span>
                <div className="flex flex-col items-start">
                  <p className="text-base font-medium text-white">Começar do zero</p>
                  <p className="text-sm text-gray-400">Monte todos os blocos de custo do jeito que você quiser</p>
                </div>
              </div>

              <div className={cn('text-teal-400 text-2xl font-semibold transition-opacity', pending ? 'opacity-60' : 'opacity-0 group-hover:opacity-100')}>
                →
              </div>
            </button>
          </div>

          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Templates prontos
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {templates.map((t) => {
                const badgeText = t.cobrancaBadge === 'm2' ? 'Por m²' : 'Por quantidade';
                const badgeClass =
                  t.cobrancaBadge === 'm2'
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-blue-500/20 text-blue-400';

                // Validação defensiva: garante que o templateId existe (evita navegação quebrada).
                const initialData = buildTemplateInitialData(t.id);
                const disabled = pending || !initialData;

                return (
                  <div
                    key={t.id}
                    role="button"
                    aria-label={`Selecionar template: ${t.nome}`}
                    tabIndex={0}
                    onClick={() => {
                      if (disabled) return;
                      const nextUrl = buildNextUrl({ groupId, templateId: t.id });
                      navigateAfterLoading(nextUrl, t.id);
                    }}
                    onKeyDown={(e) => {
                      if (disabled) return;
                      if (e.key !== 'Enter' && e.key !== ' ') return;
                      const nextUrl = buildNextUrl({ groupId, templateId: t.id });
                      navigateAfterLoading(nextUrl, t.id);
                    }}
                    className={cn(
                      'cursor-pointer rounded-xl bg-gray-800/50 border border-gray-700 p-4 transition-all duration-200',
                      'hover:border-teal-500/50 hover:bg-gray-800 hover:scale-[1.02]',
                      disabled && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-teal-400 text-[32px] leading-none shrink-0" aria-hidden="true">
                        {t.icone}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{t.nome}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.descricao}</p>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full mt-2 inline-block', badgeClass)}>{badgeText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Selecionar um template preenche o cadastro automaticamente. Você pode ajustar tudo antes de salvar.
          </div>
        </div>
      </div>
    </div>
  );
}

