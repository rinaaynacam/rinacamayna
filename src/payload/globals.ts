import { revalidatePath } from 'next/cache';
import type { GlobalAfterChangeHook, GlobalBeforeChangeHook, GlobalConfig } from 'payload';
import { adminField, adminOnly, signedIn, staffField } from '@/lib/access';
import { menuArray, seoFields } from './fields';
import { normalizeTrWhatsAppNumber } from '../../baslangic-modulleri/whatsapp.mjs';

const refreshPublicSite: GlobalAfterChangeHook = ({ doc }) => {
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    // Payload CLI seed/migration does not have a Next request store.
    if (!(error instanceof Error) || !error.message.includes('static generation store missing')) throw error;
  }
  return doc;
};

const editorCannotPublishGlobal: GlobalBeforeChangeHook = ({ data, req }) => {
  if (!req.user || req.user.role === 'admin') return data;
  const isDraft = data?._status === 'draft' || (req.url && new URL(req.url).searchParams.get('draft') === 'true');
  if (!isDraft) {
    throw new Error('Yalnız yöneticiler ana sayfa değişikliklerini yayınlayabilir.');
  }
  return { ...data, _status: 'draft' };
};

const publishedGlobalRead: NonNullable<GlobalConfig['access']>['read'] = ({ req }) => {
  if (req.user) return true;
  if (!req.url) return true;
  const draft = new URL(req.url).searchParams.get('draft');
  return draft === null || draft === 'false';
};

export const SiteAyarlari: GlobalConfig = {
  slug: 'site_ayarlari', label: 'Site ayarları',
  admin: { group: 'Genel ayarlar', description: 'Marka kimliği ve varsayılan SEO bilgileri.' },
  access: { read: () => true, update: adminOnly }, hooks: { afterChange: [refreshPublicSite] },
  fields: [
    { name: 'firma_adi', label: 'Firma adı', type: 'text', required: true,
      admin: { description: 'Sayfa başlığı, erişilebilir logo etiketi ve varsayılan SEO kimliğinde kullanılır.' } },
    { name: 'marka_kisa', label: 'Logoda görünen kısa ad', type: 'text', required: true, maxLength: 12,
      admin: { description: 'Logo görseli seçilmemişse üst ve alt bilgide büyük marka yazısı olarak görünür. Örnek: RINA.' } },
    { name: 'marka_alt', label: 'Logo yan metni', type: 'text', maxLength: 40,
      admin: { description: 'Üst ve alt bilgide marka adının veya yüklenen logonun yanında küçük satırlar halinde görünür.' } },
    { name: 'kisa_aciklama', label: 'Kısa firma açıklaması', type: 'textarea', required: true, maxLength: 300,
      admin: { description: 'Özel SEO açıklaması boş olduğunda ana sayfanın varsayılan meta açıklaması olur; sayfa gövdesinde otomatik görünmez.' } },
    { name: 'logo', label: 'Üst ve alt bilgi logosu', type: 'upload', relationTo: 'medyalar',
      admin: { description: 'Seçildiğinde sitenin sol üst ve alt bölümündeki kısa marka yazısının yerini alır. Sistem küçük ekranlar için optimize edilmiş türevi kullanır; en iyi sonuç için şeffaf WebP veya PNG yükleyin.' } },
    { name: 'favicon', label: 'Tarayıcı sekmesi simgesi', type: 'upload', relationTo: 'medyalar',
      admin: { description: 'Tarayıcı sekmesi ve yer imlerinde görünür. En fazla 100 KB kullanın; daha büyük dosyada hızlı varsayılan Rina simgesi gösterilir.' } },
    { name: 'renkler', label: 'Site renkleri', type: 'group',
      admin: { description: 'Sitenin genel zemin, yazı, vurgu, çizgi ve form renklerini altı haneli HEX kodlarıyla yönetin. Örnek: #ff6254.' },
      fields: [
        { name: 'zemin', label: 'Ana zemin rengi', type: 'text', required: true, defaultValue: '#e9eef1',
          validate: (value: string | null | undefined) => /^#[0-9a-fA-F]{6}$/.test(value ?? '') || 'Rengi #e9eef1 biçiminde girin.',
          admin: { description: 'Sayfaların açık renkli ana arka planı.' } },
        { name: 'metin', label: 'Ana metin ve koyu alan rengi', type: 'text', required: true, defaultValue: '#172126',
          validate: (value: string | null | undefined) => /^#[0-9a-fA-F]{6}$/.test(value ?? '') || 'Rengi #172126 biçiminde girin.',
          admin: { description: 'Başlıklar, metinler, çerçeveler ve koyu bölümlerin zemini.' } },
        { name: 'vurgu', label: 'Vurgu ve düğme rengi', type: 'text', required: true, defaultValue: '#ff6254',
          validate: (value: string | null | undefined) => /^#[0-9a-fA-F]{6}$/.test(value ?? '') || 'Rengi #ff6254 biçiminde girin.',
          admin: { description: 'Mercan renkli başlıklar, çizgiler ve ana düğmeler.' } },
        { name: 'cizgi', label: 'İkincil çizgi rengi', type: 'text', required: true, defaultValue: '#8d9da5',
          validate: (value: string | null | undefined) => /^#[0-9a-fA-F]{6}$/.test(value ?? '') || 'Rengi #8d9da5 biçiminde girin.',
          admin: { description: 'Kartları ve liste satırlarını ayıran hafif çizgiler.' } },
        { name: 'form_zemini', label: 'Form zemin rengi', type: 'text', required: true, defaultValue: '#d9e4e9',
          validate: (value: string | null | undefined) => /^#[0-9a-fA-F]{6}$/.test(value ?? '') || 'Rengi #d9e4e9 biçiminde girin.',
          admin: { description: 'Ana sayfadaki teklif formunun açık renkli arka planı.' } },
        { name: 'acik_metin', label: 'Koyu alandaki açık metin rengi', type: 'text', required: true, defaultValue: '#f7fafb',
          validate: (value: string | null | undefined) => /^#[0-9a-fA-F]{6}$/.test(value ?? '') || 'Rengi #f7fafb biçiminde girin.',
          admin: { description: 'Koyu zeminlerde kullanılan başlık ve metin rengi.' } },
      ] },
    seoFields(),
  ],
};

