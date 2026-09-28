import type { Metadata } from 'next';
import Link from 'next/link';
import { CmsImage, mediaValue } from '@/components/CmsImage';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { getPublishedServices, getSiteChromeData } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cam ve Ayna Hizmetleri',
  description: 'Rina Cam & Ayna tarafından sunulan cam ve ayna hizmetlerini inceleyin.',
  alternates: { canonical: '/hizmetler' },
};

export default async function ServicesPage() {
  const [{ site, header, footer, contact }, services] = await Promise.all([
    getSiteChromeData(),
    getPublishedServices(),
  ]);

  return <>
    <SiteHeader site={site} header={header} contact={contact} />
    <main id="icerik" className="inner-page">
      <header className="inner-hero">
        <p className="eyebrow">01 / HİZMETLER</p>
        <h1>CAM VE AYNA<br />İHTİYACINIZA<br /><span>UYGUN ÇÖZÜM.</span></h1>
        <p>Cam ve ayna hizmetlerini kullanım alanına göre inceleyin. Uygulama ayrıntıları, yerinde çalışma ve montaj koşulları proje ile konuma göre netleştirilir.</p>
      </header>

      {services.length > 0 ? <section className="content-index" aria-label="Yayınlanmış hizmetler">
        {services.map((service, index) => {
          const image = mediaValue(service.kapak_gorseli);
          return <Link href={`/hizmetler/${service.slug}`} className="index-row" key={service.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><h2>{service.ad}</h2><p>{service.ozet}</p></div>
            {image && <div className="index-image"><CmsImage media={image} sizes="240px" /></div>}
            <b aria-hidden="true">↗</b>
          </Link>;
        })}
      </section> : <section className="empty-state">
        <p className="eyebrow">İÇERİK KONTROLÜ</p>
        <h2>Doğrulanmış hizmet kayıtları hazırlanıyor.</h2>
        <p>İhtiyacınızı ve varsa alanın fotoğrafını WhatsApp üzerinden paylaşabilirsiniz. Bu sayfaya teyit edilmemiş hizmet bilgisi eklenmez.</p>
      </section>}
    </main>
    <SiteFooter site={site} footer={footer} contact={contact} />
  </>;
}
