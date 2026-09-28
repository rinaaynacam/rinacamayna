import { getPayload } from 'payload';
import config from '../src/payload.config';
import initial from '../baslangic-modulleri/rina-initial.json';
const payload = await getPayload({ config });
try {
  // Privileged Local API is deliberate here: private operator CLI, never an HTTP handler.
  const contact = await payload.findGlobal({ slug: 'iletisim_bilgileri', overrideAccess: true });
  if (!contact.whatsapp_numarasi) await payload.updateGlobal({ slug: 'iletisim_bilgileri', overrideAccess: true, data: {
    whatsapp_numarasi: initial.contact.whatsappNumber, cta_etiketi: initial.contact.primaryCta,
    teklif_etiketi: initial.contact.quoteCta, genel_mesaj: initial.contact.generalMessage,
    teklif_girisi: initial.contact.quoteGreeting,
  } });
  const site = await payload.findGlobal({ slug: 'site_ayarlari', overrideAccess: true });
  if (!site.firma_adi) await payload.updateGlobal({ slug: 'site_ayarlari', overrideAccess: true, data: {
    firma_adi: initial.site.brandName,
    marka_kisa: 'RINA',
    marka_alt: 'CAM / AYNA · ANKARA',
    kisa_aciklama: initial.site.primaryAudience,
    seo: { baslik: initial.homepageDraft.seoTitle, aciklama: 'Ankara merkezi ve tüm ilçelerinde ev, iş yeri ve projeler için cam ve ayna ihtiyaçlarınızı WhatsApp üzerinden Rina ile görüşün.', indekslenebilir: true },
  } });
  const home = await payload.findGlobal({ slug: 'ana_sayfa_icerigi', overrideAccess: true });
  if (!home.hero_baslik_1) await payload.updateGlobal({ slug: 'ana_sayfa_icerigi', overrideAccess: true, data: {
    hero_etiket: 'ANKARA · CAM & AYNA',
    hero_baslik_1: 'MEKÂNI',
    hero_vurgu: 'YANSITAN',
    hero_baslik_2: 'İŞÇİLİK.',
    hero_aciklama: initial.homepageDraft.description,
    hero_cta_etiketi: 'İHTİYACINIZI ANLATIN',
    yaklasim_gorunsun: true,
    yaklasim_sira: '01',
    yaklasim_baslik: 'Standart bir ihtiyaç yok.',
    yaklasim_vurgu: 'Detayları birlikte netleştiriyoruz.',
    yaklasim_aciklama: 'Ev, iş yeri, dekorasyon, proje ve mobilya ihtiyaçları için ölçü, malzeme ve uygulama koşulları görüşmede belirlenir.',
    hizmetler_gorunsun: true,
    hizmetler_etiket: '02 / UYGULAMALAR',
    hizmetler_baslik: 'NEYE İHTİYACINIZ VAR?',
    hizmetler_aciklama: 'Yalnız işletme tarafından doğrulanmış ve yayınlanmış hizmetler burada görünür.',
    uygulamalar_gorunsun: true,
    uygulamalar_etiket: '03 / SEÇİLİ İŞLER',
    uygulamalar_baslik: 'MALZEME KONUŞSUN.',
    uygulamalar_aciklama: 'Yalnız yayın izni bulunan gerçek Rina uygulamaları burada görünür.',
    surec_gorunsun: true,
    surec_etiket: '04 / SÜREÇ',
    surec_baslik: 'ÜÇ ADIM. TEK GÖRÜŞME AKIŞI.',
    surec_cta_etiketi: 'WhatsApp’tan başlayın',
    surec_adimlari: [
      { baslik: 'İhtiyacınızı paylaşın', aciklama: 'Uygulama alanını, varsa fotoğrafı, ilçenizi ve bildiğiniz ölçüleri WhatsApp sohbetinde paylaşın.' },
      { baslik: 'Detayları netleştirin', aciklama: 'Cam veya ayna türü, ölçü ve diğer seçenekleri işletmeyle görüşün.' },
      { baslik: 'Koşulları konuşun', aciklama: 'Uygunluk, fiyat, yerinde çalışma ve teslim koşullarını teyit edin.' },
    ],
    bolge_gorunsun: true,
    bolge_etiket: 'ANKARA GENELİNDE İLETİŞİM',
    bolge_baslik: 'Bulunduğunuz yerden başlayalım.',
    bolge_aciklama: initial.targetArea.fulfillmentPolicy,
    teklif_etiket: '05 / TEKLİF',
    teklif_baslik: 'BİR MESAJLA BAŞLAYALIM.',
    teklif_aciklama: 'Firma adı, ilçe ve kesin ölçü zorunlu değildir. Bildiğiniz detaylarla mesajınızı hazırlayın.',
  } });
  const header = await payload.findGlobal({ slug: 'ust_bilgi', overrideAccess: true });
  if (!header.menu_ogeleri?.length) await payload.updateGlobal({ slug: 'ust_bilgi', overrideAccess: true, data: {
    cta_gorunsun: true,
    menu_ogeleri: [
      { etiket: 'YAKLAŞIM', baglanti: '#yaklasim' },
      { etiket: 'SÜREÇ', baglanti: '#surec' },
      { etiket: 'ANKARA', baglanti: '#bolgeler' },
      { etiket: 'TEKLİF', baglanti: '#teklif' },
    ],
  } });
  const footer = await payload.findGlobal({ slug: 'alt_bilgi', overrideAccess: true });
  if (!footer.metin) await payload.updateGlobal({ slug: 'alt_bilgi', overrideAccess: true, data: {
    metin: 'Ankara merkezi ve tüm ilçelerinde cam ve ayna ihtiyacı için WhatsApp üzerinden iletişim.',
    linkler: [],
  } });
  for (const [sira, ad] of initial.targetArea.districts.entries()) {
    const found = await payload.find({ collection: 'hizmet_bolgeleri', where: { ad: { equals: ad } }, limit: 1, overrideAccess: true });
    if (!found.docs.length) await payload.create({ collection: 'hizmet_bolgeleri', overrideAccess: true, data: { ad, sira, hedef_kapsam: true } });
  }
  console.log('Eksik Rina marka, ana sayfa, iletişim ve ilçe kayıtları oluşturuldu. Mevcut kayıtlar korundu; örnek hizmet, proje veya görsel eklenmedi.');
} finally { await payload.destroy(); }
process.exit(0);
