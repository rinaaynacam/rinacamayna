import type { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';
import { canonical } from '@/lib/env.mjs';

export const dynamic = 'force-dynamic';

type PublicDocument = { slug: string; updatedAt: string; seo?: { indekslenebilir?: boolean | null } | null };
const reservedSlugs = new Set(['admin', 'api', 'bilgi-merkezi', 'hizmet-bolgeleri', 'hizmetler', 'rehber', 'sss', 'uygulamalar', 'yorumlar']);
const latest = (items: Array<{ updatedAt?: string | null }>, fallback?: string | null) => items.reduce<string | undefined>((value, item) => {
  if (!item.updatedAt) return value;
  return !value || item.updatedAt > value ? item.updatedAt : value;
}, fallback ?? undefined);
const url = (path = '') => `${canonical}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const [site, servicesResult, applicationsResult, guidesResult, pagesResult, faqsResult, commentsResult, districtsResult, redirectsResult] = await Promise.all([
    payload.findGlobal({ slug: 'site_ayarlari', depth: 0, overrideAccess: false }),
    payload.find({ collection: 'hizmetler', depth: 0, draft: false, pagination: false, overrideAccess: false }),
    payload.find({ collection: 'uygulamalar', depth: 0, draft: false, pagination: false, overrideAccess: false }),
    payload.find({ collection: 'rehber_yazilari', depth: 0, draft: false, pagination: false, overrideAccess: false }),
    payload.find({ collection: 'sayfalar', depth: 0, draft: false, pagination: false, overrideAccess: false }),
    payload.find({ collection: 'sss', depth: 0, draft: false, pagination: false, overrideAccess: false }),
    payload.find({ collection: 'yorumlar', depth: 0, draft: false, pagination: false, where: { sitede_goster: { equals: true } }, overrideAccess: false }),
    payload.find({ collection: 'hizmet_bolgeleri', depth: 0, limit: 25, where: { hedef_kapsam: { equals: true } }, overrideAccess: false }),
    payload.find({ collection: 'yonlendirmeler', depth: 0, pagination: false, overrideAccess: false }),
  ]);

  const fallback = site.updatedAt ?? undefined;
  const services = (servicesResult.docs as PublicDocument[]).filter(item => item.seo?.indekslenebilir !== false);
  const guides = (guidesResult.docs as PublicDocument[]).filter(item => item.seo?.indekslenebilir !== false);
  const redirectSources = new Set(redirectsResult.docs.map(item => item.kaynak));
  const pages = (pagesResult.docs as PublicDocument[]).filter(item => item.seo?.indekslenebilir !== false
    && !reservedSlugs.has(item.slug) && !redirectSources.has(`/${item.slug}`));

  const entries: MetadataRoute.Sitemap = [
    { url: url(), lastModified: fallback, changeFrequency: 'weekly', priority: 1 },
    { url: url('/hizmetler'), lastModified: latest(servicesResult.docs, fallback), changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/uygulamalar'), lastModified: latest(applicationsResult.docs, fallback), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/bilgi-merkezi'), lastModified: latest([...servicesResult.docs, ...guidesResult.docs, ...faqsResult.docs], fallback), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/rehber'), lastModified: latest(guidesResult.docs, fallback), changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/sss'), lastModified: latest(faqsResult.docs, fallback), changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/yorumlar'), lastModified: latest(commentsResult.docs, fallback), changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/hizmet-bolgeleri'), lastModified: latest(districtsResult.docs, fallback), changeFrequency: 'monthly', priority: 0.7 },
  ];
  for (const item of services) entries.push({ url: url(`/hizmetler/${item.slug}`), lastModified: item.updatedAt, changeFrequency: 'monthly', priority: 0.8 });
  for (const item of guides) entries.push({ url: url(`/rehber/${item.slug}`), lastModified: item.updatedAt, changeFrequency: 'monthly', priority: 0.7 });
  for (const item of pages) entries.push({ url: url(`/${item.slug}`), lastModified: item.updatedAt, changeFrequency: 'monthly', priority: 0.6 });
  return entries;
}
