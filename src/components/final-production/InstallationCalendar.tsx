'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, isValidDateString } from '@/lib/utils';
import { getInstallationDeadlineStatus } from '@/lib/installation-scheduling';

interface InstallationCalendarProps {
  readonly selectedDate: string;
  readonly deadline: string;
  readonly onSelectDate: (date: string) => void;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] as const;

export function InstallationCalendar({
  selectedDate,
  deadline,
  onSelectDate,
}: InstallationCalendarProps): React.ReactElement {
  const initialMonth = selectedDate || deadline || getDateKey(new Date());
  const [displayedMonth, setDisplayedMonth] = useState(() => getMonthStart(initialMonth));

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(displayedMonth);
    const firstCalendarDay = new Date(firstDayOfMonth);
    firstCalendarDay.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(firstCalendarDay);
      day.setDate(firstCalendarDay.getDate() + index);
      return day;
    });
  }, [displayedMonth]);

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(displayedMonth);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">
            Calendario de Agendamento
          </p>
          <h3 className="mt-1 text-sm font-semibold capitalize text-slate-900">{monthLabel}</h3>
        </div>

        <div className="flex items-center gap-2">
          <MonthButton
            ariaLabel="Mes anterior"
            onClick={() => setDisplayedMonth(getShiftedMonth(displayedMonth, -1))}
            icon={<ChevronLeft className="h-4 w-4" />}
          />
          <MonthButton
            ariaLabel="Proximo mes"
            onClick={() => setDisplayedMonth(getShiftedMonth(displayedMonth, 1))}
            icon={<ChevronRight className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_DAYS.map((day) => (
          <span
            key={day}
            className="pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            {day}
          </span>
        ))}

        {calendarDays.map((day) => {
          const dateKey = getDateKey(day);
          const isCurrentMonth = day.getMonth() === displayedMonth.getMonth();
          const isSelected = selectedDate === dateKey;
          const isDeadline = deadline === dateKey;
          const isToday = getDateKey(new Date()) === dateKey;
          const deadlineStatus = getInstallationDeadlineStatus(deadline, dateKey);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={cn(
                'relative aspect-square rounded-xl border text-sm font-medium transition-all duration-200 ease-out',
                isCurrentMonth ? 'text-slate-900' : 'text-slate-300',
                getDayClassName(deadlineStatus),
                isSelected && 'border-cyan-600 bg-cyan-600 text-white shadow-sm',
                isDeadline && !isSelected && 'ring-2 ring-cyan-200',
                isToday && !isSelected && 'border-slate-400',
              )}
            >
              <span>{day.getDate()}</span>
              {isDeadline && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <LegendPill className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" label="Dentro do prazo" />
        <LegendPill className="bg-rose-50 text-rose-700 ring-1 ring-rose-100" label="Apos o prazo" />
        <LegendPill className="bg-cyan-600 text-white" label="Data selecionada" />
        <LegendPill className="bg-white text-slate-700 ring-2 ring-cyan-200" label="Data limite" />
      </div>
    </div>
  );
}

function getMonthStart(dateStr: string): Date {
  const date = isValidDateString(dateStr) ? new Date(dateStr) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getShiftedMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayClassName(status: 'within' | 'after' | 'unknown'): string {
  if (status === 'within') {
    return 'border-emerald-100 bg-emerald-50 hover:border-emerald-200 hover:bg-emerald-100/70';
  }

  if (status === 'after') {
    return 'border-rose-100 bg-rose-50 hover:border-rose-200 hover:bg-rose-100/70';
  }

  return 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/80';
}

function MonthButton({
  onClick,
  icon,
  ariaLabel,
}: {
  readonly onClick: () => void;
  readonly icon: React.ReactNode;
  readonly ariaLabel: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors duration-200 ease-out hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
    </button>
  );
}

function LegendPill({
  label,
  className,
}: {
  readonly label: string;
  readonly className: string;
}): React.ReactElement {
  return <span className={cn('rounded-full px-2.5 py-1 font-medium', className)}>{label}</span>;
}
