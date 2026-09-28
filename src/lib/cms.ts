import { getPayload } from 'payload';
import { randomInt } from 'node:crypto';
import config from '@payload-config';
import { getContact } from './contact';
import type { Hizmetler, Uygulamalar } from '@/payload-types';

function relationId(value: number | { id: number } | null | undefined): number | null {
  if (typeof value === 'number') return value;
  return value?.id ?? null;
}

function orderSelected<T extends { id: number }>(records: T[], selected: Array<number | T> | null | undefined): T[] {
  const ids = (selected ?? []).map(relationId).filter((id): id is number => id !== null);
  if (!ids.length) return [];
  const map = new Map(records.map(record => [record.id, record]));
  return ids.map(id => map.get(id)).filter((record): record is T => Boolean(record));
}

export async function getHomePageData() {
  const payload = await getPayload({ config });
  const [site, home, header, footer, contact, districts, serviceResult, applicationResult] = await Promise.all([
    payload.findGlobal({ slug: 'site_ayarlari', depth: 1, overrideAccess: false }),
    payload.findGlobal({ slug: 'ana_sayfa_icerigi', depth: 0, draft: false, overrideAccess: false }),
    payload.findGlobal({ slug: 'ust_bilgi', depth: 0, overrideAccess: false }),
    payload.findGlobal({ slug: 'alt_bilgi', depth: 0, overrideAccess: false }),
    getContact(),
    payload.find({ collection: 'hizmet_bolgeleri', depth: 0, limit: 25, sort: 'sira', where: { hedef_kapsam: { equals: true } }, overrideAccess: false }),
    payload.find({ collection: 'hizmetler', depth: 1, draft: false, limit: 50, sort: 'sira', overrideAccess: false }),
    payload.find({ collection: 'uygulamalar', depth: 1, draft: false, limit: 30, sort: 'sira', overrideAccess: false }),
  ]);

  // Relationships are deliberately resolved through access-controlled queries above.
  const selectedServices = orderSelected<Hizmetler>(serviceResult.docs, home.secili_hizmetler as Array<number | Hizmetler> | null | undefined);
  const selectedApplications = orderSelected<Uygulamalar>(applicationResult.docs, home.secili_uygulamalar as Array<number | Uygulamalar> | null | undefined);

  return { site, home, header, footer, contact, districts: districts.docs, services: selectedServices, applications: selectedApplications };
}

export async function getSiteChromeData() {
  const payload = await getPayload({ config });
  const [site, header, footer, contact] = await Promise.all([
    payload.findGlobal({ slug: 'site_ayarlari', depth: 1, overrideAccess: false }),
    payload.findGlobal({ slug: 'ust_bilgi', depth: 0, overrideAccess: false }),
    payload.findGlobal({ slug: 'alt_bilgi', depth: 0, overrideAccess: false }),
    getContact(),
  ]);
  return { site, header, footer, contact };
}

export async function getPublishedServices() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'hizmetler',
    depth: 1,
    draft: false,
    limit: 100,
    sort: 'sira',
    overrideAccess: false,
  });
  return result.docs;
}

export async function getPublishedApplications() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'uygulamalar',
    depth: 1,
    draft: false,
    limit: 100,
    sort: 'sira',
    overrideAccess: false,
  });
  return result.docs;
}

export async function getPublishedService(slug: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'hizmetler',
    depth: 2,
    draft: false,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  });
  return result.docs[0] ?? null;
}

export async function getTargetDistricts() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'hizmet_bolgeleri',
    depth: 0,
    limit: 25,
    sort: 'sira',
    where: { hedef_kapsam: { equals: true } },
    overrideAccess: false,
  });
  return result.docs;
}

export async function getExampleLibrary() {
  const payload = await getPayload({ config });
  const [usageAreas, options, faqs, guides, comments] = await Promise.all([
    payload.find({ collection: 'kullanim_alanlari', depth: 1, draft: false, limit: 20, sort: 'sira', overrideAccess: false }),
    payload.find({ collection: 'islem_secenekleri', depth: 0, draft: false, limit: 50, sort: 'sira', overrideAccess: false }),
    payload.find({ collection: 'sss', depth: 1, draft: false, limit: 50, sort: 'sira', overrideAccess: false }),
    payload.find({ collection: 'rehber_yazilari', depth: 1, draft: false, limit: 20, sort: '-updatedAt', overrideAccess: false }),
    payload.find({ collection: 'yorumlar', depth: 0, draft: false, limit: 20, sort: 'sira', where: { sitede_goster: { equals: true } }, overrideAccess: false }),
  ]);
  return {
    usageAreas: usageAreas.docs, options: options.docs, faqs: faqs.docs,
    guides: guides.docs, comments: comments.docs,
  };
}

export async function getPublishedGuides() {
  const payload = await getPayload({ config });
  return (await payload.find({ collection: 'rehber_yazilari', depth: 1, draft: false, limit: 100,
    sort: '-updatedAt', overrideAccess: false })).docs;
}

export async function getPublishedGuide(slug: string) {
  const payload = await getPayload({ config });
  return (await payload.find({ collection: 'rehber_yazilari', depth: 1, draft: false, limit: 1,
    where: { slug: { equals: slug } }, overrideAccess: false })).docs[0] ?? null;
}

export async function getPublishedFaqs() {
  const payload = await getPayload({ config });
  return (await payload.find({ collection: 'sss', depth: 0, draft: false, limit: 100,
    sort: 'sira', overrideAccess: false })).docs;
}

export async function getVisibleComments() {
  const payload = await getPayload({ config });
  return (await payload.find({ collection: 'yorumlar', depth: 0, draft: false, limit: 100,
    sort: 'sira', where: { sitede_goster: { equals: true } }, overrideAccess: false })).docs;
}

export async function getActiveCampaign() {
  const payload = await getPayload({ config });
  const now = new Date().toISOString();
  const campaigns = (await payload.find({
    collection: 'kampanyalar', depth: 1, draft: false, limit: 100, sort: '-baslangic',
    where: { and: [
      { baslangic: { less_than_equal: now } },
      { bitis: { greater_than_equal: now } },
    ] },
    overrideAccess: false,
  })).docs;
  return campaigns.length > 0 ? campaigns[randomInt(campaigns.length)] : null;
}

export async function getPublishedPage(slug: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: 'sayfalar', depth: 1, draft: false, limit: 1,
    where: { slug: { equals: slug } }, overrideAccess: false });
  return result.docs[0] ?? null;
}

export async function getPublicRedirect(source: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: 'yonlendirmeler', depth: 0, limit: 1,
    where: { kaynak: { equals: source } }, overrideAccess: false });
  return result.docs[0] ?? null;
}
