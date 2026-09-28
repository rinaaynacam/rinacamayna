import type { MetadataRoute } from 'next';
import { canonical } from '@/lib/env.mjs';

export default function robots(): MetadataRoute.Robots {
  const indexing = process.env.APP_ENV === 'production' && process.env.INDEXING_ENABLED === 'true';
  if (!indexing) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    sitemap: `${canonical}/sitemap.xml`,
    host: canonical,
  };
}
