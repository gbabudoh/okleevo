import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://okleevo.com';

  const routes: { path: string; priority: number; freq: 'daily' | 'weekly' }[] = [
    { path: '',          priority: 1.0, freq: 'daily' },
    { path: '/pricing',  priority: 0.9, freq: 'weekly' },
    { path: '/guide',    priority: 0.8, freq: 'weekly' },
    { path: '/support',  priority: 0.7, freq: 'weekly' },
    { path: '/terms',    priority: 0.5, freq: 'weekly' },
    { path: '/privacy',  priority: 0.5, freq: 'weekly' },
  ];

  const mapped = routes.map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: freq,
    priority,
  }));

  return mapped;
}
