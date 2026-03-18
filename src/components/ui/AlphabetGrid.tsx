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
            className={`flex min-w-[40px] h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 border
              ${
                isActive
                  ? 'bg-card-bg text-primary border-primary ring-2 ring-primary/30'
                  : isAvailable
                    ? 'cursor-pointer bg-card-bg text-text-primary border-border hover:bg-card-bg-secondary hover:border-primary/50'
                    : 'bg-card-bg-secondary text-text-muted border-border cursor-not-allowed opacity-70'
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
