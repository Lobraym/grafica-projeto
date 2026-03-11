'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  readonly onFileSelect: (file: { name: string; url: string }) => void;
  readonly accept?: string;
  readonly label?: string;
}

export function FileUpload({
  onFileSelect,
  accept = '*',
  label = 'Arraste um arquivo ou clique para selecionar',
}: FileUploadProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const processFile = useCallback(
    (file: globalThis.File) => {
      const mockUrl = URL.createObjectURL(file);
      setSelectedFileName(file.name);
      onFileSelect({ name: file.name, url: mockUrl });
    },
    [onFileSelect],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors duration-200 ease-out
        ${
          isDragging
            ? 'border-cyan-400 bg-cyan-50/50'
            : selectedFileName
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
      />

      {selectedFileName ? (
        <>
          <File className="h-8 w-8 text-emerald-500" />
          <span className="text-sm font-medium text-slate-700">
            {selectedFileName}
          </span>
          <span className="text-xs text-slate-500">
            Clique para trocar o arquivo
          </span>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-slate-400" />
          <span className="text-sm text-slate-600">Arraste ou clique para enviar</span>
          <span className="text-xs text-slate-400">
            Formatos aceitos: PDF, PNG, JPG
          </span>
        </>
      )}
    </div>
  );
}
