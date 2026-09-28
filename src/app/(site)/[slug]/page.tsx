import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { ContactLink } from '@/components/ContactLink';
import { absoluteMediaURL, mediaValue } from '@/components/CmsImage';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { StructuredData } from '@/components/StructuredData';
import { getPublishedPage, getPublicRedirect, getSiteChromeData } from '@/lib/cms';
import { canonical } from '@/lib/env.mjs';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return {};
  const share = mediaValue(page.seo?.paylasim_gorseli);
  return {
    title: page.seo?.baslik || page.baslik,
    description: page.seo?.aciklama || page.ozet,
    alternates: { canonical: `/${page.slug}` },
    robots: page.seo?.indekslenebilir === false ? { index: false, follow: true } : undefined,
    openGraph: share?.url ? { images: [{ url: absoluteMediaURL(share, canonical) as string, alt: share.alt }] } : undefined,
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const source = `/${slug}`;
  const [page, mapped] = await Promise.all([getPublishedPage(slug), getPublicRedirect(source)]);
  if (!page && mapped) mapped.kalici ? permanentRedirect(mapped.hedef) : redirect(mapped.hedef);
  if (!page) notFound();
  const chrome = await getSiteChromeData();
  return <>
    <StructuredData data={{
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: page.baslik, description: page.ozet, url: `${canonical}/${page.slug}`,
      dateModified: page.updatedAt,
      isPartOf: { '@type': 'WebSite', '@id': `${canonical}/#website`, url: canonical, name: chrome.site.firma_adi },
    }} />
    <SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} />
    <main id="icerik" className="inner-page">
      <header className="inner-hero"><p className="eyebrow">BİLGİ SAYFASI</p><h1>{page.baslik}</h1><p>{page.ozet}</p></header>
      {page.icerik && <article className="rich-content"><RichText data={page.icerik} /></article>}
      <section className="detail-note"><p className="eyebrow">İLETİŞİM</p><h2>İhtiyacınızı WhatsApp’ta anlatın.</h2><p>Mesajı siz gönderirsiniz; bağlantı yalnız sohbeti ve hazır metni açar.</p><ContactLink contact={chrome.contact} /></section>
      <p className="section-pad"><Link className="text-link" href="/bilgi-merkezi">← Bilgi merkezine dön</Link></p>
    </main>
    <SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} />
  </>;
}
