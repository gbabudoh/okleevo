import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://okleevo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/guide', '/pricing', '/support', '/p/'],
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
          'Meta-ExternalAgent',
        ],
        allow: ['/', '/llms.txt', '/guide', '/pricing', '/support', '/p/'],
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
