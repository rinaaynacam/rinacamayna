'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/yoneticiler/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }) });
      if (!response.ok) throw new Error('Giriş yapılamadı. Bilgilerinizi kontrol edin veya bir süre sonra deneyin.');
      router.push('/admin'); router.refresh();
    } catch { setError('Giriş yapılamadı. Bilgilerinizi kontrol edin veya bir süre sonra deneyin.'); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 440, margin: '6vh auto', padding: 24 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/admin/mebalci.webp" alt="Mebalci" width="480" height="304" style={{ display: 'block', width: 240, maxWidth: '100%', height: 'auto', objectFit: 'contain', margin: '0 auto 24px' }} />
    <h1>Mebalci yönetim paneli</h1>
    <form onSubmit={submit}><label htmlFor="username">Kullanıcı adı</label><input id="username" name="username" autoComplete="username" required style={{ display: 'block', width: '100%', padding: 12, margin: '8px 0 24px' }} />
      <label htmlFor="password">Parola</label><input id="password" name="password" type="password" autoComplete="current-password" required style={{ display: 'block', width: '100%', padding: 12, margin: '8px 0 24px' }} />
      <button type="submit" disabled={busy} style={{ minHeight: 44, padding: '8px 24px' }}>{busy ? 'Kontrol ediliyor…' : 'Giriş yap'}</button>
      {error && <p role="alert">{error}</p>}
    </form><p>Erişim kurtarma işlemi, sunucu yetkilisinin yerel kurtarma komutuyla yapılır.</p></main>;
}
