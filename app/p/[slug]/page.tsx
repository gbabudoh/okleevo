import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getMicroPageTemplate } from '@/lib/micro-page-templates';
import { getPresignedUrl } from '@/lib/services/minio';
import type { MicroPageBlockContent, MicroPageContent } from '@/lib/micro-page-content';

async function getPublishedPage(slug: string) {
  const page = await prisma.microPage.findUnique({ where: { slug } });
  if (!page || page.status !== 'PUBLISHED') return null;
  return page;
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

// Resolve stored object keys to viewable URLs. Presigned URLs expire, so this
// is done fresh on every request rather than storing the URL itself.
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
  description,
  content,
}: {
  name: string;
  pageTitle: string;
  description?: string | null;
  content: MicroPageBlockContent;
}) {
  const heading = content.heading || (name === 'Hero' ? pageTitle : undefined);
  const body = content.body || (name === 'Hero' ? description : undefined);
  const imageUrl = await resolveImage(content.imageKey);

  if (name === 'Hero') {
    return (
      <section className="py-20 px-6 text-center bg-gray-900 text-white">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mx-auto mb-6 max-h-64 max-w-full rounded-xl object-contain" />
        )}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{heading}</h1>
        {body && <p className="mt-4 text-gray-300 max-w-xl mx-auto text-lg">{body}</p>}
        {content.buttonText && (
          <a
            href={content.buttonLink || '#'}
            className="mt-8 inline-block px-6 py-3 bg-white text-gray-900 rounded-lg text-sm font-semibold"
          >
            {content.buttonText}
          </a>
        )}
      </section>
    );
  }

  if (name === 'CTA') {
    return (
      <section className="py-16 px-6 text-center bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-900">{heading || 'Ready to get started?'}</h2>
        {body && <p className="mt-2 text-gray-500 max-w-lg mx-auto">{body}</p>}
        <a
          href={content.buttonLink || '#'}
          className="mt-6 inline-block px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          {content.buttonText || 'Get in touch'}
        </a>
      </section>
    );
  }

  if (name === 'Footer') {
    return (
      <footer className="py-8 px-6 text-center text-xs text-gray-400 border-t border-gray-100">
        {body || 'Powered by Okleevo'}
      </footer>
    );
  }

  if (name === 'Gallery') {
    const keys = content.imageKeys || [];
    const urls = (await Promise.all(keys.map(resolveImage))).filter((u): u is string => !!u);
    return (
      <section className="py-14 px-6 border-t border-gray-100">
        {heading && <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">{heading}</h2>}
        {urls.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {urls.map((url, i) => (
              <div key={i} className="w-full aspect-square rounded-lg bg-gray-50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center">No images added to this gallery yet.</p>
        )}
      </section>
    );
  }

  // Generic fallback for any block without a bespoke layout above.
  if (heading || body || imageUrl) {
    return (
      <section className="py-14 px-6 text-center border-t border-gray-100">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mx-auto mb-6 max-h-56 max-w-full rounded-xl object-contain" />
        )}
        {heading && <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>}
        {body && <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">{body}</p>}
        {content.buttonText && (
          <a href={content.buttonLink || '#'} className="mt-4 inline-block px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">
            {content.buttonText}
          </a>
        )}
      </section>
    );
  }

  return (
    <section className="py-14 px-6 text-center border-t border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
      <p className="mt-2 text-sm text-gray-400">This section&rsquo;s content isn&rsquo;t editable yet.</p>
    </section>
  );
}

export default async function MicroPagePublic({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  // Fire-and-forget view count — best-effort, doesn't block the render.
  prisma.microPage.update({ where: { id: page.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const template = getMicroPageTemplate(page.template);
  const blocks = template?.components || ['Hero', 'Footer'];
  const content = (page.content as MicroPageContent | null) || {};

  return (
    <main className="min-h-screen bg-white">
      {blocks.map((block, i) => (
        <Block key={`${block}-${i}`} name={block} pageTitle={page.title} description={page.seoDescription} content={content[block] || {}} />
      ))}
    </main>
  );
}
