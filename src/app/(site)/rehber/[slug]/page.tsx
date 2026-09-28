import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { absoluteMediaURL, CmsImage, mediaValue } from '@/components/CmsImage';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { StructuredData } from '@/components/StructuredData';
import { getPublishedGuide, getSiteChromeData } from '@/lib/cms';
import { canonical } from '@/lib/env.mjs';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getPublishedGuide((await params).slug);
  if (!guide) return {};
  const share = mediaValue(guide.seo?.paylasim_gorseli) ?? mediaValue(guide.kapak_gorseli);
  return {
    title: guide.seo?.baslik || guide.baslik,
    description: guide.seo?.aciklama || guide.ozet,
    alternates: { canonical: `/rehber/${guide.slug}` },
    robots: guide.seo?.indekslenebilir === false ? { index: false, follow: true } : undefined,
    openGraph: share?.url ? { type: 'article', images: [{ url: absoluteMediaURL(share, canonical) as string, alt: share.alt }] } : { type: 'article' },
  };
}
export default async function GuidePage({ params }: Props) {
  const guide = await getPublishedGuide((await params).slug); if (!guide) notFound();
  const chrome = await getSiteChromeData(); const image = mediaValue(guide.kapak_gorseli);
  return <><StructuredData data={{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: guide.baslik, description: guide.ozet, dateModified: guide.updatedAt,
    mainEntityOfPage: `${canonical}/rehber/${guide.slug}`,
    publisher: { '@type': 'Organization', '@id': `${canonical}/#isletme`, name: chrome.site.firma_adi },
    ...(image?.url ? { image: absoluteMediaURL(image, canonical) } : {}),
  }} /><SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} /><main id="icerik" className="inner-page">
    <header className={`detail-hero ${image ? 'with-media' : ''}`}><div><p className="eyebrow">REHBER</p><h1>{guide.baslik}</h1><p>{guide.ozet}</p></div>{image && <div className="detail-media"><CmsImage media={image} priority sizes="(max-width:780px) 100vw, 50vw" /></div>}</header>
    {guide.icerik && <article className="rich-content"><RichText data={guide.icerik} /></article>}
    <p className="section-pad"><Link className="text-link" href="/rehber">← Tüm rehberler</Link></p>
  </main><SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} /></>;
}
