import { getContact } from '@/lib/contact';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { number, label, quoteLabel, message, greeting } = await getContact();
    return Response.json({ number, label, quoteLabel, message, greeting }, { headers: { 'Cache-Control': 'no-store' } });
  }
  catch { return Response.json({ error: 'İletişim bilgileri şu anda alınamıyor. Yeniden deneyin.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
