'use client';

import { useMemo, useState } from 'react';

interface ProductPhotoUploadProps {
  readonly photoUrl: string | null | undefined;
  readonly initials: string;
  readonly fallbackColorHex: string;
  readonly onPhotoUrlChange: (photoUrl: string | null) => void;
}

async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/product-photos/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let message = 'Falha ao enviar foto';
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { photoUrl?: string };
  if (!data.photoUrl) throw new Error('Resposta inválida do servidor');
  return data.photoUrl;
}

export function ProductPhotoUpload({
  photoUrl,
  initials,
  fallbackColorHex,
  onPhotoUrlChange,
}: ProductPhotoUploadProps): React.ReactElement {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewStyle = useMemo(() => {
    return photoUrl ? undefined : { backgroundColor: fallbackColorHex } as const;
  }, [photoUrl, fallbackColorHex]);

  const handleFileChange = async (file: File | null) => {
    setError(null);
    if (!file) return;

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.type)) {
      setError('Tipo de arquivo inválido (use JPG, PNG ou WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Arquivo muito grande (máx. 2MB).');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      onPhotoUrlChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-muted mb-1.5">Foto do produto</label>
      <div className="flex items-center gap-4">
        <div
          className="h-20 w-20 overflow-hidden rounded-lg bg-card-bg-secondary border border-border flex items-center justify-center shrink-0"
          style={previewStyle}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Foto do produto" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-white">{initials}</span>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
            disabled={uploading}
            aria-label="Enviar foto do produto"
            className="w-full cursor-pointer text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white disabled:opacity-50"
          />
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          <p className="mt-1 text-xs text-text-muted">JPG/PNG/WEBP, até 2MB.</p>
        </div>
      </div>
    </div>
  );
}

