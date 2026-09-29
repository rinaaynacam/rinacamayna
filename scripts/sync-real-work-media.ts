import path from 'node:path';
import { access } from 'node:fs/promises';
import { getPayload } from 'payload';
import config from '../src/payload.config';

if (process.env.APP_ENV !== 'production') {
  throw new Error('Gerçek iş aktarımı yalnız açık production ortam dosyasıyla çalıştırılabilir.');
}

const workSpecs = [
  ['asimetrik-ayna-duvar-bolmesi.webp', 'Asimetrik ayna duvar bölmesi', 'AYNA / DUVAR UYGULAMASI'],
  ['dekoratif-duvar-aynasi.webp', 'Dekoratif duvar aynası', 'AYNA / DEKORATİF'],
  ['duvar-ayna-dekoru.webp', 'Duvar ayna dekoru', 'AYNA / DEKORATİF'],
  ['kisiye-ozel-ayna-dekor.webp', 'Kişiye özel ayna dekoru', 'AYNA / ÖZEL ÜRETİM'],
  ['toptan-ayna-satisi.webp', 'Toptan ayna uygulamaları', 'AYNA / ÜRÜN'],
  ['varakli-ayna-modelleri.webp', 'Varaklı ayna modeli', 'AYNA / DEKORATİF'],
  ['ayna-cerveveli-duvar-aynasi.webp', 'Ayna çerçeveli duvar aynası', 'AYNA / DUVAR UYGULAMASI'],
  ['ayna-dresuar-takimi.webp', 'Ayna ve dresuar takımı', 'AYNA / MOBİLYA'],
  ['ayna-isleme-model.webp', 'İşlemeli ayna modeli', 'AYNA / İŞLEME'],
  ['aynali-makyaj-masasi.webp', 'Aynalı makyaj masası', 'AYNA / MOBİLYA'],
  ['baklava-desen-duvar-aynasi.webp', 'Baklava desen duvar aynası', 'AYNA / DUVAR UYGULAMASI'],
  ['cam-ayna-dresuar.webp', 'Cam ve ayna dresuar', 'CAM VE AYNA / MOBİLYA'],
  ['cam-mutfak-tezgahi-arasi.webp', 'Cam mutfak tezgâh arası', 'CAM / MUTFAK'],
  ['dekoratif-ayna-modeli.webp', 'Dekoratif ayna modeli', 'AYNA / DEKORATİF'],
  ['duvar-ayna-tasarim.webp', 'Duvar ayna tasarımı', 'AYNA / DUVAR UYGULAMASI'],
  ['galeri-onizleme.jpg', 'Ayna uygulamaları galerisi', 'AYNA / GALERİ'],
  ['gumus-ayna-modelleri.webp', 'Gümüş ayna modeli', 'AYNA / DEKORATİF'],
  ['gunes-seklinde-duvar-aynasi.webp', 'Güneş şeklinde duvar aynası', 'AYNA / DEKORATİF'],
  ['yeni-model-aynalar.webp', 'Yeni model aynalar', 'AYNA / DEKORATİF'],
  ['yuvarlak-duvar-aynasi.webp', 'Yuvarlak duvar aynası', 'AYNA / DUVAR UYGULAMASI'],
] as const;

function rich(text: string) {
  return { root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [
    { type: 'paragraph', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [
      { type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text },
    ] },
  ] } };
}

const payload = await getPayload({ config });
let uploaded = 0;
let reused = 0;
let createdApplications = 0;
let updatedApplications = 0;
let deletedDuplicates = 0;

try {
  const services = await payload.find({
    collection: 'hizmetler',
    overrideAccess: true,
    draft: false,
    limit: 20,
    where: { slug: { in: ['ozel-olcu-ayna', 'dekoratif-cam'] } },
  });
  const serviceIds = services.docs.map((service) => service.id);
  if (!serviceIds.length) throw new Error('Canlı hizmet kayıtları bulunamadı; aktarım durduruldu.');

  const applicationIds: number[] = [];
  for (const [index, [filename, title, usage]] of workSpecs.entries()) {
    const filePath = path.resolve(process.cwd(), 'media-local', filename);
    await access(filePath);

    const slug = filename.replace(/\.(?:jpe?g|png|webp|avif)$/i, '');
    const applicationResult = await payload.find({
      collection: 'uygulamalar', overrideAccess: true, limit: 1, depth: 0,
      where: { slug: { equals: slug } },
    });
    const existingApplication = applicationResult.docs[0];
    const referencedMediaIds = new Set((existingApplication?.gorseller ?? [])
      .map((value) => typeof value === 'number' ? value : value.id));
    const mediaResult = await payload.find({
      collection: 'medyalar', overrideAccess: true, limit: 20,
      where: { alt: { equals: title } },
    });
    const existingMedia = mediaResult.docs.find((item) => referencedMediaIds.has(item.id)) ?? mediaResult.docs[0];
    const media = existingMedia
      ? await payload.update({
          collection: 'medyalar', id: existingMedia.id, overrideAccess: true,
          data: { alt: title, kaynak: 'Rina Cam & Ayna gerçek uygulama arşivi' },
        })
      : await payload.create({
          collection: 'medyalar', overrideAccess: true, filePath,
          data: { alt: title, kaynak: 'Rina Cam & Ayna gerçek uygulama arşivi' },
        });
    if (existingMedia) reused += 1;
    else uploaded += 1;

    const data = {
      ad: title,
      slug,
      kullanim: usage,
      ozet: `${title} uygulamasını gösteren gerçek çalışma fotoğrafı.`,
      aciklama: rich('Ölçü, malzeme, kenar ve montaj ayrıntıları uygulama alanına göre ayrıca değerlendirilir.'),
      gorseller: [media.id],
      hizmetler: serviceIds,
      sira: 100 + (index * 10),
      _status: 'published' as const,
      seo: {
        baslik: `${title} | Rina Cam & Ayna`,
        aciklama: `${title} gerçek uygulama görseli.`,
        indekslenebilir: false,
        paylasim_gorseli: media.id,
      },
    };
    const application = existingApplication
      ? await payload.update({ collection: 'uygulamalar', id: existingApplication.id, overrideAccess: true, draft: false, data })
      : await payload.create({ collection: 'uygulamalar', overrideAccess: true, draft: false, data });
    if (existingApplication) updatedApplications += 1;
    else createdApplications += 1;
    applicationIds.push(application.id);

    for (const duplicate of mediaResult.docs.filter((item) => item.id !== media.id)) {
      await payload.delete({ collection: 'medyalar', id: duplicate.id, overrideAccess: true });
      deletedDuplicates += 1;
    }
  }

  await payload.updateGlobal({
    slug: 'ana_sayfa_icerigi', overrideAccess: true, draft: false,
    // The editorial homepage layout deliberately accepts at most six cards.
    // The complete imported set remains available on /uygulamalar.
    data: { secili_uygulamalar: applicationIds.slice(0, 6), _status: 'published' },
  });

  console.log(JSON.stringify({ uploaded, reused, createdApplications, updatedApplications, deletedDuplicates, selectedApplications: Math.min(applicationIds.length, 6) }));
} finally {
  await payload.destroy();
}
process.exit(0);
