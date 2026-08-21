"use client";

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  Image as ImageIcon, X, Loader2, Upload, Plus, Trash2,
  Calendar, Clock, DollarSign, HelpCircle, MessageSquare, Check,
  Link as LinkIcon, Sparkles, AlertCircle
} from 'lucide-react';
import type {
  MicroPageBlockContent,
  ScheduleItem,
  PricingTier,
  FaqItem,
  TestimonialItem,
} from '@/lib/micro-page-content';

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition shadow-2xs";
const labelCls = "block text-xs font-semibold text-slate-700 mb-1.5";
const helperCls = "text-[11px] text-slate-400 mt-1";

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
    if (!imageKey) {
      setPreviewUrl(null);
      return;
    }
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
      <label className={labelCls}>Featured Media / Cover Image</label>
      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-2xs">
          <div className="w-full h-40 bg-slate-100 flex items-center justify-center p-2">
            <img src={previewUrl} alt="Section media preview" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 transition cursor-pointer shadow-md">
              Change Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
              />
            </label>
            <button
              type="button"
              onClick={() => { setPreviewUrl(null); onChange(undefined); }}
              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-md"
              title="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500/50 bg-slate-50/50 hover:bg-blue-50/30 py-6 text-slate-500 transition cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition shadow-2xs">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <Upload className="h-5 w-5" />}
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition">
              {uploading ? 'Uploading asset…' : 'Click to upload or drag image'}
            </span>
            <p className={helperCls}>SVG, PNG, JPG or WebP (max 5MB)</p>
          </div>
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
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls}>Gallery Showcase Images</label>
        <span className="text-[11px] text-slate-400 font-medium">{keys.length} items</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-2">
        {keys.map(k => (
          <div key={k} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square group shadow-2xs">
            {previews[k] ? (
              <img src={previews[k]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50"><Loader2 className="h-4 w-4 text-slate-400 animate-spin" /></div>
            )}
            <button
              type="button"
              onClick={() => onChange(keys.filter(x => x !== k))}
              className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 text-white hover:bg-red-600 transition cursor-pointer shadow-sm"
              title="Remove item"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-500/50 bg-slate-50/50 hover:bg-blue-50/30 aspect-square text-slate-400 hover:text-blue-600 transition cursor-pointer group">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <Upload className="h-4 w-4" />}
          <span className="text-[10px] font-bold">{uploading ? 'Adding…' : '+ Add'}</span>
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

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function RepeatableListField<T>({
  label,
  itemNoun,
  items,
  emptyItem,
  onChange,
  renderRow,
}: {
  label: string;
  itemNoun: string;
  items: T[];
  emptyItem: T;
  onChange: (items: T[]) => void;
  renderRow: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-700">{label}</label>
          <span className="text-[11px] text-slate-400 ml-2">({items.length} {items.length === 1 ? itemNoun : `${itemNoun}s`})</span>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem])}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add {itemNoun}
        </button>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 group hover:border-slate-300 transition">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{itemNoun} #{i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title={`Delete ${itemNoun}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {renderRow(item, i, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))))}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
            No {itemNoun}s configured yet. Click &quot;Add {itemNoun}&quot; above to create one.
          </div>
        )}
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
    <div className="space-y-4 pt-1">
      {/* Primary Section Content */}
      <div className="grid grid-cols-1 gap-3.5">
        <div>
          <label className={labelCls}>Section Heading</label>
          <input
            type="text"
            value={content.heading || ''}
            onChange={e => set('heading', e.target.value)}
            placeholder={`Enter ${blockName.toLowerCase()} headline…`}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Supporting Body Text</label>
          <textarea
            value={content.body || ''}
            onChange={e => set('body', e.target.value)}
            rows={2}
            placeholder="Provide descriptive supporting copy for your visitors…"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Block Specific Controls */}
      {blockName === 'Countdown' && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-1.5">
          <label className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Countdown Target Date &amp; Time
          </label>
          <input
            type="datetime-local"
            value={content.targetDate ? toLocalInputValue(content.targetDate) : ''}
            onChange={e => set('targetDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            className={inputCls}
          />
          <p className={helperCls}>Visitors will see a real-time ticking countdown to this timestamp.</p>
        </div>
      )}

      {blockName === 'Schedule' && (
        <RepeatableListField<ScheduleItem>
          label="Agenda / Schedule Timeline"
          itemNoun="Session"
          items={content.scheduleItems || []}
          emptyItem={{ time: '', title: '' }}
          onChange={items => set('scheduleItems', items)}
          renderRow={(item, _idx, update) => (
            <>
              <div className="grid grid-cols-3 gap-2">
                <input className={inputCls} placeholder="Time (e.g. 10:00 AM)" value={item.time} onChange={e => update({ time: e.target.value })} />
                <input className={`${inputCls} col-span-2`} placeholder="Session Title" value={item.title} onChange={e => update({ title: e.target.value })} />
              </div>
              <input
                className={inputCls}
                placeholder="Speaker, location, or session details (optional)"
                value={item.description || ''}
                onChange={e => update({ description: e.target.value })}
              />
            </>
          )}
        />
      )}

      {blockName === 'Pricing Cards' && (
        <RepeatableListField<PricingTier>
          label="Pricing Tiers &amp; Packages"
          itemNoun="Tier"
          items={content.pricingTiers || []}
          emptyItem={{ name: '', price: '', features: [] }}
          onChange={items => set('pricingTiers', items)}
          renderRow={(item, _idx, update) => (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Tier Name</label>
                  <input className={inputCls} placeholder="e.g. Starter / Pro" value={item.name} onChange={e => update({ name: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Price</label>
                  <input className={inputCls} placeholder="e.g. $49 / $29" value={item.price} onChange={e => update({ price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Billing Frequency (optional)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. per month, billed annually"
                  value={item.period || ''}
                  onChange={e => update({ period: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Features List (1 per line)</label>
                <textarea
                  className={`${inputCls} resize-none font-mono text-[11px]`}
                  rows={3}
                  placeholder="Unlimited Projects&#10;24/7 Priority Support&#10;Custom Domain"
                  value={item.features.join('\n')}
                  onChange={e => update({ features: e.target.value.split('\n') })}
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!item.highlighted}
                  onChange={e => update({ highlighted: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Mark as &quot;Most Popular&quot; / Highlighted Tier
              </label>
            </>
          )}
        />
      )}

      {blockName === 'FAQ' && (
        <RepeatableListField<FaqItem>
          label="Frequently Asked Questions"
          itemNoun="Question"
          items={content.faqItems || []}
          emptyItem={{ question: '', answer: '' }}
          onChange={items => set('faqItems', items)}
          renderRow={(item, _idx, update) => (
            <>
              <input className={inputCls} placeholder="Question: e.g. What is the return policy?" value={item.question} onChange={e => update({ question: e.target.value })} />
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                placeholder="Answer explanation…"
                value={item.answer}
                onChange={e => update({ answer: e.target.value })}
              />
            </>
          )}
        />
      )}

      {blockName === 'Testimonials' && (
        <RepeatableListField<TestimonialItem>
          label="Customer Testimonials &amp; Social Proof"
          itemNoun="Quote"
          items={content.testimonialItems || []}
          emptyItem={{ quote: '', author: '' }}
          onChange={items => set('testimonialItems', items)}
          renderRow={(item, _idx, update) => (
            <>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                placeholder="&quot;This product completely transformed our workflow…&quot;"
                value={item.quote}
                onChange={e => update({ quote: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Customer Name" value={item.author} onChange={e => update({ author: e.target.value })} />
                <input className={inputCls} placeholder="Role / Company (e.g. CEO at Acme)" value={item.role || ''} onChange={e => update({ role: e.target.value })} />
              </div>
            </>
          )}
        />
      )}

      {/* Media & Image Upload */}
      {isGallery ? (
        <GalleryImagesField imageKeys={content.imageKeys} onChange={keys => set('imageKeys', keys)} />
      ) : (
        <SingleImageField imageKey={content.imageKey} onChange={key => set('imageKey', key)} />
      )}

      {/* Call to Action Button Row */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Call-to-Action (CTA) Button</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Button Label</label>
            <input
              type="text"
              value={content.buttonText || ''}
              onChange={e => set('buttonText', e.target.value)}
              placeholder="e.g. Claim Free Quote"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Button Destination URL / Anchor</label>
            <input
              type="text"
              value={content.buttonLink || ''}
              onChange={e => set('buttonLink', e.target.value)}
              placeholder="e.g. https://... or #contact"
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
