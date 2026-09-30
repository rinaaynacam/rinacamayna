'use client';

import { useState } from 'react';

export function ReviewForm() {
  const [status, setStatus] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('busy');
    const form = event.currentTarget;
    const values = new FormData(form);
    const response = await fetch('/api/site-yorumlari', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ad: values.get('ad'),
        puan: Number(values.get('puan')),
        yorum: values.get('yorum'),
        izin: values.get('izin') === 'on',
        website: values.get('website'),
      }),
    }).catch(() => null);
    if (response?.ok) {
      form.reset();
      setStatus('success');
    } else setStatus('error');
  }

  return <section className="review-submit section-pad" aria-labelledby="yorum-birak-baslik">
    <div>
      <p className="eyebrow">DENEYİMİNİZİ PAYLAŞIN</p>
      <h2 id="yorum-birak-baslik">Yorum bırakın.</h2>
      <p>Yorumunuz önce yönetim panelinde incelenir. Onaylanırsa adınızla birlikte bu sayfada yayınlanır.</p>
    </div>
    <form onSubmit={submit}>
      <label htmlFor="yorum-ad">Adınız veya kurum adınız</label>
      <input id="yorum-ad" name="ad" required minLength={2} maxLength={80} autoComplete="name" />
      <label htmlFor="yorum-puan">Puanınız</label>
      <select id="yorum-puan" name="puan" required defaultValue="5">
        <option value="5">5 — Çok iyi</option><option value="4">4 — İyi</option><option value="3">3 — Orta</option><option value="2">2 — Zayıf</option><option value="1">1 — Çok zayıf</option>
      </select>
      <label htmlFor="yorum-metni">Yorumunuz</label>
      <textarea id="yorum-metni" name="yorum" required minLength={10} maxLength={1000} rows={6} />
      <div className="review-honeypot" aria-hidden="true"><label htmlFor="yorum-website">Web sitesi</label><input id="yorum-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <label className="review-consent"><input type="checkbox" name="izin" required /> Bu yorumun adımla birlikte sitede yayınlanabileceğini kabul ediyorum.</label>
      <button className="button" type="submit" disabled={status === 'busy'}>{status === 'busy' ? 'Gönderiliyor…' : 'Yorumu incelemeye gönder'}</button>
      <div className="form-status" aria-live="polite">
        {status === 'success' && <p>Yorumunuz inceleme için alındı. Yayınlanmadan önce kontrol edilecektir.</p>}
        {status === 'error' && <p>Yorum gönderilemedi. Alanları kontrol edip yeniden deneyin.</p>}
      </div>
    </form>
  </section>;
}
