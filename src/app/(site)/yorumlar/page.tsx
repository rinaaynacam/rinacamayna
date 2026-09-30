import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { ReviewForm } from '@/components/ReviewForm';
import { getSiteChromeData, getVisibleComments } from '@/lib/cms';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Müşteri Yorumları', description: 'Rina Cam & Ayna için yayınlanması seçilen doğrulanmış müşteri yorumları.', alternates: { canonical: '/yorumlar' } };
export default async function CommentsPage() { const [chrome, comments] = await Promise.all([getSiteChromeData(), getVisibleComments()]); return <><SiteHeader site={chrome.site} header={chrome.header} contact={chrome.contact} /><main id="icerik" className="inner-page">
  <header className="inner-hero"><p className="eyebrow">GOOGLE VE WEB SİTESİ</p><h1>MÜŞTERİ<br /><span>YORUMLARI.</span></h1></header>
  {comments.length > 0 ? <section className="review-grid review-index section-pad">{comments.map(item => <blockquote className="review-card" key={item.id}><div className="review-stars" aria-label={item.puan ? `${item.puan} üzerinden 5 puan` : 'Puan belirtilmemiş'}>{item.puan ? '★'.repeat(item.puan) : '—'}</div><p>“{item.yorum}”</p><div className="review-meta"><cite>{item.gostergelik_ad}</cite>{item.kaynak_baglantisi ? <a href={item.kaynak_baglantisi} target="_blank" rel="noopener noreferrer">{item.kaynak} ↗</a> : <span>{item.kaynak}</span>}</div></blockquote>)}</section> : <section className="empty-state"><p className="eyebrow">YORUMLAR</p><h2>Henüz yayınlanmış yorum bulunmuyor.</h2></section>}
  <ReviewForm />
  </main><SiteFooter site={chrome.site} footer={chrome.footer} contact={chrome.contact} /></>; }
