import { getPayload } from 'payload';
import config from '@payload-config';
import { normalizeTrWhatsAppNumber } from '../../baslangic-modulleri/whatsapp.mjs';
export async function getContact() {
  const payload = await getPayload({ config });
  const data = await payload.findGlobal({ slug: 'iletisim_bilgileri', depth: 0, overrideAccess: false });
  return { number: normalizeTrWhatsAppNumber(data.whatsapp_numarasi), label: data.cta_etiketi,
    quoteLabel: data.teklif_etiketi, message: data.genel_mesaj, greeting: data.teklif_girisi,
    address: data.adres || null,
    hours: data.calisma_saatleri || null };
}
export type Contact = Awaited<ReturnType<typeof getContact>>;
