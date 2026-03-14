'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  readonly onFileSelect: (file: { name: string; url: string; type?: string }) => void;
  readonly accept?: string;
  readonly label?: string;
  readonly multiple?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = '*',
  label = 'Arraste um arquivo ou clique para selecionar',
  multiple = false,
}: FileUploadProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const processFile = useCallback(
    (file: globalThis.File) => {
      const mockUrl = URL.createObjectURL(file);
      setSelectedFileName(file.name);
      onFileSelect({ name: file.name, url: mockUrl, type: file.type });
    },
    [onFileSelect],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      setSelectedCount(files.length);
      files.forEach(processFile);
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files ?? []);
      if (files.length === 0) return;
      setSelectedCount(files.length);
      files.forEach(processFile);
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
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
      />

      {selectedFileName ? (
        <>
          <File className="h-8 w-8 text-emerald-500" />
          <span className="text-sm font-medium text-slate-700">
            {selectedCount > 1 ? `${selectedCount} arquivos selecionados` : selectedFileName}
          </span>
          <span className="text-xs text-slate-500">
            {multiple ? 'Clique para adicionar mais arquivos' : 'Clique para trocar o arquivo'}
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
