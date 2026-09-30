import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { absoluteMediaURL, CmsImage, mediaValue } from '@/components/CmsImage';
import { ApplicationCard } from '@/components/ApplicationCard';
import { ContactLink } from '@/components/ContactLink';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { StructuredData } from '@/components/StructuredData';
import { getPublishedService, getServiceApplications, getSiteChromeData } from '@/lib/cms';
import { canonical } from '@/lib/env.mjs';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedService(slug);
  if (!service) return {};
  const share = mediaValue(service.seo?.paylasim_gorseli) ?? mediaValue(service.kapak_gorseli);
  return {
    title: service.seo?.baslik || service.ad,
    description: service.seo?.aciklama || service.ozet,
    alternates: { canonical: `/hizmetler/${service.slug}` },
    robots: service.seo?.indekslenebilir === false ? { index: false, follow: true } : undefined,
    openGraph: share?.url ? { images: [{ url: absoluteMediaURL(share, canonical) as string, alt: share.alt }] } : undefined,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [service, chrome] = await Promise.all([getPublishedService(slug), getSiteChromeData()]);
  if (!service) notFound();
  const relatedApplications = await getServiceApplications(service.id, 4);
  const image = mediaValue(service.kapak_gorseli);
  const serviceContact = service.whatsapp_mesaji ? { ...chrome.contact, message: service.whatsapp_mesaji } : chrome.contact;

  return <>
    <StructuredData data={{
      '@context': 'https://schema.org', '@type': 'Service',
      name: service.ad, serviceType: service.ad, description: service.ozet, url: `${canonical}/hizmetler/${service.slug}`,
      ...(image ? { image: absoluteMediaURL(image, canonical) } : {}),
      provider: { '@type': 'LocalBusiness', '@id': `${canonical}/#isletme`, name: chrome.site.firma_adi },
      areaServed: { '@type': 'AdministrativeArea', name: 'Ankara' },
    }} />
    <SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} />
    <main id="icerik" className="service-detail">
      <header className={`detail-hero ${image ? 'with-media' : ''}`}>
        <div>
          <Link className="back-link" href="/hizmetler">← Tüm hizmetler</Link>
          <p className="eyebrow">CAM & AYNA HİZMETİ</p>
          <h1>{service.ad}</h1>
          <p>{service.ozet}</p>
          <ContactLink contact={serviceContact} label="Bu hizmeti WhatsApp’ta sorun" />
        </div>
        {image && <div className="detail-media"><CmsImage media={image} priority sizes="(max-width: 780px) 100vw, 50vw" /></div>}
      </header>

      {service.aciklama && <article className="rich-content"><RichText data={service.aciklama} /></article>}

      {relatedApplications.docs.length > 0 && <section className="service-applications section-pad">
        <div className="service-applications-heading"><div><p className="eyebrow">GERÇEK UYGULAMALAR</p><h2>Bu hizmetle yapılan işler.</h2></div>{relatedApplications.totalDocs > 3 && <Link className="text-link" href={`/uygulamalar?kategori=${encodeURIComponent(service.slug ?? '')}`}>Tümünü görün ↗</Link>}</div>
        <div className="application-gallery related-application-gallery">{relatedApplications.docs.slice(0, 3).map((application, index) => <ApplicationCard key={application.id} application={application} index={index} />)}</div>
      </section>}

      <section className="service-relations section-pad">
        <div><p className="eyebrow">KULLANIM ALANLARI</p>{service.kullanim_alanlari?.map(item => typeof item === 'object' && <article key={item.id}><h2>{item.ad}</h2><p>{item.ozet}</p></article>)}</div>
        <div><p className="eyebrow">İŞLEM SEÇENEKLERİ</p>{service.islem_secenekleri?.map(item => typeof item === 'object' && <article key={item.id}><h2>{item.ad}</h2><p>{item.aciklama}</p><small>{item.tur} / {item.sunum_durumu}</small></article>)}</div>
      </section>

      {service.sss && service.sss.length > 0 && <section className="service-faq section-pad"><p className="eyebrow">SIK SORULAN SORULAR</p>{service.sss.map(item => typeof item === 'object' && <details key={item.id}><summary>{item.soru}</summary><p>{item.yanit}</p></details>)}</section>}

      <section className="detail-note">
        <p className="eyebrow">UYGULAMA KOŞULLARI</p>
        <h2>Ölçü ve uygulama ayrıntısını birlikte netleştirelim.</h2>
        <p>Malzeme, kenar işlemi, bağlantı, yerinde çalışma ve montaj koşulları kullanım alanına ve konuma göre değişebilir. Fotoğrafınızı WhatsApp sohbetinde ekleyebilirsiniz.</p>
        <ContactLink contact={serviceContact} />
      </section>
    </main>
    <SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} />
  </>;
}
