import { getPayload } from 'payload';
import config from '@payload-config';
import { readEnvironment } from '@/lib/env.mjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const env = readEnvironment();
  const origin = request.headers.get('origin');
  if (origin !== env.siteURL) return Response.json({ error: 'Geçersiz istek kaynağı.' }, { status: 403 });
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 8_000) return Response.json({ error: 'İstek çok büyük.' }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 8_000) return Response.json({ error: 'İstek çok büyük.' }, { status: 413 });
    body = JSON.parse(raw) as Record<string, unknown>;
  }
  catch { return Response.json({ error: 'Geçersiz veri.' }, { status: 400 }); }
  if (body.website) return Response.json({ ok: true }, { status: 201 });

  const name = typeof body.ad === 'string' ? body.ad.trim() : '';
  const comment = typeof body.yorum === 'string' ? body.yorum.trim() : '';
  const rating = Number(body.puan);
  if (name.length < 2 || name.length > 80 || comment.length < 10 || comment.length > 1000
    || !Number.isInteger(rating) || rating < 1 || rating > 5 || body.izin !== true) {
    return Response.json({ error: 'Alanları kontrol edin.' }, { status: 400 });
  }

  const payload = await getPayload({ config });
  await payload.create({
    collection: 'yorumlar', overrideAccess: true, draft: true,
    data: {
      gostergelik_ad: name,
      yorum: comment,
      puan: rating,
      kaynak: 'Web sitesi',
      sitede_goster: false,
      sira: 100,
      _status: 'draft',
    },
  });
  return Response.json({ ok: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
