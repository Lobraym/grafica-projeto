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
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isAvailable
                    ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-transparent'
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
