import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { getPublishedFaqs, getSiteChromeData } from '@/lib/cms';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sık Sorulan Sorular', description: 'Cam ve ayna ölçüsü, fiyatlandırma ve uygulama süreci hakkında sık sorulan sorular.', alternates: { canonical: '/sss' } };
export default async function FaqPage() { const [chrome, faqs] = await Promise.all([getSiteChromeData(), getPublishedFaqs()]); return <><SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} /><main id="icerik" className="inner-page">
  <header className="inner-hero"><p className="eyebrow">BİLGİ MERKEZİ / SSS</p><h1>SIK SORULAN<br /><span>SORULAR.</span></h1><p>İlk görüşme, ölçü, fotoğraf, fiyat ve uygulama süreci hakkında kısa yanıtlar.</p></header>
  <section className="faq-page section-pad"><div className="faq-list">{faqs.map(item => <details key={item.id}><summary>{item.soru}</summary><p>{item.yanit}</p></details>)}</div></section>
  </main><SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} /></>; }