export const AnaSayfaIcerigi: GlobalConfig = {
  slug: 'ana_sayfa_icerigi', label: 'Ana sayfa içeriği',
  admin: { group: 'Genel ayarlar', description: 'Rina ana sayfasının bütün metinlerini, görsellerini ve seçili kayıtlarını buradan yönetin.' },
  access: { read: publishedGlobalRead, update: signedIn },
  versions: { drafts: { autosave: true, schedulePublish: false, validate: true }, max: 20 },
  hooks: { beforeChange: [editorCannotPublishGlobal], afterChange: [refreshPublicSite] },
  fields: [
    { type: 'tabs', tabs: [
      { label: 'Giriş', fields: [
        { name: 'hero_etiket', label: 'Giriş üst etiketi', type: 'text', maxLength: 80,
          admin: { description: 'Ana sayfanın ilk ekranında, büyük başlığın üstündeki küçük ve harf aralıklı satırı değiştirir.' } },
        { name: 'hero_baslik_1', label: 'Giriş başlığı – ilk satır', type: 'text', maxLength: 80,
          admin: { description: 'İlk ekrandaki büyük siyah başlığın birinci satırı.' } },
        { name: 'hero_vurgu', label: 'Giriş başlığı – çizgili satır', type: 'text', maxLength: 80,
          admin: { description: 'İlk ekrandaki içi boş, konturlu büyük başlık satırını değiştirir.' } },
        { name: 'hero_baslik_2', label: 'Giriş başlığı – son satır', type: 'text', maxLength: 80,
          admin: { description: 'İlk ekrandaki büyük siyah başlığın son satırı.' } },
        { name: 'hero_aciklama', label: 'Giriş açıklaması', type: 'textarea', maxLength: 400,
          admin: { description: 'Büyük başlığın altında, WhatsApp düğmesinin üstünde görünen kısa açıklamayı değiştirir.' } },
        { name: 'hero_gorseli', label: 'Giriş sağ panel görseli', type: 'upload', relationTo: 'medyalar',
          admin: { description: 'Ana sayfanın ilk ekranında sağdaki büyük görsel alanını değiştirir. Boş bırakılırsa dekoratif ayna çizimi görünür.' } },
        { name: 'hero_gorsel_etiketi', label: 'Giriş görseli alt etiketi', type: 'text', maxLength: 80,
          admin: { description: 'Sağdaki giriş görselinin alt şeridinde, sağ tarafta görünen kısa bilgiyi değiştirir.' } },
        { name: 'hero_cta_etiketi', label: 'Giriş WhatsApp düğmesi yazısı', type: 'text', maxLength: 50,
          admin: { description: 'İlk ekrandaki mercan renkli ana WhatsApp düğmesinde görünen yazıyı değiştirir.' } },
      ] },
      { label: 'Yaklaşım', fields: [
        { name: 'yaklasim_gorunsun', label: 'Yaklaşım bölümü görünsün', type: 'checkbox', defaultValue: true,
          admin: { description: 'Kapalıysa ana sayfadaki büyük “Standart bir ihtiyaç yok” anlatım bölümü tamamen gizlenir.' } },
        { name: 'yaklasim_sira', label: 'Yaklaşım bölüm numarası', type: 'text', maxLength: 8,
          admin: { description: 'Bölümün sol üstünde küçük numara olarak görünür. Örnek: 01.' } },
        { name: 'yaklasim_baslik', label: 'Yaklaşım koyu başlığı', type: 'textarea', maxLength: 180,
          admin: { description: 'Yaklaşım bölümündeki büyük siyah metni değiştirir.' } },
        { name: 'yaklasim_vurgu', label: 'Yaklaşım mercan vurgusu', type: 'textarea', maxLength: 180,
          admin: { description: 'Büyük siyah metnin hemen altındaki mercan renkli büyük metni değiştirir.' } },
        { name: 'yaklasim_aciklama', label: 'Yaklaşım yan açıklaması', type: 'textarea', maxLength: 350,
          admin: { description: 'Yaklaşım bölümünün sağ sütunundaki destekleyici paragrafı değiştirir.' } },
      ] },
      { label: 'Hizmetler', fields: [
        { name: 'hizmetler_gorunsun', label: 'Hizmetler bölümü görünsün', type: 'checkbox', defaultValue: true,
          admin: { description: 'Kapalıysa ana sayfadaki hizmet liste satırları gizlenir. Seçili yayınlanmış hizmet yoksa bölüm zaten gösterilmez.' } },
        { name: 'hizmetler_etiket', label: 'Hizmetler küçük etiketi', type: 'text', maxLength: 60,
          admin: { description: 'Hizmetler bölüm başlığının üstündeki küçük satırı değiştirir.' } },
        { name: 'hizmetler_baslik', label: 'Hizmetler büyük başlığı', type: 'text', maxLength: 100,
          admin: { description: 'Hizmet liste satırlarının üstündeki büyük “Ne yapıyoruz?” başlığını değiştirir.' } },
        { name: 'hizmetler_aciklama', label: 'Hizmetler yan açıklaması', type: 'textarea', maxLength: 300,
          admin: { description: 'Hizmetler bölüm başlığının sağındaki kısa açıklamayı değiştirir.' } },
        { name: 'secili_hizmetler', label: 'Ana sayfada gösterilecek hizmetler', type: 'relationship', relationTo: 'hizmetler', hasMany: true, maxRows: 8,
          admin: { description: 'Ana sayfadaki hizmet satırlarını ve sıralarını belirler. Yalnız yayınlanmış hizmetler görünür.' } },
      ] },
      { label: 'Seçili işler', fields: [
        { name: 'uygulamalar_gorunsun', label: 'Seçili işler bölümü görünsün', type: 'checkbox', defaultValue: true,
          admin: { description: 'Kapalıysa ana sayfadaki koyu zeminli gerçek işler bölümü gizlenir. Seçili izinli iş yoksa bölüm zaten gösterilmez.' } },
        { name: 'uygulamalar_etiket', label: 'Seçili işler küçük etiketi', type: 'text', maxLength: 60,
          admin: { description: 'Koyu bölümde büyük başlığın üstündeki küçük satırı değiştirir.' } },
        { name: 'uygulamalar_baslik', label: 'Seçili işler büyük başlığı', type: 'text', maxLength: 100,
          admin: { description: 'Ana sayfadaki koyu iş örnekleri bölümünün büyük başlığını değiştirir.' } },
        { name: 'uygulamalar_aciklama', label: 'Seçili işler yan açıklaması', type: 'textarea', maxLength: 300,
          admin: { description: 'Koyu bölüm başlığının sağındaki açıklama metnini değiştirir.' } },
        { name: 'secili_uygulamalar', label: 'Ana sayfada gösterilecek uygulamalar', type: 'relationship', relationTo: 'uygulamalar', hasMany: true, maxRows: 6,
          admin: { description: 'Koyu bölümde kullanılacak görsel kayıtları ve sıralarını belirler. Yalnız yayınlanmış kayıtlar görünür.' } },
      ] },
      { label: 'Süreç', fields: [
        { name: 'surec_gorunsun', label: 'Süreç bölümü görünsün', type: 'checkbox', defaultValue: true,
          admin: { description: 'Kapalıysa ana sayfadaki numaralı çalışma adımları bölümü tamamen gizlenir.' } },
        { name: 'surec_etiket', label: 'Süreç küçük etiketi', type: 'text', maxLength: 60,
          admin: { description: 'Süreç bölümünün sol üstündeki küçük satırı değiştirir.' } },
        { name: 'surec_baslik', label: 'Süreç büyük başlığı', type: 'textarea', maxLength: 120,
          admin: { description: 'Süreç bölümünün sol sütunundaki büyük başlığı değiştirir.' } },
        { name: 'surec_cta_etiketi', label: 'Süreç WhatsApp bağlantısı yazısı', type: 'text', maxLength: 60,
          admin: { description: 'Süreç bölümünün sol altındaki altı mercan çizgili WhatsApp bağlantısının yazısını değiştirir.' } },
        { name: 'surec_adimlari', label: 'Süreç adımları', type: 'array', maxRows: 4,
          admin: { description: 'Süreç bölümünün sağındaki 01, 02, 03 şeklindeki satırları oluşturur; sürükleyerek sıralayabilirsiniz.' }, fields: [
          { name: 'baslik', label: 'Adım başlığı', type: 'text', required: true,
            admin: { description: 'Numaranın yanında kalın görünen adım adı.' } },
          { name: 'aciklama', label: 'Adım açıklaması', type: 'textarea', required: true, maxLength: 350,
            admin: { description: 'Adım başlığının altında görünen kısa açıklama.' } },
        ] },
      ] },
      { label: 'Bölge ve teklif', fields: [
        { name: 'bolge_gorunsun', label: 'Ankara bölümü görünsün', type: 'checkbox', defaultValue: true,
          admin: { description: 'Kapalıysa ana sayfadaki ilçe listesi ve bölge anlatımı gizlenir; ayrı bölge sayfasını silmez.' } },
        { name: 'bolge_etiket', label: 'Bölge küçük etiketi', type: 'text', maxLength: 60,
          admin: { description: 'Ana sayfadaki bölge başlığının üstündeki küçük satırı değiştirir.' } },
        { name: 'bolge_baslik', label: 'Bölge büyük başlığı', type: 'textarea', maxLength: 120,
          admin: { description: 'Ana sayfadaki ilçe listesinin solunda görünen büyük başlığı değiştirir.' } },
        { name: 'bolge_aciklama', label: 'Bölge açıklaması', type: 'textarea', maxLength: 400,
          admin: { description: 'Bölge başlığının altında görünen açıklamayı değiştirir. Kesin hizmet veya montaj vaadi yazmayın.' } },
        { name: 'teklif_etiket', label: 'Teklif küçük etiketi', type: 'text', maxLength: 60,
          admin: { description: 'Ana sayfanın mercan teklif panelinde başlığın üstündeki küçük satırı değiştirir.' } },
        { name: 'teklif_baslik', label: 'Teklif büyük başlığı', type: 'textarea', maxLength: 120,
          admin: { description: 'Ana sayfanın altındaki mercan panelde görünen büyük başlığı değiştirir.' } },
        { name: 'teklif_aciklama', label: 'Teklif açıklaması', type: 'textarea', maxLength: 350,
          admin: { description: 'Mercan teklif panelinde başlığın altında görünen yönlendirme metnini değiştirir.' } },
      ] },
    ] },
  ],
};

