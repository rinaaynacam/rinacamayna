import { getPayload } from 'payload';
import config from '@payload-config';
import { canonical } from '@/lib/env.mjs';

export const dynamic = 'force-dynamic';

const text = (value: unknown) => String(value ?? '').replace(/[\r\n\[\]]+/g, ' ').trim();
const link = (label: unknown, path: string) => `- [${text(label)}](${canonical}${path})`;

export async function GET() {
  const payload = await getPayload({ config });
  const [site, services, guides] = await Promise.all([
    payload.findGlobal({ slug: 'site_ayarlari', depth: 0, overrideAccess: false }),
    payload.find({ collection: 'hizmetler', depth: 0, draft: false, limit: 100, sort: 'sira', overrideAccess: false }),
    payload.find({ collection: 'rehber_yazilari', depth: 0, draft: false, limit: 100, sort: '-updatedAt', overrideAccess: false }),
  ]);

  const body = [
    `# ${text(site.firma_adi)}`,
    '',
    `> ${text(site.kisa_aciklama)}`,
    '',
    'Ankara genelinde özel ölçü cam ve ayna uygulamaları hakkında hizmet, uygulama ve rehber bilgileri sunar. Kesin ölçü, malzeme, montaj, nakliye, termin ve uygunluk koşulları işletmeyle WhatsApp üzerinden netleştirilir.',
    '',
    '## Temel sayfalar',
    '',
    link('Ana sayfa', ''),
    link('Hizmetler', '/hizmetler'),
    link('Seçili işler ve uygulamalar', '/uygulamalar'),
    link('Bilgi merkezi', '/bilgi-merkezi'),
    link('Rehber yazıları', '/rehber'),
    link('Sık sorulan sorular', '/sss'),
    link('Hizmet bölgeleri', '/hizmet-bolgeleri'),
    link('Müşteri yorumları', '/yorumlar'),
    '',
    '## Hizmetler',
    '',
    ...services.docs
      .filter(service => service.seo?.indekslenebilir !== false)
      .map(service => link(service.ad, `/hizmetler/${service.slug}`)),
    '',
    '## Rehberler',
    '',
    ...guides.docs
      .filter(guide => guide.seo?.indekslenebilir !== false)
      .map(guide => link(guide.baslik, `/rehber/${guide.slug}`)),
    '',
    '## Teknik keşif',
    '',
    link('Sitemap', '/sitemap.xml'),
    link('Robots', '/robots.txt'),
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
