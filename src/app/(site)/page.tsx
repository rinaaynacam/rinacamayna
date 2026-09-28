import Link from 'next/link';
import { RevealSection } from '@/components/RevealSection';
import { ContactLink } from '@/components/ContactLink';
import { QuoteForm } from '@/components/QuoteForm';
import { CmsImage, mediaValue } from '@/components/CmsImage';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { getHomePageData } from '@/lib/cms';
import { formatTrWhatsAppNumber } from '../../../baslangic-modulleri/whatsapp.mjs';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { site, home, header, footer, contact, districts, services, applications } = await getHomePageData();
  const heroImage = mediaValue(home.hero_gorseli);

  return <>
    <SiteHeader site={site} header={header} contact={contact} />

    <main id="icerik">
      <section className={`rina-hero ${heroImage ? 'has-image' : 'has-reference-image'}`}>
        <div className="hero-statement">
          {home.hero_etiket && <p className="eyebrow">{home.hero_etiket}</p>}
          <h1>{home.hero_baslik_1 && <span>{home.hero_baslik_1}</span>}{home.hero_vurgu && <span className="outline-word">{home.hero_vurgu}</span>}{home.hero_baslik_2 && <span>{home.hero_baslik_2}</span>}</h1>
          {home.hero_aciklama && <p className="hero-description">{home.hero_aciklama}</p>}
          <ContactLink contact={contact} label={home.hero_cta_etiketi} className="hero-button" />
        </div>
        <div className="hero-media" aria-label={heroImage?.alt || 'Aynalı iç mekân tasarım referansı'}>
          <div className="hero-measure" aria-hidden="true"><span>3200 MM</span></div>
          <div className="hero-image-frame">
            {heroImage
              ? <CmsImage media={heroImage} priority sizes="(max-width: 900px) 100vw, 45vw" />
              // The checked-in variants avoid a runtime image transformation on the LCP path.
              // eslint-disable-next-line @next/next/no-img-element
              : <img src="/design-reference/mirror-480.webp" srcSet="/design-reference/mirror-480.webp 480w, /design-reference/mirror-768.webp 768w, /design-reference/mirror.webp 1024w" sizes="(max-width: 900px) 100vw, 45vw" alt="Aynalı iç mekân tasarım referansı" width="1024" height="1024" decoding="async" loading="eager" fetchPriority="high" style={{ position: 'absolute', width: '100%', height: '100%', inset: 0 }} />}
          </div>
          <div className="media-caption"><span>01 / AYNA</span><span>{home.hero_gorsel_etiketi || 'Özel ölçü · İç mekân'}</span></div>
        </div>
        <aside className="hero-index" aria-label="Görsel dizini"><b>R</b><span>CAMIN ŞEFFAFLIĞI<br />AYNANIN DERİNLİĞİ</span></aside>
      </section>

      {home.yaklasim_gorunsun && <section id="yaklasim" className="manifesto section-pad">
        <p className="section-no">{home.yaklasim_sira}</p>
        <div className="manifesto-title">
          {home.yaklasim_baslik && <h2>{home.yaklasim_baslik}</h2>}
          {home.yaklasim_vurgu && <p>{home.yaklasim_vurgu}</p>}
        </div>
        {home.yaklasim_aciklama && <p className="manifesto-copy">{home.yaklasim_aciklama}</p>}
      </section>}

      {home.hizmetler_gorunsun && services.length > 0 && <section id="uygulamalar" className="services section-pad">
        <div className="section-heading"><p className="eyebrow">{home.hizmetler_etiket}</p><h2>{home.hizmetler_baslik}</h2>{home.hizmetler_aciklama && <p>{home.hizmetler_aciklama}</p>}</div>
        <div className="service-list">{services.map((service, index) => <Link href={`/hizmetler/${service.slug}`} className="service-row" key={service.id}>
          <span>{String(index + 1).padStart(2, '0')}</span><h3>{service.ad}</h3><p>{service.ozet}</p><b aria-hidden="true">↗</b>
        </Link>)}</div>
      </section>}

      {home.uygulamalar_gorunsun && applications.length > 0 && <RevealSection id="isler" className="selected-work section-pad">
        <div className="section-heading inverted"><p className="eyebrow">{home.uygulamalar_etiket}</p><h2>{home.uygulamalar_baslik}</h2>{home.uygulamalar_aciklama && <p>{home.uygulamalar_aciklama}</p>}</div>
        <div className="work-list">{applications.map((application, index) => {
          const image = application.gorseller?.map(mediaValue).find(Boolean);
          return <article className="work-item" key={application.id}>
            <div className="work-copy"><p className="eyebrow">{String(index + 1).padStart(2, '0')} / {application.kullanim || 'UYGULAMA'}</p><h3>{application.ad}</h3><p>{application.ozet}</p></div>
            {image && <div className="work-image"><CmsImage media={image} sizes="(max-width: 800px) 100vw, 65vw" /></div>}
          </article>;
        })}</div>
      </RevealSection>}

      {home.surec_gorunsun && <section id="surec" className="process-editorial section-pad">
        <div className="process-intro"><p className="eyebrow">{home.surec_etiket}</p><h2>{home.surec_baslik}</h2><ContactLink contact={contact} label={home.surec_cta_etiketi} className="text-link" /></div>
        <ol>{(home.surec_adimlari ?? []).map((step, index) => <li key={step.id ?? step.baslik}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.baslik}</h3><p>{step.aciklama}</p></div></li>)}</ol>
      </section>}

      {home.bolge_gorunsun && <section id="bolgeler" className="regions-editorial section-pad">
        <div><p className="eyebrow">{home.bolge_etiket}</p><h2>{home.bolge_baslik}</h2>{home.bolge_aciklama && <p>{home.bolge_aciklama}</p>}</div>
        <div><ul>{districts.map(district => <li key={district.id}>{district.ad}</li>)}</ul><Link className="region-link" href="/hizmet-bolgeleri">Tüm bölge bilgisini görün <span aria-hidden="true">↗</span></Link></div>
      </section>}

      <section id="teklif" className="quote quote-editorial">
        <aside><p className="eyebrow">{home.teklif_etiket}</p><h2>{home.teklif_baslik}</h2>{home.teklif_aciklama && <p>{home.teklif_aciklama}</p>}
          <div className="contact-lines"><span>{formatTrWhatsAppNumber(contact.number)}</span><ContactLink contact={contact} className="bare-link" /></div>
        </aside>
        <QuoteForm districts={districts.map(district => district.ad)} />
      </section>
    </main>

    <SiteFooter site={site} footer={footer} contact={contact} />
  </>;
}