export const UstBilgi: GlobalConfig = {
  slug: 'ust_bilgi', label: 'Üst bilgi ve menü',
  admin: { group: 'Genel ayarlar', description: 'Tüm sayfaların en üstündeki logo, menü bağlantıları ve WhatsApp alanını yönetir.' },
  access: { read: () => true, update: adminOnly }, hooks: { afterChange: [refreshPublicSite] },
  fields: [menuArray('menu_ogeleri', 'Üst menü öğeleri'), { name: 'cta_gorunsun', label: 'Üstte WhatsApp numarası görünsün', type: 'checkbox', defaultValue: true,
    admin: { description: 'Kapalıysa masaüstü üst bilginin sağındaki WhatsApp numarası gizlenir; sayfadaki diğer WhatsApp düğmeleri etkilenmez.' } }],
};

export const AltBilgi: GlobalConfig = {
  slug: 'alt_bilgi', label: 'Alt bilgi',
  admin: { group: 'Genel ayarlar', description: 'Tüm sayfaların en altındaki kısa metni, bağlantıları ve WhatsApp düğmesini yönetir.' }, access: { read: () => true, update: adminOnly }, hooks: { afterChange: [refreshPublicSite] },
  fields: [
    { name: 'metin', label: 'Alt bilgi açıklaması', type: 'textarea', maxLength: 300,
      admin: { description: 'Sayfanın en altında, logo ile bağlantıların arasında görünen kısa firma metnini değiştirir.' } },
    menuArray('linkler', 'Alt bilgi bağlantıları'),
  ],
};

