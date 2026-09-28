import type { Metadata } from 'next';
import Link from 'next/link';
import { CmsImage, mediaValue } from '@/components/CmsImage';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { getPublishedGuides, getSiteChromeData } from '@/lib/cms';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Cam ve Ayna Rehberleri', description: 'Cam ve ayna ölçüsü, seçimi ve uygulama planlaması için rehber yazıları.', alternates: { canonical: '/rehber' } };

export default async function GuidesPage() {
  const [chrome, guides] = await Promise.all([getSiteChromeData(), getPublishedGuides()]);
  return <><SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} /><main id="icerik" className="inner-page">
    <header className="inner-hero"><p className="eyebrow">BİLGİ MERKEZİ / REHBERLER</p><h1>CAM VE AYNA<br /><span>REHBERLERİ.</span></h1></header>
    {guides.length > 0 ? <section className="guide-grid guide-index section-pad">{guides.map(item => { const image = mediaValue(item.kapak_gorseli); return <Link href={`/rehber/${item.slug}`} className="guide-card" key={item.id}>{image && <div className="guide-image"><CmsImage media={image} sizes="(max-width:780px) 100vw, 33vw" /></div>}<div><p className="eyebrow">REHBER</p><h2>{item.baslik}</h2><p>{item.ozet}</p><b>Yazıyı aç ↗</b></div></Link>; })}</section> : <section className="empty-state"><p className="eyebrow">REHBERLER</p><h2>Yayınlanmış rehber bulunmuyor.</h2><p>Yeni yazılar panelden yayınlandığında burada görünür.</p></section>}
  </main><SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} /></>;
}
