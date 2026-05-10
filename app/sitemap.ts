import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://okleevo.com';

  const routes = [
    '',
    '/guide',
    '/pricing',
    '/onboarding',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: (route === '' ? 'daily' : 'weekly') as "daily" | "weekly",
    priority: route === '' ? 1.0 : route === '/pricing' || route === '/guide' ? 0.8 : 0.5,
  }));

  return [...routes];
}
