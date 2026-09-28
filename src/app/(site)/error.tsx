'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="icerik" className="error-page"><p className="eyebrow">RİNA CAM & AYNA</p><h1>Şu anda bağlantı kurulamıyor.</h1><p>Güncel site bilgileri alınamadı. Lütfen biraz sonra tekrar deneyin.</p><button className="button dark" onClick={reset}>Yeniden dene</button></main>;
}
