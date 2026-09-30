import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { ApplicationVideo } from '@/components/ApplicationVideo';
import { absoluteMediaURL, CmsImage, mediaValue } from '@/components/CmsImage';
import { ContactLink } from '@/components/ContactLink';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { StructuredData } from '@/components/StructuredData';
import { getPublishedApplication, getSiteChromeData } from '@/lib/cms';
import { canonical } from '@/lib/env.mjs';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const application = await getPublishedApplication((await params).slug);
  if (!application) return {};
  const share = mediaValue(application.seo?.paylasim_gorseli) ?? (application.gorseller ?? []).map(mediaValue).find(Boolean);
  return {
    title: application.seo?.baslik || application.ad,
    description: application.seo?.aciklama || application.ozet,
    alternates: { canonical: `/uygulamalar/${application.slug}` },
    robots: application.seo?.indekslenebilir === false ? { index: false, follow: true } : undefined,
    openGraph: share ? { images: [{ url: absoluteMediaURL(share, canonical) as string, alt: share.alt }] } : undefined,
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const [application, chrome] = await Promise.all([
    getPublishedApplication((await params).slug),
    getSiteChromeData(),
  ]);
  if (!application) notFound();
  const images = (application.gorseller ?? []).map(mediaValue).filter((image): image is NonNullable<typeof image> => image !== null);
  const contact = { ...chrome.contact, message: `Merhaba, “${application.ad}” uygulaması hakkında bilgi almak istiyorum.` };

  return <>
    <StructuredData data={{
      '@context': 'https://schema.org', '@type': 'CreativeWork',
      name: application.ad, description: application.ozet,
      url: `${canonical}/uygulamalar/${application.slug}`,
      image: images.map(image => absoluteMediaURL(image, canonical)).filter(Boolean),
      provider: { '@type': 'LocalBusiness', '@id': `${canonical}/#isletme`, name: chrome.site.firma_adi },
    }} />
    <SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} />
    <main id="icerik" className="application-detail">
      <header className="application-detail-hero">
        <div>
          <Link className="back-link" href="/uygulamalar">← Tüm uygulamalar</Link>
          <p className="eyebrow">{application.kullanim || 'GERÇEK UYGULAMA'}</p>
          <h1>{application.ad}</h1>
          <p>{application.ozet}</p>
          <ContactLink contact={contact} label="Bu uygulamayı WhatsApp’ta sorun" />
        </div>
        {images[0] && <div className="application-detail-cover"><CmsImage media={images[0]} priority sizes="(max-width: 780px) 100vw, 55vw" /></div>}
      </header>

      {(application.malzeme || application.islem) && <dl className="application-facts">
        {application.malzeme && <div><dt>Malzeme</dt><dd>{application.malzeme}</dd></div>}
        {application.islem && <div><dt>İşlem</dt><dd>{application.islem}</dd></div>}
      </dl>}
      {application.aciklama && <article className="rich-content"><RichText data={application.aciklama} /></article>}
      {application.video_baglantisi && <section className="application-video-section section-pad"><p className="eyebrow">UYGULAMA VİDEOSU</p><ApplicationVideo url={application.video_baglantisi} title={application.ad} /></section>}
      {images.length > 1 && <section className="application-detail-gallery section-pad" aria-label={`${application.ad} görselleri`}>
        {images.slice(1).map((image, index) => <div key={image.id} className="application-detail-image"><CmsImage media={image} sizes="(max-width: 780px) 100vw, 50vw" priority={index === 0} /></div>)}
      </section>}
      <section className="detail-note"><p className="eyebrow">PROJENİZ İÇİN</p><h2>Benzer bir uygulamayı birlikte netleştirelim.</h2><p>Ölçü, malzeme, kenar ve montaj ayrıntıları uygulama alanına göre değerlendirilir.</p><ContactLink contact={contact} /></section>
    </main>
    <SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} />
  </>;
}