export const IletisimBilgileri: GlobalConfig = {
  slug: 'iletisim_bilgileri', label: 'İletişim bilgileri',
  admin: { group: 'Genel ayarlar', description: 'Müşteri iletişimi yalnız WhatsApp üzerinden yürür.' },
  access: { read: () => true, update: adminOnly }, hooks: { afterChange: [refreshPublicSite] },
  fields: [
    { name: 'whatsapp_numarasi', label: 'WhatsApp numarası', type: 'text', required: true,
      admin: { description: 'Üst bilgi, giriş, süreç, teklif, alt bilgi ve mobil sabit düğme dahil tüm WhatsApp bağlantılarının hedefini değiştirir. 90 ile başlayan yalnız rakamlı biçim önerilir.' },
      validate: (value: unknown) => { try { normalizeTrWhatsAppNumber(value); return true; } catch { return 'Geçerli Türkiye mobil numarası girin.'; } },
      hooks: { beforeValidate: [({ value }) => { try { return normalizeTrWhatsAppNumber(value); } catch { return value; } }] } },
    { name: 'cta_etiketi', label: 'Genel WhatsApp düğmesi yazısı', type: 'text', required: true, maxLength: 60,
      admin: { description: 'Alt bilgi, mobil sabit düğme ve genel iletişim bağlantılarında görünen yazıyı değiştirir.' } },
    { name: 'teklif_etiketi', label: 'Teklif açma düğmesi yazısı', type: 'text', required: true, maxLength: 60,
      admin: { description: 'Formdan mesaj hazırlandıktan sonra WhatsApp’ı açan son düğmenin yazısını değiştirir.' } },
    { name: 'genel_mesaj', label: 'Genel WhatsApp hazır mesajı', type: 'textarea', required: true, maxLength: 300,
      admin: { description: 'Form dışındaki WhatsApp düğmelerine basıldığında sohbet kutusuna hazırlanan başlangıç mesajıdır. Mesaj otomatik gönderilmez.' } },
    { name: 'teklif_girisi', label: 'Teklif formu mesaj girişi', type: 'textarea', required: true, maxLength: 300,
      admin: { description: 'Teklif formunun oluşturduğu mesajın ilk paragrafını değiştirir; kullanıcının girdiği bilgiler bunun altına eklenir.' } },
    { name: 'adres', label: 'İşletme adresi', type: 'textarea', access: { update: adminField },
      admin: { description: 'Doluysa alt bilgide görünür. Adres kesinleşmediyse boş bırakın.' } },
    { name: 'calisma_saatleri', label: 'Çalışma saatleri', type: 'text', access: { update: adminField },
      admin: { description: 'Doluysa alt bilgide görünür. Saatler kesinleşmediyse boş bırakın.' } },
    { name: 'dahili_not', label: 'Dahili iletişim notu', type: 'textarea', access: { read: staffField, update: adminField },
      admin: { description: 'Yalnız panel kullanıcılarının görebildiği çalışma notudur; siteye ve public API’ye çıkmaz. Kişisel veri veya parola yazmayın.' } },
  ],
};

