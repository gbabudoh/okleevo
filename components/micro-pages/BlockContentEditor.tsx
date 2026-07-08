"use client";

import { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import type { MicroPageBlockContent } from '@/lib/micro-page-content';

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition";
const labelCls = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2";

async function resolveImageUrl(key: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/storage/resolve?key=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

async function uploadImage(file: File): Promise<{ objectKey: string; url: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'micro-pages');
    const res = await fetch('/api/storage/upload', { method: 'POST', body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return { objectKey: data.objectKey, url: data.url };
  } catch {
    return null;
  }
}

function SingleImageField({ imageKey, onChange }: { imageKey?: string; onChange: (key: string | undefined) => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!imageKey) return;
    let cancelled = false;
    resolveImageUrl(imageKey).then(url => { if (!cancelled) setPreviewUrl(url); });
    return () => { cancelled = true; };
  }, [imageKey]);

  const handleFile = async (file: File) => {
    setUploading(true);
    const result = await uploadImage(file);
    setUploading(false);
    if (result) {
      setPreviewUrl(result.url);
      onChange(result.objectKey);
    }
  };

  return (
    <div>
      <label className={labelCls}>Image</label>
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
          <img src={previewUrl} alt="" className="w-full h-32 object-contain" />
          <button
            type="button"
            onClick={() => { setPreviewUrl(null); onChange(undefined); }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-900/70 text-white hover:bg-gray-900 transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition cursor-pointer">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
          <span className="text-[10px] font-black uppercase tracking-wider">{uploading ? 'Uploading…' : 'Upload image'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </label>
      )}
    </div>
  );
}

function GalleryImagesField({ imageKeys, onChange }: { imageKeys?: string[]; onChange: (keys: string[]) => void }) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const keys = imageKeys || [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const missing = keys.filter(k => !previews[k]);
      if (missing.length === 0) return;
      const resolved = await Promise.all(missing.map(async k => [k, await resolveImageUrl(k)] as const));
      if (!cancelled) {
        setPreviews(prev => {
          const next = { ...prev };
          for (const [k, url] of resolved) if (url) next[k] = url;
          return next;
        });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join(',')]);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const uploaded = await Promise.all(Array.from(files).map(uploadImage));
    setUploading(false);
    const newKeys = uploaded.filter((u): u is { objectKey: string; url: string } => !!u);
    if (newKeys.length > 0) {
      setPreviews(prev => {
        const next = { ...prev };
        for (const u of newKeys) next[u.objectKey] = u.url;
        return next;
      });
      onChange([...keys, ...newKeys.map(u => u.objectKey)]);
    }
  };

  return (
    <div>
      <label className={labelCls}>Gallery Images</label>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {keys.map(k => (
          <div key={k} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square group">
            {previews[k] ? (
              <img src={previews[k]} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50"><Loader2 className="h-4 w-4 text-gray-300 animate-spin" /></div>
            )}
            <button
              type="button"
              onClick={() => onChange(keys.filter(x => x !== k))}
              className="absolute top-1 right-1 p-1 rounded-lg bg-gray-900/70 text-white hover:bg-gray-900 transition cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 aspect-square text-gray-400 hover:border-blue-400 hover:text-blue-500 transition cursor-pointer">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
          />
        </label>
      </div>
    </div>
  );
}

export default function BlockContentEditor({
  blockName,
  content,
  onChange,
}: {
  blockName: string;
  content: MicroPageBlockContent;
  onChange: (next: MicroPageBlockContent) => void;
}) {
  const set = useCallback(
    <K extends keyof MicroPageBlockContent>(field: K, value: MicroPageBlockContent[K]) => {
      onChange({ ...content, [field]: value });
    },
    [content, onChange]
  );

  const isGallery = blockName === 'Gallery';

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Heading</label>
        <input
          type="text"
          value={content.heading || ''}
          onChange={e => set('heading', e.target.value)}
          placeholder={`${blockName} heading…`}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Body Text</label>
        <textarea
          value={content.body || ''}
          onChange={e => set('body', e.target.value)}
          rows={2}
          placeholder="Supporting text…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {isGallery ? (
        <GalleryImagesField imageKeys={content.imageKeys} onChange={keys => set('imageKeys', keys)} />
      ) : (
        <SingleImageField imageKey={content.imageKey} onChange={key => set('imageKey', key)} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Button Text</label>
          <input
            type="text"
            value={content.buttonText || ''}
            onChange={e => set('buttonText', e.target.value)}
            placeholder="e.g. Get Started"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Button Link</label>
          <input
            type="text"
            value={content.buttonLink || ''}
            onChange={e => set('buttonLink', e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}
