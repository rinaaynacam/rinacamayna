import path from 'node:path';
import type { CollectionSlug } from 'payload';
import { getPayload } from 'payload';
import config from '../src/payload.config';

const payload = await getPayload({ config });
const assetRoot = path.resolve(process.cwd(), 'public/design-reference');

function rich(text: string) {
  return { root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [
    { type: 'paragraph', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [
      { type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text },
    ] },
  ] } };
}

async function upsertSlug(collection: CollectionSlug, slug: string, previousSlug: string | null, data: Record<string, unknown>) {
  const slugs = previousSlug && previousSlug !== slug ? [slug, previousSlug] : [slug];
  const found = await payload.find({ collection, limit: 1, overrideAccess: true,
    where: { or: slugs.map(value => ({ slug: { equals: value } })) } } as never);
  const existing = found.docs[0] as { id: number } | undefined;
  if (existing) return payload.update({ collection, id: existing.id, overrideAccess: true, data: { ...data, slug } as never }) as Promise<{ id: number }>;
  return payload.create({ collection, overrideAccess: true, draft: false, data: { ...data, slug } as never }) as Promise<{ id: number }>;
}

async function upsertNamed(collection: CollectionSlug, field: string, value: string, data: Record<string, unknown>) {
  const found = await payload.find({ collection, limit: 1, overrideAccess: true, where: { [field]: { equals: value } } } as never);
  const existing = found.docs[0] as { id: number } | undefined;
  if (existing) return payload.update({ collection, id: existing.id, overrideAccess: true, data: { ...data, [field]: value } as never }) as Promise<{ id: number }>;
  return payload.create({ collection, overrideAccess: true, draft: false, data: { ...data, [field]: value } as never }) as Promise<{ id: number }>;
}

async function media(filename: string, alt: string) {
  const found = await payload.find({ collection: 'medyalar', limit: 1, overrideAccess: true, where: { filename: { equals: filename } } });
  if (found.docs[0]) return payload.update({ collection: 'medyalar', id: found.docs[0].id, overrideAccess: true, data: {
    alt, kaynak: 'Rina tasarım ve içerik paketi',
  } });
  return payload.create({ collection: 'medyalar', overrideAccess: true, filePath: path.join(assetRoot, filename), data: {
    alt, kaynak: 'Rina tasarım ve içerik paketi',
  } });
}

