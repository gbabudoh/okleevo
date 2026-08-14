import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getMicroPageTemplate } from '@/lib/micro-page-templates';
import { getPresignedUrl } from '@/lib/services/minio';
import type { MicroPageBlockContent, MicroPageContent } from '@/lib/micro-page-content';
import { PublicFormBlock } from '@/components/micro-pages/PublicFormBlock';
import { CountdownTimer } from '@/components/micro-pages/CountdownTimer';
import { ViewTracker } from '@/components/micro-pages/ViewTracker';

async function getPublishedPage(slug: string) {
  try {
    const page = await prisma.microPage.findUnique({ where: { slug } });
    if (page && page.status === 'PUBLISHED') return page;
  } catch {
    // Database query error
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return { title: 'Page not found' };

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
  };
}

async function resolveImage(key?: string): Promise<string | null> {
  if (!key) return null;
  try {
    return await getPresignedUrl(key);
  } catch {
    return null;
  }
}

async function Block({
  name,
  pageTitle,
  slug,
  description,
  content,
}: {
  name: string;
  pageTitle: string;
  slug: string;
  description?: string | null;
  content: MicroPageBlockContent;
}) {
  const heading = content.heading || (name === 'Hero' ? pageTitle : undefined);
  const body = content.body || (name === 'Hero' ? description : undefined);
  const imageUrl = await resolveImage(content.imageKey);

  if (name === 'Hero') {
    return (
      <section className="py-20 px-6 text-center bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="mx-auto mb-6 max-h-64 max-w-full rounded-xl object-contain" />
          )}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">{heading}</h1>
          {body && <p className="text-slate-300 max-w-xl mx-auto text-base leading-relaxed">{body}</p>}
          {content.buttonText && (
            <a
              href={content.buttonLink || '#form'}
              className="mt-6 inline-block px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              {content.buttonText}
            </a>
          )}
        </div>
      </section>
    );
  }

  if (name === 'Form' || name === 'Registration' || name === 'Email Form') {
    return (
      <PublicFormBlock
        heading={heading}
        body={body}
        pageTitle={pageTitle}
        slug={slug}
      />
    );
  }

  if (name === 'CTA') {
    return (
      <section className="py-16 px-6 text-center bg-slate-50 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900">{heading || 'Ready to get started?'}</h2>
        {body && <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">{body}</p>}
        <a
          href={content.buttonLink || '#form'}
          className="mt-6 inline-block px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-all"
        >
          {content.buttonText || 'Get In Touch'}
        </a>
      </section>
    );
  }

  if (name === 'Footer') {
    return (
      <footer className="py-8 px-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        {body || 'Powered by Okleevo • Encrypted Enterprise Form Engine'}
      </footer>
    );
  }

  if (name === 'Gallery') {
    const keys = content.imageKeys || [];
    const urls = (await Promise.all(keys.map(resolveImage))).filter((u): u is string => !!u);
    return (
      <section className="py-14 px-6 border-t border-slate-100">
        {heading && <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">{heading}</h2>}
        {urls.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {urls.map((url, i) => (
              <div key={i} className="w-full aspect-square rounded-lg bg-slate-50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center">No images added to this gallery yet.</p>
        )}
      </section>
    );
  }

  if (name === 'Countdown') {
    return (
      <section className="py-16 px-6 text-center border-t border-slate-100">
        {heading && <h2 className="text-2xl font-bold text-slate-900">{heading}</h2>}
        {body && <p className="mt-2 mb-6 text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">{body}</p>}
        {content.targetDate && (
          <div className="mt-6">
            <CountdownTimer targetDate={content.targetDate} />
          </div>
        )}
      </section>
    );
  }

  if (name === 'Schedule') {
    const items = content.scheduleItems || [];
    return (
      <section className="py-14 px-6 border-t border-slate-100">
        {heading && <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">{heading}</h2>}
        {items.length > 0 ? (
          <div className="max-w-xl mx-auto space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <span className="shrink-0 text-xs font-bold text-blue-600 w-20">{item.time}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {item.description && <p className="mt-1 text-xs text-slate-500">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center">Schedule to be announced.</p>
        )}
      </section>
    );
  }

  if (name === 'Pricing Cards') {
    const tiers = content.pricingTiers || [];
    return (
      <section className="py-14 px-6 border-t border-slate-100">
        {heading && <h2 className="text-xl font-semibold text-slate-900 text-center mb-8">{heading}</h2>}
        {tiers.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto items-start">
              {tiers.map((tier, i) => {
                const features = (tier.features || []).map((f) => f.trim()).filter(Boolean);
                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-6 border ${
                      tier.highlighted
                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900">{tier.name}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                      {tier.price}
                      {tier.period && <span className="text-sm font-medium text-slate-400">/{tier.period}</span>}
                    </p>
                    {features.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {features.map((feature, j) => (
                          <li key={j} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-blue-600 font-bold">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            {content.buttonText && (
              <div className="text-center mt-8">
                <a
                  href={content.buttonLink || '#form'}
                  className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-all"
                >
                  {content.buttonText}
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-400 text-center">Pricing to be announced.</p>
        )}
      </section>
    );
  }

  if (name === 'FAQ') {
    const items = content.faqItems || [];
    return (
      <section className="py-14 px-6 border-t border-slate-100">
        {heading && <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">{heading}</h2>}
        {items.length > 0 ? (
          <div className="max-w-xl mx-auto space-y-2">
            {items.map((item, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between">
                  {item.question}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center">No questions added yet.</p>
        )}
      </section>
    );
  }

  if (name === 'Testimonials') {
    const items = content.testimonialItems || [];
    return (
      <section className="py-14 px-6 border-t border-slate-100">
        {heading && <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">{heading}</h2>}
        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {items.map((item, i) => (
              <blockquote key={i} className="p-5 rounded-xl bg-white border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed">&quot;{item.quote}&quot;</p>
                <footer className="mt-3 text-xs font-bold text-slate-900">
                  {item.author}
                  {item.role && <span className="font-normal text-slate-400"> — {item.role}</span>}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center">No testimonials added yet.</p>
        )}
      </section>
    );
  }

  if (heading || body || imageUrl) {
    return (
      <section className="py-14 px-6 text-center border-t border-slate-100">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mx-auto mb-6 max-h-56 max-w-full rounded-xl object-contain" />
        )}
        {heading && <h2 className="text-xl font-bold text-slate-900">{heading}</h2>}
        {body && <p className="mt-2 text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">{body}</p>}
        {content.buttonText && (
          <a href={content.buttonLink || '#form'} className="mt-4 inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
            {content.buttonText}
          </a>
        )}
      </section>
    );
  }

  return (
    <section className="py-14 px-6 text-center border-t border-slate-100">
      <h2 className="text-lg font-bold text-slate-900">{name}</h2>
      <p className="mt-1 text-xs text-slate-400">Content block configured for {pageTitle}.</p>
    </section>
  );
}

export default async function MicroPagePublic({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  const template = getMicroPageTemplate(page.template);
  const blocks = page.blockOrder.length > 0 ? page.blockOrder : (template?.components || ['Hero', 'Form', 'CTA', 'Footer']);
  const content = (page.content as MicroPageContent | null) || {};

  return (
    <main className="min-h-screen bg-slate-50/50">
      <ViewTracker slug={slug} />
      {blocks.map((block, i) => (
        <Block key={`${block}-${i}`} name={block} pageTitle={page.title} slug={slug} description={page.seoDescription} content={content[block] || {}} />
      ))}
    </main>
  );
}
