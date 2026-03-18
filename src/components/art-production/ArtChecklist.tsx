'use client';

import { CheckCircle2, Circle, Palette, Ruler } from 'lucide-react';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface ArtChecklistProps {
  readonly quoteId: string;
  readonly checklist: {
    readonly colorsCorrect: boolean;
    readonly sizeCorrect: boolean;
  };
}

interface CheckItemProps {
  readonly checked: boolean;
  readonly label: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly onChange: (checked: boolean) => void;
  readonly isBlueTheme: boolean;
}

function CheckItem({ checked, label, description, icon, onChange, isBlueTheme }: CheckItemProps): React.ReactElement {
  return (
    <label
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all duration-200 ease-out',
        checked
          ? isBlueTheme
            ? 'border-primary/60 bg-transparent'
            : 'border-emerald-200 bg-emerald-50/50'
          : isBlueTheme
            ? 'border-border bg-card-bg hover:border-primary/20 hover:bg-card-bg-secondary'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />

      <div className="mt-0.5 shrink-0">
        {checked ? (
          <CheckCircle2 className={cn('h-5 w-5', isBlueTheme ? 'text-text-muted' : 'text-emerald-600')} />
        ) : (
          <Circle className={cn('h-5 w-5', isBlueTheme ? 'text-text-muted opacity-70' : 'text-gray-300')} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isBlueTheme ? 'text-text-muted' : checked ? 'text-emerald-600' : 'text-slate-700'
            )}
          >
            {label}
          </span>
          <span className={cn('shrink-0', isBlueTheme ? 'text-text-muted' : checked ? 'text-emerald-500' : 'text-gray-400')}>
            {icon}
          </span>
        </div>
        <p className={cn('text-xs mt-0.5', isBlueTheme ? 'text-text-muted' : checked ? 'text-emerald-600' : 'text-gray-500')}>
          {description}
        </p>
      </div>
    </label>
  );
}

export function ArtChecklist({ quoteId, checklist }: ArtChecklistProps): React.ReactElement {
  const updateArtChecklist = useQuoteStore((state) => state.updateArtChecklist);
  const { theme } = useTheme();
  const isBlueTheme = theme === 'blue';

  const handleChange = (field: 'colorsCorrect' | 'sizeCorrect', value: boolean): void => {
    updateArtChecklist(quoteId, field, value);
  };

  const allChecked = checklist.colorsCorrect && checklist.sizeCorrect;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className={cn('text-sm font-semibold', isBlueTheme ? 'text-text-primary' : 'text-gray-900')}>
          Checklist da Arte
        </h4>
        {allChecked && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isBlueTheme ? 'bg-accent/10 text-accent' : 'bg-emerald-100 text-emerald-700'
            )}
          >
            <CheckCircle2 className="h-3 w-3" />
            Completo
          </span>
        )}
      </div>

      <div className="space-y-2">
        <CheckItem
          checked={checklist.colorsCorrect}
          label="Confirmar se cores estão corretas"
          description="Verificar se as cores do arquivo conferem com o solicitado pelo cliente"
          icon={<Palette className="h-3.5 w-3.5" />}
          onChange={(val) => handleChange('colorsCorrect', val)}
          isBlueTheme={isBlueTheme}
        />
        <CheckItem
          checked={checklist.sizeCorrect}
          label="Confirmar se tamanho está correto"
          description="Verificar se as dimensões do arquivo correspondem ao tamanho do pedido"
          icon={<Ruler className="h-3.5 w-3.5" />}
          onChange={(val) => handleChange('sizeCorrect', val)}
          isBlueTheme={isBlueTheme}
        />
      </div>
    </div>
  );
}
