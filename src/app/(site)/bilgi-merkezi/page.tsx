import type { Metadata } from 'next';
import Link from 'next/link';
import { CmsImage, mediaValue } from '@/components/CmsImage';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { RevealSection } from '@/components/RevealSection';
import { getExampleLibrary, getPublishedServices, getSiteChromeData } from '@/lib/cms';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Cam ve Ayna Bilgi Merkezi',
  description: 'Cam ve ayna hizmetleri, kullanım alanları, rehber yazıları ve sık sorulan sorular.',
  alternates: { canonical: '/bilgi-merkezi' },
};

export default async function ContentHubPage() {
  const [chrome, services, library] = await Promise.all([getSiteChromeData(), getPublishedServices(), getExampleLibrary()]);
  return <>
    <SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} />
    <main id="icerik" className="inner-page content-hub">
      <header className="inner-hero compact-hero">
        <p className="eyebrow">CAM & AYNA / BİLGİ MERKEZİ</p>
        <h1>DOĞRU UYGULAMAYI<br /><span>BİRLİKTE SEÇELİM.</span></h1>
        <p>Hizmetleri, kullanım alanlarını ve cam seçeneklerini inceleyin. Ölçü, malzeme ve montaj kararı uygulama alanı görüldükten sonra netleştirilir.</p>
      </header>

      <nav className="content-hub-nav" aria-label="Bilgi merkezi bölümleri">
        <a href="#hizmetler">Hizmetler</a><a href="#kullanim">Kullanım alanları</a><a href="#secenekler">Cam ve ayna seçenekleri</a><a href="#rehberler">Rehberler</a><a href="#sss">Sık sorulan sorular</a>
      </nav>

      <section id="hizmetler" className="hub-section section-pad">
        <div className="hub-section-title"><p className="eyebrow">01 / HİZMETLER</p><h2>İHTİYACINIZA GÖRE<br />HİZMETLER</h2><p>Her hizmetin ayrıntılarını ve ilişkili seçenekleri kendi sayfasında inceleyin.</p></div>
        <div className="hub-service-list">{services.map((item, index) => <Link href={`/hizmetler/${item.slug}`} key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{item.ad}</h3><p>{item.ozet}</p></div><b aria-hidden="true">↗</b></Link>)}</div>
      </section>

      <section className="hub-columns section-pad">
        <div id="kullanim" className="hub-column">
          <div className="hub-subheading"><p className="eyebrow">02 / KULLANIM ALANLARI</p><h2>NEREDE KULLANILACAK?</h2></div>
          <div className="usage-card-list">{library.usageAreas.map(item => { const image = mediaValue(item.kapak_gorseli); return <article key={item.id}>{image && <div className="usage-card-image"><CmsImage media={image} sizes="(max-width: 780px) 100vw, 35vw" /></div>}<div><h3>{item.ad}</h3><p>{item.ozet}</p></div></article>; })}</div>
        </div>
        <div id="secenekler" className="hub-column">
          <div className="hub-subheading"><p className="eyebrow">03 / SEÇENEKLER</p><h2>HANGİ CAM VE AYNA?</h2></div>
          <div className="option-list">{library.options.map(item => <article key={item.id}><p className="eyebrow">{item.tur}</p><h3>{item.ad}</h3><p>{item.aciklama}</p></article>)}</div>
        </div>
      </section>

      <RevealSection id="rehberler" className="hub-section section-pad dark">
        <div className="hub-section-title"><p className="eyebrow">04 / REHBERLER</p><h2>KARAR VERMEDEN<br />ÖNCE OKUYUN</h2><p>Ölçü paylaşımı, duş camı ve ofis bölme planlaması için kısa rehberler.</p></div>
        <div className="guide-grid">{library.guides.map(item => { const image = mediaValue(item.kapak_gorseli); return <Link href={`/rehber/${item.slug}`} className="guide-card" key={item.id}>{image && <div className="guide-image"><CmsImage media={image} sizes="(max-width: 780px) 100vw, 30vw" /></div>}<div><p className="eyebrow">REHBER</p><h3>{item.baslik}</h3><p>{item.ozet}</p><b>Yazıyı aç ↗</b></div></Link>; })}</div>
        <Link className="hub-more-link" href="/rehber">Tüm rehber yazıları <span aria-hidden="true">↗</span></Link>
      </RevealSection>

      <section id="sss" className="hub-section section-pad">
        <div className="hub-section-title"><p className="eyebrow">05 / SIK SORULAN SORULAR</p><h2>KISA VE NET<br />YANITLAR</h2><p>İlk ölçü, fotoğraf paylaşımı, fiyatlandırma ve uygulama süreci hakkında sık sorulanlar.</p></div>
        <div className="faq-list">{library.faqs.map(item => <details key={item.id}><summary>{item.soru}</summary><p>{item.yanit}</p></details>)}</div>
        <Link className="hub-more-link" href="/sss">Tüm soruları aç <span aria-hidden="true">↗</span></Link>
      </section>

      {library.comments.length > 0 && <section className="hub-section section-pad reviews-section">
        <div className="hub-section-title"><p className="eyebrow">06 / YORUMLAR</p><h2>MÜŞTERİ<br />DENEYİMLERİ</h2><p>Panelde yayınlanması seçilen Google ve web sitesi yorumları.</p></div>
        <div className="review-grid">{library.comments.map(item => <blockquote className="review-card" key={item.id}><div className="review-stars" aria-label={item.puan ? `${item.puan} üzerinden 5 puan` : 'Puan belirtilmemiş'}>{item.puan ? '★'.repeat(item.puan) : '—'}</div><p>“{item.yorum}”</p><div className="review-meta"><cite>{item.gostergelik_ad}</cite>{item.kaynak_baglantisi ? <a href={item.kaynak_baglantisi} target="_blank" rel="noopener noreferrer">{item.kaynak} ↗</a> : <span>{item.kaynak}</span>}</div></blockquote>)}</div>
        <Link className="hub-more-link" href="/yorumlar">Tüm yorumları aç <span aria-hidden="true">↗</span></Link>
      </section>}
    </main>
    <SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} />
  </>;
}
