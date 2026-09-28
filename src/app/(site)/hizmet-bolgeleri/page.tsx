import type { Metadata } from 'next';
import { ContactLink } from '@/components/ContactLink';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { getSiteChromeData, getTargetDistricts } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ankara Hizmet Bölgeleri',
  description: 'Rina Cam & Ayna için Ankara merkez ve 25 ilçeyi kapsayan hedef hizmet bölgeleri.',
  alternates: { canonical: '/hizmet-bolgeleri' },
};

export default async function ServiceRegionsPage() {
  const [{ site, header, footer, contact }, districts] = await Promise.all([
    getSiteChromeData(),
    getTargetDistricts(),
  ]);

  return <>
    <SiteHeader site={site} header={header} contact={contact} />
    <main id="icerik" className="inner-page region-page">
      <header className="inner-hero">
        <p className="eyebrow">ANKARA / 25 İLÇE</p>
        <h1>ALANI GÖRELİM.<br /><span>KOŞULLARI BİRLİKTE</span><br />NETLEŞTİRELİM.</h1>
        <p>Ankara merkezi ve ilçeleri hedef kapsamımızdadır. Bu liste her iş için kesin yerinde ölçü, montaj veya nakliye taahhüdü anlamına gelmez; koşullar hizmete ve konuma göre işletmeyle netleştirilir.</p>
      </header>

      <section className="district-index" aria-label="Ankara hedef ilçeleri">
        {districts.map((district, index) => <article key={district.id}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <h2>{district.ad}</h2>
          {district.operasyon_teyidi && <p>{district.operasyon_teyidi}</p>}
        </article>)}
      </section>

      <section className="region-contact">
        <div><p className="eyebrow">KONUM VE İHTİYAÇ</p><h2>İlçenizi yazmanız yeterli.</h2></div>
        <div><p>İlçe bilgisi isteğe bağlıdır. Kesin adres vermeden önce ihtiyacınızı, yaklaşık ölçüyü biliyorsanız ölçüyü ve fotoğrafı WhatsApp sohbetinde paylaşabilirsiniz.</p><ContactLink contact={contact} /></div>
      </section>
    </main>
    <SiteFooter site={site} footer={footer} contact={contact} />
  </>;
}
