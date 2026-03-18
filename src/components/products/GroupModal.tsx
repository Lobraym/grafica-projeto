'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { ProductGroupInput } from '@/types/product-group';
import { useProductGroupStore } from '@/stores/useProductGroupStore';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const CORES = [
  '#0F9B7A', // teal (padrão)
  '#3B82F6', // azul
  '#F59E0B', // âmbar
  '#EF4444', // vermelho
  '#8B5CF6', // roxo
  '#EC4899', // rosa
  '#6B7280', // cinza
] as const;

const ICON_SUGGESTIONS = ['🖨️', '🖼️', '📋', '🏷️', '⭐', '🎨', '📦', '🔖', '✂️', '📌'] as const;

interface GroupModalProps {
  readonly open: boolean;
  readonly groupId: string | null;
  readonly onClose: () => void;
}

export function GroupModal({ open, groupId, onClose }: GroupModalProps): React.ReactElement | null {
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';
  const groups = useProductGroupStore((s) => s.groups);
  const addGroup = useProductGroupStore((s) => s.addGroup);
  const updateGroup = useProductGroupStore((s) => s.updateGroup);

  const group = useMemo(() => (groupId ? groups.find((g) => g.id === groupId) : undefined), [groups, groupId]);

  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState<(typeof CORES)[number]>(CORES[0]);
  const [iconEmoji, setIconEmoji] = useState('📦');
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState<null | { title: string }>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);

    if (group) {
      setName(group.name);
      setColorHex((CORES as readonly string[]).includes(group.colorHex) ? (group.colorHex as ProductGroupInput['colorHex']) : CORES[0]);
      setIconEmoji(group.iconEmoji || '📦');
    } else {
      setName('');
      setColorHex(CORES[0]);
      setIconEmoji('📦');
    }
  }, [open, group]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const validate = (): ProductGroupInput | null => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    if (!CORES.includes(colorHex)) return null;
    const emoji = iconEmoji.trim();
    if (!emoji) return null;
    const emojiLen = Array.from(emoji).length;
    if (emojiLen > 4) return null;
    return { id: groupId ?? undefined, name: trimmedName, colorHex, iconEmoji: emoji };
  };

  const handleSave = async (): Promise<void> => {
    const payload = validate();
    if (!payload) {
      setError('Preencha nome e ícone/emoji (até 4 caracteres) corretamente, e selecione uma cor.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      if (groupId) {
        updateGroup(groupId, { name: payload.name, colorHex: payload.colorHex, iconEmoji: payload.iconEmoji });
        setShowToast({ title: 'Grupo atualizado com sucesso.' });
      } else {
        addGroup(payload);
        setShowToast({ title: 'Grupo criado com sucesso.' });
      }
      // Mantém o modal por um instante para o usuário ver o feedback visual.
      setTimeout(() => onClose(), 700);
    } finally {
      setSaving(false);
      setTimeout(() => setShowToast(null), 1800);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-modal-title"
      >
        <div className="w-full max-w-lg animate-in fade-in zoom-in-95 rounded-2xl bg-card-bg p-6 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id="group-modal-title" className="text-base font-semibold text-text-primary">
                {groupId ? 'Editar grupo' : 'Criar novo grupo'}
              </h3>
              <p className="mt-0.5 text-sm text-text-muted">
                {groupId ? 'Atualize cor e identificação do grupo.' : 'Defina uma cor e um emoji/ícone para o grupo.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className={cn(
                'rounded-lg p-1.5 text-text-muted hover:bg-card-bg-secondary hover:text-text-primary transition-colors duration-200 ease-out cursor-pointer min-h-[44px]'
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {/* Nome */}
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-text-muted mb-1.5">
                Nome do grupo <span className="text-primary">*</span>
              </label>
              <input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Placas"
                className="block w-full rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Cores */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-text-muted">
                  Cor de identificação <span className="text-primary">*</span>
                </label>
                <span className="text-xs text-text-muted">{colorHex}</span>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {CORES.map((c) => {
                  const selected = c === colorHex;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorHex(c)}
                      aria-label={`Selecionar cor ${c}`}
                      title={`Selecionar cor ${c}`}
                      className={cn(
                        'h-9 w-9 rounded-full border transition-colors cursor-pointer',
                        selected ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Emoji */}
            <div>
              <label htmlFor="group-emoji" className="block text-sm font-medium text-text-muted mb-1.5">
                Ícone / Emoji <span className="text-primary">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {ICON_SUGGESTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIconEmoji(ic)}
                    aria-label={`Usar ${ic}`}
                    title={`Usar ${ic}`}
                    className={cn(
                      'h-10 w-10 rounded-lg border border-border bg-card-bg-secondary flex items-center justify-center cursor-pointer hover:bg-card-bg-secondary transition-colors duration-200 ease-out',
                      isBlueTheme ? 'hover:border-primary/20' : 'hover:border-primary/30'
                    )}
                  >
                    <span className="text-[18px] leading-none" aria-hidden="true">
                      {ic}
                    </span>
                  </button>
                ))}
              </div>

              <input
                id="group-emoji"
                type="text"
                value={iconEmoji}
                onChange={(e) => setIconEmoji(e.target.value)}
                placeholder="Digite um emoji (ex.: ⭐)"
                className="block w-full rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              <p className="mt-1.5 text-xs text-text-muted">Dica: use 1 emoji (até 4 caracteres) ou texto curto.</p>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-border bg-card-bg px-4 py-2.5 min-h-[44px] text-sm font-medium text-text-primary hover:bg-card-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ease-out"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="cursor-pointer rounded-lg bg-[#0F9B7A] px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:bg-[#0F9B7A]/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0F9B7A]/20 transition-colors duration-200 ease-out"
            >
              {saving ? 'Salvando…' : 'Salvar grupo'}
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          {showToast.title}
        </div>
      )}
    </>
  );
}

