'use client';

interface AlphabetGridProps {
  readonly letters: readonly string[];
  readonly activeLetter: string | null;
  readonly onLetterClick: (letter: string) => void;
  readonly availableLetters: readonly string[];
}

export function AlphabetGrid({
  letters,
  activeLetter,
  onLetterClick,
  availableLetters,
}: AlphabetGridProps): React.ReactElement {
  const availableSet = new Set(availableLetters);

  return (
    <div className="flex flex-wrap gap-1.5">
      {letters.map((letter) => {
        const isAvailable = availableSet.has(letter);
        const isActive = activeLetter === letter;

        return (
          <button
            key={letter}
            type="button"
            disabled={!isAvailable}
            onClick={() => onLetterClick(letter)}
            className={`flex min-w-[40px] h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 ease-out
              ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isAvailable
                    ? 'cursor-pointer bg-white text-slate-700 border border-slate-200 hover:border-cyan-300 hover:text-cyan-600'
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent'
              }`}
            aria-label={`Filtrar pela letra ${letter}`}
            aria-pressed={isActive}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
