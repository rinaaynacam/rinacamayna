import type { Metadata } from 'next';
import Link from 'next/link';
import { ApplicationCard } from '@/components/ApplicationCard';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { getPublishedApplications, getSiteChromeData } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cam ve Ayna Uygulama Görselleri',
  description: 'Rina Cam & Ayna tarafından yayınlanan cam ve ayna uygulama görsellerini toplu olarak inceleyin.',
  alternates: { canonical: '/uygulamalar' },
};

type Props = { searchParams: Promise<{ kategori?: string | string[] }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  const [chrome, applications] = await Promise.all([
    getSiteChromeData(),
    getPublishedApplications(),
  ]);
  const categories = new Map<string, string>();
  for (const application of applications) {
    for (const service of application.hizmetler ?? []) {
      if (typeof service === 'object' && service.slug) categories.set(service.slug, service.ad);
    }
  }
  const requestedCategory = (await searchParams).kategori;
  const categorySlug = typeof requestedCategory === 'string' && categories.has(requestedCategory) ? requestedCategory : null;
  const visibleApplications = categorySlug
    ? applications.filter(application => application.hizmetler?.some(service => typeof service === 'object' && service.slug === categorySlug))
    : applications;

  return <>
    <SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} />
    <main id="icerik" className="inner-page applications-page">
      <header className="inner-hero">
        <p className="eyebrow">03 / SEÇİLİ İŞLER</p>
        <h1>CAM VE AYNA<br /><span>UYGULAMALARI.</span></h1>
      </header>

      {categories.size > 0 && <nav className="content-hub-nav application-filters" aria-label="Uygulama kategorileri">
        <Link href="/uygulamalar" className={`application-filter ${categorySlug === null ? 'is-active' : ''}`} aria-current={categorySlug === null ? 'page' : undefined}>Tümü</Link>
        {[...categories].map(([slug, name]) => <Link href={`/uygulamalar?kategori=${encodeURIComponent(slug)}`} className={`application-filter ${categorySlug === slug ? 'is-active' : ''}`} aria-current={categorySlug === slug ? 'page' : undefined} key={slug}>{name}</Link>)}
      </nav>}

      {visibleApplications.length > 0 ? <section className="application-gallery" aria-label="Yayınlanmış uygulamalar">
        {visibleApplications.map((application, index) => <ApplicationCard application={application} index={index} priority={index === 0} key={application.id} />)}
      </section> : <section className="empty-state">
        <p className="eyebrow">GÖRSEL ARŞİVİ</p>
        <h2>Yayınlanmış uygulama görseli bulunmuyor.</h2>
        <p>Yeni görseller yönetim panelindeki Gerçek Uygulamalar alanından yayınlandığında burada toplu olarak gösterilir.</p>
      </section>}
    </main>
    <SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} />
  </>;
}