export const EntegrasyonAyarlari: GlobalConfig = {
  slug: 'entegrasyon_ayarlari', label: 'Entegrasyon ayarları',
  admin: { group: 'Sistem', description: 'Sır saklamayın; yalnız doğrulama ve ölçüm kimlikleri.' },
  access: { read: () => true, update: adminOnly },
  fields: [
    { name: 'search_console_dogrulama', label: 'Search Console doğrulama kodu', type: 'text',
      admin: { description: 'Google Search Console mülk doğrulamasında kullanılan içerik kodudur. Tam HTML etiketi veya hesap parolası girmeyin.' } },
    { name: 'analytics_aktif', label: 'İzinli analitik aktif', type: 'checkbox', defaultValue: false,
      admin: { description: 'Analitik entegrasyonunu açmak için kullanılır. İzin ve üretim kurulumu tamamlanmadan kapalı bırakın.' } },
    { name: 'analytics_kimligi', label: 'Analitik kimliği', type: 'text',
      admin: { description: 'Onaylı analitik sağlayıcısının ölçüm kimliği. Mesaj, telefon, müşteri bilgisi veya gizli anahtar yazmayın.' } },
  ],
};

export const siteGlobals = [SiteAyarlari, AnaSayfaIcerigi, UstBilgi, AltBilgi, IletisimBilgileri, EntegrasyonAyarlari];
