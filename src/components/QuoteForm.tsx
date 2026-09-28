'use client';
import { useState } from 'react';
import { buildWhatsAppLink, composeQuoteMessage } from '../../baslangic-modulleri/whatsapp.mjs';
import type { Contact } from '@/lib/contact';
import { trackAnalyticsEvent } from '@/lib/analytics';
type Item = { id: number; product: string; width: string; height: string; unit: string; quantity: string };
const item = (id: number): Item => ({ id, product: '', width: '', height: '', unit: 'mm', quantity: '1' });
export function QuoteForm({ districts }: { districts: string[] }) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [preview, setPreview] = useState<{ message: string; label: string; link: ReturnType<typeof buildWhatsAppLink> } | null>(null);
  function update(id: number, field: keyof Item, value: string) {
    setItems(items.map(row => row.id === id ? { ...row, [field]: value } : row));
    setPreview(null);
  }
  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setCopyStatus(''); setPreview(null); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/public-settings', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Güncel iletişim bilgileri alınamadı. Metniniz korunuyor; yeniden deneyin.');
      const contact: Contact = await response.json();
      const message = composeQuoteMessage({ company: form.get('company'), district: form.get('district'), note: form.get('note'), items }, { greeting: contact.greeting });
      setPreview({ message, label: contact.quoteLabel, link: buildWhatsAppLink(contact.number, message) });
      trackAnalyticsEvent('quote_prepare');
    } catch (err) { setError(err instanceof Error ? err.message : 'Mesaj hazırlanamadı. Yeniden deneyin.'); }
    finally { setBusy(false); }
  }
  async function openCurrent(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (!preview) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/public-settings', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Güncel numara alınamadı. Metniniz korunuyor; yeniden deneyin.');
      const contact: Contact = await response.json();
      const fresh = buildWhatsAppLink(contact.number, preview.message);
      trackAnalyticsEvent('whatsapp_click');
      // Same-tab navigation avoids popup blockers after the settings check.
      window.location.assign(fresh.href);
    } catch (err) { setError(err instanceof Error ? err.message : 'Bağlantı açılamadı.'); }
    finally { setBusy(false); }
  }
  return <form aria-label="WhatsApp teklif mesajı hazırlama formu" onSubmit={prepare} onChange={() => setPreview(null)}>
    <p className="eyebrow">İHTİYAÇ BİLGİLERİ</p>
    <p>Firma adı ve kesin ölçü gerekmez. Bildiğiniz detayları paylaşmanız yeterli.</p>
    <div className="form-grid">
      <label>Firma / kurum <span>(isteğe bağlı)</span><input name="company" maxLength={160} autoComplete="organization" /></label>
      <label>İlçe <span>(isteğe bağlı)</span><select name="district"><option value="">Henüz belirtmek istemiyorum</option>{districts.map(d => <option key={d}>{d}</option>)}</select></label>
    </div>
    {items.map((row, index) => <fieldset key={row.id}><legend>Ürün {index + 1}</legend>
      <label>Ürün / model<input value={row.product} onChange={e => update(row.id, 'product', e.target.value)} maxLength={160} required /></label>
      <div className="measurements">{(['width', 'height'] as const).map((key, i) => <label key={key}>{i === 0 ? 'En' : 'Boy'}<input inputMode="decimal" value={row[key]} onChange={e => update(row.id, key, e.target.value)} /></label>)}
        <label>Birim<select value={row.unit} onChange={e => update(row.id, 'unit', e.target.value)}><option>mm</option><option>cm</option></select></label>
        <label>Adet<input inputMode="numeric" value={row.quantity} onChange={e => update(row.id, 'quantity', e.target.value)} required /></label>
      </div><button type="button" className="text-button" onClick={() => { setItems(items.filter(i => i.id !== row.id)); setPreview(null); }}>Ürün {index + 1} satırını kaldır</button>
    </fieldset>)}
    <button type="button" className="text-button" disabled={items.length >= 10} onClick={() => { setItems([...items, item(Date.now())]); setPreview(null); }}>+ Ürün ve ölçü ekle <span>(isteğe bağlı, en fazla 10)</span></button>
    <label>İhtiyacınız / ek not <span>(isteğe bağlı)</span><textarea name="note" rows={4} maxLength={1000} placeholder="Örneğin: Evim için bir ayna düşünüyorum, ölçülerini henüz bilmiyorum." /></label>
    <p className="small">Fotoğraf veya ölçü listenizi açılan WhatsApp sohbetine kendiniz ekleyebilirsiniz. Bu formdaki bilgiler siteye kaydedilmez.</p>
    <button className="button dark" disabled={busy} type="submit">{busy ? 'İletişim bilgileri kontrol ediliyor…' : 'Mesajı hazırla'}<span aria-hidden="true">↗</span></button>
    {error && <p role="alert">{error}</p>}
    {preview && <section className="preview" aria-label="Mesaj önizlemesi" aria-live="polite"><h3>Mesajınız hazır</h3>
      <p>Mesaj henüz gönderilmedi. Göndermeyi WhatsApp içinde siz onaylarsınız.</p>
      <textarea aria-label="Hazırlanan mesaj" value={preview.message} readOnly rows={8} onFocus={e => e.target.select()} />
      {preview.link.requiresCopy && <p>Mesaj uzun olduğu için tam metni kopyalayıp açılan sohbete yapıştırın.</p>}
      <button className="text-button" type="button" onClick={async () => { try { await navigator.clipboard.writeText(preview.message); setCopyStatus('Mesaj kopyalandı.'); } catch { setCopyStatus('Kopyalama izni verilmedi. Yukarıdaki metni seçip elle kopyalayabilirsiniz.'); } }}>Tam metni kopyala</button>
      <p role="status">{copyStatus}</p><p>{preview.link.displayNumber}</p>
      <a className="button dark" href={preview.link.href} onClick={openCurrent} aria-disabled={busy}>{preview.label} ↗</a>
    </section>}
  </form>;
}