try {
  for (const [collection, field] of [['islem_secenekleri', 'ad'], ['sss', 'soru']] as const) {
    const stale = await payload.find({ collection, limit: 100, overrideAccess: true, where: { [field]: { contains: 'ÖRNEK' } } } as never);
    for (const item of stale.docs as Array<{ id: number }>) await payload.delete({ collection, id: item.id, overrideAccess: true });
  }
  const [mirror, partition, shower] = await Promise.all([
    media('mirror.webp', 'Duvar boyunca uygulanan geniş ayna ve yaşam alanı'),
    media('partition.jpg', 'Siyah profilli cam bölme kullanılan ofis alanı'),
    media('shower.webp', 'Şeffaf cam ve siyah bağlantı detaylı duş alanı'),
  ]);

  const optionSpecs = [
    ['Şeffaf cam', 'cam', 'Renksiz ve geçirgen görünüm istenen uygulamalar için değerlendirilir.'],
    ['Füme cam', 'renk', 'Koyu tonlu cam görünümü istenen dekoratif uygulamalar için değerlendirilir.'],
    ['Bronz cam', 'renk', 'Sıcak tonlu dekoratif görünüm istenen alanlarda değerlendirilir.'],
    ['Temperli cam', 'cam', 'Kullanım alanına ve ölçüye göre güvenlik gereksinimi bulunan uygulamalarda değerlendirilir.'],
    ['Rodajlı kenar', 'kenar', 'Açıkta kalan cam veya ayna kenarlarında düzgün bir bitiş için değerlendirilir.'],
    ['Bizoteli ayna', 'ayna', 'Ayna çevresinde kırımlı ve dekoratif kenar görünümü için değerlendirilir.'],
  ] as const;
  const options: Array<{ id: number }> = [];
  for (const [ad, tur, aciklama] of optionSpecs) options.push(await upsertNamed('islem_secenekleri', 'ad', ad, {
    tur, sunum_durumu: 'sunuluyor', aciklama, sira: options.length * 10 + 10, _status: 'published',
  }));

  const faqSpecs = [
    ['Ölçüleri kesin bilmem gerekir mi?', 'Hayır. Bildiğiniz yaklaşık ölçüyü ve alan fotoğrafını paylaşmanız ilk görüşme için yeterlidir. Kesin ölçü ve uygulama koşulları görüşmede netleştirilir.'],
    ['Fotoğrafı siteye mi yüklemeliyim?', 'Hayır. Site dosya yüklemez. WhatsApp sohbeti açıldıktan sonra fotoğrafı konuşmaya siz eklersiniz.'],
    ['Ankara’nın hangi ilçelerinde iletişime geçebilirim?', 'Ankara’nın 25 ilçesinden talep iletebilirsiniz. Yerinde çalışma, montaj ve nakliye koşulları hizmete ve konuma göre ayrıca konuşulur.'],
    ['Fiyat nasıl belirlenir?', 'Fiyat; ölçü, cam veya ayna türü, kalınlık, kenar işlemi, bağlantı ve uygulama koşullarına göre netleştirilir.'],
    ['Montaj ve teslim süresi nedir?', 'Süre; ürün, ölçü, işlem ve saha koşullarına göre değişir. Kesin tarih ancak ayrıntılar netleştikten sonra paylaşılır.'],
  ] as const;
  const faqs: Array<{ id: number }> = [];
  for (const [soru, yanit] of faqSpecs) faqs.push(await upsertNamed('sss', 'soru', soru, { yanit, sira: faqs.length * 10 + 10, _status: 'published' }));

  const serviceSpecs = [
    { slug: 'ozel-olcu-ayna', old: 'ornek-ozel-olcu-ayna', ad: 'Özel ölçü ayna', image: mirror.id, ozet: 'Duvar, banyo, antre, salon, mağaza ve mobilya için ölçüye göre ayna çözümleri.', detail: 'Ayna ölçüsü, kenar bitişi, formu, taşıyıcı yüzeyi ve montaj yöntemi kullanım alanına göre belirlenir.' },
    { slug: 'ofis-cam-bolme', old: null, ad: 'Ofis cam bölme', image: partition.id, ozet: 'Ofis ve ticari alanlarda ışığı koruyan şeffaf, füme veya satina cam bölme çözümleri.', detail: 'Profil, cam türü, kapı ihtiyacı, bağlantı ve saha uygulaması mekânın ölçüsüne ve kullanımına göre netleştirilir.' },
    { slug: 'dus-cami', old: null, ad: 'Duş camı', image: shower.id, ozet: 'Sabit panel, köşe çözümü ve özel ölçü duş alanları için cam uygulamaları.', detail: 'Cam kalınlığı, kapı açılımı, bağlantı elemanları ve su yönü banyo ölçülerine göre değerlendirilir.' },
    { slug: 'cam-korkuluk', old: null, ad: 'Cam korkuluk', image: partition.id, ozet: 'Merdiven, balkon ve galeri boşlukları için projeye göre cam korkuluk çözümleri.', detail: 'Taşıyıcı sistem, cam yapısı, bağlantı detayları ve saha uygunluğu proje özelinde değerlendirilir.' },
    { slug: 'dekoratif-cam', old: null, ad: 'Dekoratif cam', image: mirror.id, ozet: 'Füme, bronz, renkli, kumlu ve mobilya ile tezgâh arası uygulamalara yönelik cam çözümleri.', detail: 'Renk, yüzey, kenar işlemi, delik ve kesim ayrıntıları kullanım yerine göre birlikte seçilir.' },
  ];
  const services: Array<{ id: number }> = [];
  for (const spec of serviceSpecs) services.push(await upsertSlug('hizmetler', spec.slug, spec.old, {
    ad: spec.ad, ozet: spec.ozet, aciklama: rich(spec.detail), kapak_gorseli: spec.image,
    islem_secenekleri: options.map(item => item.id), sss: faqs.map(item => item.id),
    whatsapp_mesaji: `Merhaba, ${spec.ad.toLocaleLowerCase('tr-TR')} hakkında bilgi almak istiyorum.`,
    sira: services.length * 10 + 10, _status: 'published',
    seo: { baslik: `${spec.ad} | Rina Cam & Ayna Ankara`, aciklama: spec.ozet, indekslenebilir: true, paylasim_gorseli: spec.image },
  }));

  const usageSpecs = [
    { slug: 'ev-ve-yasam-alanlari', old: 'ornek-ev-ve-yasam-alani', ad: 'Ev ve yaşam alanları', image: mirror.id, serviceIds: [services[0].id, services[2].id, services[4].id], ozet: 'Salon, antre, yatak odası ve diğer yaşam alanları için ayna ve cam uygulamaları.' },
    { slug: 'ofis-ve-ticari-alanlar', old: null, ad: 'Ofis ve ticari alanlar', image: partition.id, serviceIds: [services[1].id, services[4].id], ozet: 'Ofis, mağaza ve ticari mekânlarda bölme, yüzey ve dekoratif cam uygulamaları.' },
    { slug: 'banyo', old: null, ad: 'Banyo', image: shower.id, serviceIds: [services[0].id, services[2].id], ozet: 'Banyo aynası, sabit duş paneli ve özel ölçü cam çözümleri.' },
    { slug: 'mobilya-ve-dekorasyon', old: null, ad: 'Mobilya ve dekorasyon', image: mirror.id, serviceIds: [services[0].id, services[4].id], ozet: 'Mobilya, raf, masa, vitrin ve dekoratif yüzeyler için cam ve ayna parçaları.' },
  ];
  const usageAreas: Array<{ id: number }> = [];
  for (const spec of usageSpecs) usageAreas.push(await upsertSlug('kullanim_alanlari', spec.slug, spec.old, {
    ad: spec.ad, ozet: spec.ozet, icerik: rich('Uygun cam veya ayna türü; ölçü, kullanım, yüzey ve bağlantı koşulları birlikte değerlendirilerek seçilir.'),
    kapak_gorseli: spec.image, hizmetler: spec.serviceIds, sira: usageAreas.length * 10 + 10, _status: 'published',
    seo: { baslik: `${spec.ad} için cam ve ayna | Rina`, aciklama: spec.ozet, indekslenebilir: true, paylasim_gorseli: spec.image },
  }));
  for (let index = 0; index < services.length; index += 1) {
    const related = usageSpecs.map((item, usageIndex) => item.serviceIds.includes(services[index].id) ? usageAreas[usageIndex].id : null).filter((id): id is number => id !== null);
    await payload.update({ collection: 'hizmetler', id: services[index].id, overrideAccess: true, data: { kullanim_alanlari: related } });
  }
  for (const faq of faqs) await payload.update({ collection: 'sss', id: faq.id, overrideAccess: true, data: { hizmetler: services.map(item => item.id) } });

  const applications = [
    await upsertSlug('uygulamalar', 'ofis-cam-bolme-tasarimi', 'ornek-ofis-cam-bolme', {
      ad: 'Mekânı bölmeden alanı tanımlayan cam', kullanim: 'OFİS / CAM BÖLME',
      ozet: 'Siyah profilli cam bölmenin ışık ve görüş ilişkisini gösteren tasarım görseli.',
      malzeme: 'Şeffaf cam ve siyah profil görünümü', islem: 'Ölçü ve bağlantı detayı projeye göre belirlenir',
      aciklama: rich('Bu görsel uygulama yaklaşımını anlatır. Rina tarafından tamamlanmış proje kaydı olarak sunulmaz.'),
      gorseller: [partition.id], hizmetler: [services[1].id], sira: 10, _status: 'published',
      seo: { baslik: 'Ofis cam bölme tasarım yaklaşımı', aciklama: 'Cam bölme tasarım görseli.', indekslenebilir: false, paylasim_gorseli: partition.id },
    }),
    await upsertSlug('uygulamalar', 'dus-cami-tasarimi', 'ornek-cam-dus-alani', {
      ad: 'Fazlalıksız, net bir çözüm', kullanim: 'BANYO / ÖZEL ÖLÇÜ',
      ozet: 'Şeffaf cam ve siyah bağlantı detaylarının banyo içindeki görünümünü gösteren tasarım görseli.',
      malzeme: 'Şeffaf cam ve siyah bağlantı görünümü', islem: 'Ölçü ve bağlantı detayı alana göre belirlenir',
      aciklama: rich('Bu görsel uygulama yaklaşımını anlatır. Rina tarafından tamamlanmış proje kaydı olarak sunulmaz.'),
      gorseller: [shower.id], hizmetler: [services[2].id], sira: 20, _status: 'published',
      seo: { baslik: 'Duş camı tasarım yaklaşımı', aciklama: 'Özel ölçü duş camı tasarım görseli.', indekslenebilir: false, paylasim_gorseli: shower.id },
    }),
  ];

  const uploadedApplicationSpecs = [
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
  const uploadedMedia = await payload.find({ collection: 'medyalar', limit: 100, overrideAccess: true });
  const mediaByFilename = new Map(uploadedMedia.docs.map(item => [item.filename, item]));
  for (const [index, [filename, ad, kullanim]] of uploadedApplicationSpecs.entries()) {
    const image = mediaByFilename.get(filename);
    if (!image) continue;
    await payload.update({ collection: 'medyalar', id: image.id, overrideAccess: true, data: { alt: ad } });
    await upsertSlug('uygulamalar', filename.replace(/\.(?:jpe?g|png|webp|avif)$/i, ''), null, {
      ad,
      kullanim,
      ozet: `${ad} görünümünü gösteren uygulama fotoğrafı.`,
      aciklama: rich('Ölçü, malzeme, kenar ve montaj ayrıntıları uygulama alanına göre ayrıca değerlendirilir.'),
      gorseller: [image.id],
      hizmetler: filename.includes('cam-') ? [services[4].id] : [services[0].id, services[4].id],
      sira: 100 + (index * 10),
      _status: 'published',
      seo: { baslik: `${ad} | Rina Cam & Ayna`, aciklama: `${ad} uygulama görseli.`, indekslenebilir: false, paylasim_gorseli: image.id },
    });
  }

  const guideSpecs = [
    ['cam-ve-ayna-olcusu-nasil-alinir', 'ornek-cam-secimi-rehberi', 'Cam ve ayna için ilk ölçü nasıl paylaşılır?', 'İlk görüşmede yaklaşık ölçü, alan fotoğrafı ve kullanım amacının nasıl paylaşılacağını öğrenin.', mirror.id],
    ['dus-cami-secerken-nelere-bakilir', null, 'Duş camı seçerken nelere bakılır?', 'Alan ölçüsü, kapı açılımı, cam ve bağlantı ayrıntılarının neden birlikte değerlendirilmesi gerektiğini inceleyin.', shower.id],
    ['ofis-cam-bolme-planlama', null, 'Ofis cam bölme planlarken temel başlıklar', 'Mekân akışı, kapı, profil, cam görünümü ve uygulama alanı hakkında ilk planlama notları.', partition.id],
  ] as const;
  for (const [slug, old, baslik, ozet, image] of guideSpecs) await upsertSlug('rehber_yazilari', slug, old, {
    baslik, ozet, icerik: rich(`${ozet} Kesin ürün ve uygulama kararı, ölçü ve saha koşulları görüldükten sonra verilir.`),
    kapak_gorseli: image, kontrol_eden: 'Rina Cam & Ayna', _status: 'published',
    seo: { baslik, aciklama: ozet, indekslenebilir: true, paylasim_gorseli: image },
  });

  await upsertSlug('sayfalar', 'hakkimizda', 'ornek-kurumsal-bilgi', {
    baslik: 'Rina Cam & Ayna', ozet: 'Ankara’da ev, ofis, mağaza, banyo, mobilya ve proje ihtiyaçları için cam ve ayna çözümleri.',
    icerik: rich('Her uygulamada ölçü, malzeme, kenar, bağlantı ve montaj koşulları kullanım alanına göre ele alınır. İlk görüşme WhatsApp üzerinden yapılır; kullanıcı fotoğrafı sohbet içinde paylaşır.'),
    _status: 'published', seo: { baslik: 'Rina Cam & Ayna Hakkında', aciklama: 'Rina Cam & Ayna çalışma yaklaşımı ve iletişim bilgileri.', indekslenebilir: true, paylasim_gorseli: mirror.id },
  });

  for (const [collection, where] of [
    ['yorumlar', { gostergelik_ad: { equals: 'ÖRNEK YORUM YERLEŞİMİ' } }],
    ['yonlendirmeler', { kaynak: { equals: '/eski-ornek-sayfa' } }],
    ['denetim_kaydi', { islem: { equals: 'ornek_seed_olusturuldu' } }],
  ] as const) {
    const found = await payload.find({ collection, limit: 20, overrideAccess: true, where } as never);
    for (const item of found.docs as Array<{ id: number }>) await payload.delete({ collection, id: item.id, overrideAccess: true });
  }
  const document = (await payload.find({ collection: 'dosyalar', limit: 1, overrideAccess: true, where: { filename: { equals: 'cms-ornek-belge.pdf' } } })).docs[0];
  if (document) await payload.delete({ collection: 'dosyalar', id: document.id, overrideAccess: true });

  await payload.updateGlobal({ slug: 'ana_sayfa_icerigi', overrideAccess: true, data: {
    hero_gorseli: mirror.id, hero_gorsel_etiketi: 'Özel ölçü · İç mekân',
    secili_hizmetler: services.map(item => item.id), secili_uygulamalar: applications.map(item => item.id),
    hizmetler_aciklama: 'Cam ve ayna ihtiyacınızı kullanım alanına göre inceleyin; ayrıntıları görüşmede netleştirelim.',
    uygulamalar_etiket: '03 / UYGULAMA FİKİRLERİ',
    uygulamalar_aciklama: 'Malzeme ve yerleşim yaklaşımını gösteren tasarım görselleri.',
    bolge_gorunsun: false,
  } });
  await payload.updateGlobal({ slug: 'ust_bilgi', overrideAccess: true, data: { cta_gorunsun: true, menu_ogeleri: [
    { etiket: 'UYGULAMALAR', baglanti: '#uygulamalar' }, { etiket: 'SEÇİLİ İŞLER', baglanti: '/uygulamalar' },
    { etiket: 'SÜREÇ', baglanti: '#surec' }, { etiket: 'İLETİŞİM', baglanti: '#teklif' },
  ] } });
  await payload.updateGlobal({ slug: 'alt_bilgi', overrideAccess: true, data: {
    linkler: [
      { etiket: 'Hizmetler', baglanti: '/hizmetler' },
      { etiket: 'Uygulamalar', baglanti: '/uygulamalar' },
      { etiket: 'Rehber yazıları', baglanti: '/rehber' },
      { etiket: 'Sık sorulan sorular', baglanti: '/sss' },
      { etiket: 'Müşteri yorumları', baglanti: '/yorumlar' },
      { etiket: 'Bilgi merkezi', baglanti: '/bilgi-merkezi' },
      { etiket: 'Hizmet bölgeleri', baglanti: '/hizmet-bolgeleri' },
    ],
  } });
  const integrations = await payload.findGlobal({ slug: 'entegrasyon_ayarlari', overrideAccess: true });
  await payload.updateGlobal({ slug: 'entegrasyon_ayarlari', overrideAccess: true, data: {
    search_console_dogrulama: integrations.search_console_dogrulama?.startsWith('ÖRNEK') ? null : integrations.search_console_dogrulama,
    analytics_aktif: integrations.analytics_aktif && !integrations.analytics_kimligi?.startsWith('ÖRNEK'),
    analytics_kimligi: integrations.analytics_kimligi?.startsWith('ÖRNEK') ? null : integrations.analytics_kimligi,
  } });
  const contact = await payload.findGlobal({ slug: 'iletisim_bilgileri', overrideAccess: true });
  await payload.updateGlobal({ slug: 'iletisim_bilgileri', overrideAccess: true, data: {
    adres: contact.adres?.startsWith('ÖRNEK') ? null : contact.adres,
    calisma_saatleri: contact.calisma_saatleri?.startsWith('ÖRNEK') ? null : contact.calisma_saatleri,
    dahili_not: contact.dahili_not?.startsWith('Örnek') ? null : contact.dahili_not,
  } });
  const district = (await payload.find({ collection: 'hizmet_bolgeleri', limit: 1, overrideAccess: true, where: { ad: { equals: 'Çankaya' } } })).docs[0];
  if (district?.operasyon_teyidi?.startsWith('ÖRNEK')) await payload.update({ collection: 'hizmet_bolgeleri', id: district.id, overrideAccess: true, data: {
    operasyon_teyidi: null,
  } });

  console.log('Rina hizmetleri ve site içerikleri oluşturuldu; örnek etiketli kayıtlar temizlendi.');
} finally {
  await payload.destroy();
}
process.exit(0);
