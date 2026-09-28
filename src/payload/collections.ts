import type { CollectionConfig, Field } from 'payload';
import { adminOnly, editorCannotPublish, publishedAndApproved, signedIn, staffField } from '@/lib/access';
import { richContentField, seoFields, slugField, verificationFields } from './fields';

const contentAccess: CollectionConfig['access'] = {
  create: signedIn,
  delete: adminOnly,
  read: publishedAndApproved,
  update: signedIn,
};

const contentVersions: CollectionConfig['versions'] = {
  drafts: { autosave: true, schedulePublish: false, validate: true },
  maxPerDoc: 20,
};

const contentHooks: CollectionConfig['hooks'] = { beforeChange: [editorCannotPublish] };

const orderField: Field = { name: 'sira', label: 'Liste sırası', type: 'number', defaultValue: 100, required: true,
  admin: { description: 'Küçük sayı daha önce görünür. Ana sayfadaki özel seçim sırası ayrıca “Ana sayfa içeriği” alanından belirlenir.' } };
const summaryField: Field = { name: 'ozet', label: 'Kısa açıklama', type: 'textarea', required: true, maxLength: 300,
  admin: { description: 'Liste satırında, kartta veya giriş özetinde görünen kısa metindir; detay sayfasındaki uzun içeriğin yerini tutmaz.' } };

export const Hizmetler: CollectionConfig = {
  slug: 'hizmetler', labels: { singular: 'Hizmet', plural: 'Hizmetler' },
  admin: { group: 'İçerik', useAsTitle: 'ad', defaultColumns: ['ad', '_status', 'sira'], description: 'Sitede sunulan cam ve ayna hizmetlerini, detay sayfalarını ve ana sayfa hizmet satırlarını yönetir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'ad', label: 'Hizmet adı', type: 'text', required: true,
      admin: { description: 'Hizmet listesinde ve hizmet detay sayfasında büyük başlık olarak görünür.' } }, slugField(), summaryField,
    richContentField('aciklama', 'Detaylı açıklama'),
    { name: 'kapak_gorseli', label: 'Hizmet kapak görseli', type: 'upload', relationTo: 'medyalar',
      admin: { description: 'Hizmet liste satırında ve hizmet detay sayfasının üst görsel alanında kullanılır.' } },
    { name: 'kullanim_alanlari', label: 'Kullanım alanları', type: 'relationship', relationTo: 'kullanim_alanlari', hasMany: true,
      admin: { description: 'Bu hizmetin ev, ofis, banyo gibi hangi kullanım içerikleriyle ilişkili olduğunu belirtir.' } },
    { name: 'islem_secenekleri', label: 'Doğrulanmış işlem seçenekleri', type: 'relationship', relationTo: 'islem_secenekleri', hasMany: true,
      admin: { description: 'Bu hizmet için gerçekten sunulan cam/ayna türü, renk, kalınlık veya kenar işlemlerini bağlar.' } },
    { name: 'sss', label: 'İlgili sorular', type: 'relationship', relationTo: 'sss', hasMany: true,
      admin: { description: 'Bu hizmetle bağlantılı soru-cevap kayıtlarını seçer.' } },
    { name: 'whatsapp_mesaji', label: 'Hizmete özel WhatsApp mesajı', type: 'textarea', maxLength: 300,
      admin: { description: 'Hizmet detayındaki WhatsApp düğmesine basıldığında hazırlanan başlangıç mesajını değiştirir. Boşsa genel WhatsApp mesajı kullanılır.' } },
    orderField, ...verificationFields(), seoFields(),
  ],
};

export const KullanimAlanlari: CollectionConfig = {
  slug: 'kullanim_alanlari', labels: { singular: 'Kullanım alanı', plural: 'Kullanım alanları' },
  admin: { group: 'İçerik', useAsTitle: 'ad', defaultColumns: ['ad', '_status', 'sira'], description: 'Hizmetleri kullanım bağlamına göre gruplamak için ev, ofis, banyo, mağaza gibi içerik sayfalarını yönetir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'ad', label: 'Kullanım alanı başlığı', type: 'text', required: true,
      admin: { description: 'Kullanım alanı liste ve detay sayfasında büyük başlık olarak kullanılır.' } }, slugField(), summaryField,
    richContentField(), { name: 'kapak_gorseli', label: 'Kullanım alanı kapak görseli', type: 'upload', relationTo: 'medyalar',
      admin: { description: 'Kullanım alanı kartında veya detay sayfasının üst kısmında kullanılacak gerçek görseli seçer.' } },
    { name: 'hizmetler', label: 'İlgili hizmetler', type: 'relationship', relationTo: 'hizmetler', hasMany: true,
      admin: { description: 'Bu kullanım alanında ziyaretçiye önerilecek hizmetleri bağlar.' } },
    orderField, ...verificationFields(), seoFields(),
  ],
};

export const IslemSecenekleri: CollectionConfig = {
  slug: 'islem_secenekleri', labels: { singular: 'İşlem seçeneği', plural: 'İşlem seçenekleri' },
  admin: { group: 'İçerik', useAsTitle: 'ad', defaultColumns: ['ad', 'tur', 'sunum_durumu'], description: 'Cam/ayna türü, kalınlık, renk ve kenar işlemi gibi teknik seçenekleri yönetir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'ad', label: 'Seçenek adı', type: 'text', required: true,
      admin: { description: 'Ziyaretçiye gösterilebilecek teknik seçeneğin anlaşılır adı. Örnek: Füme cam veya rodajlı kenar.' } },
    { name: 'tur', label: 'Seçenek kategorisi', type: 'select', required: true,
      admin: { description: 'Seçeneğin panelde ve ileride filtrelerde hangi teknik başlık altında gruplanacağını belirler.' }, options: [
      { label: 'Cam türü', value: 'cam' }, { label: 'Ayna türü', value: 'ayna' },
      { label: 'Kalınlık', value: 'kalinlik' }, { label: 'Renk', value: 'renk' },
      { label: 'Kenar işlemi', value: 'kenar' }, { label: 'Diğer işlem', value: 'diger' },
    ] },
    { name: 'sunum_durumu', label: 'İşletmenin sunum durumu', type: 'select', required: true,
      admin: { description: 'Bu seçeneğin işletme tarafından doğrudan, dış kaynakla veya hiç sunulmadığını belirtir. Yanlış hizmet vaadini önler.' }, options: [
      { label: 'İşletme sunuyor', value: 'sunuluyor' },
      { label: 'Dışarıdan sağlanıyor', value: 'disaridan' },
      { label: 'Sunulmuyor', value: 'sunulmuyor' },
    ] },
    { name: 'aciklama', label: 'Açıklama / koşul', type: 'textarea', maxLength: 500,
      admin: { description: 'Seçeneğin geçerli olduğu ölçü, ürün veya tedarik koşulunu açıklar; teyit edilmemiş kesin vaat yazmayın.' } },
    orderField, ...verificationFields(),
  ],
};

export const Uygulamalar: CollectionConfig = {
  slug: 'uygulamalar', labels: { singular: 'Gerçek uygulama', plural: 'Gerçek uygulamalar' },
  admin: { group: 'İçerik', useAsTitle: 'ad', defaultColumns: ['ad', '_status', 'sira'], description: 'Görselli uygulama anlatımlarını yönetir. Ana sayfanın koyu bölümü bu kayıtlardan beslenir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'ad', label: 'Uygulama adı', type: 'text', required: true,
      admin: { description: 'Ana sayfadaki koyu iş örneğinde ve uygulama detayında büyük başlık olarak görünür.' } }, slugField(), summaryField,
    { name: 'kullanim', label: 'Kullanım / mekân', type: 'text',
      admin: { description: 'İş örneğinin küçük üst etiketinde mekân veya kullanım türünü belirtir. Örnek: Banyo / özel ölçü.' } },
    { name: 'malzeme', label: 'Doğrulanmış malzeme', type: 'text',
      admin: { description: 'Projede gerçekten kullanılan, işletme tarafından teyit edilmiş malzeme bilgisidir.' } },
    { name: 'islem', label: 'Doğrulanmış işlem', type: 'text',
      admin: { description: 'Projede gerçekten uygulanan kesim, kenar, temper veya montaj işlemini kaydeder.' } },
    richContentField('aciklama', 'Uygulama açıklaması'),
    { name: 'gorseller', label: 'Gerçek uygulama görselleri', type: 'upload', relationTo: 'medyalar', hasMany: true, required: true,
      admin: { description: 'Ana sayfanın koyu seçili işler bölümünde ve uygulama sayfasında gösterilecek gerçek proje fotoğraflarıdır. İlk görsel ana görsel olur.' } },
    { name: 'hizmetler', label: 'Kategori / ilgili hizmetler', type: 'relationship', relationTo: 'hizmetler', hasMany: true,
      admin: { description: 'Uygulamanın kategorilerini seçer. Seçilen hizmetler, Uygulamalar sayfasındaki müşteri filtrelerini oluşturur ve işi ilgili hizmet detaylarıyla ilişkilendirir.' } },
    orderField, ...verificationFields(), seoFields(),
  ],
};

export const SSS: CollectionConfig = {
  slug: 'sss', labels: { singular: 'Sık sorulan soru', plural: 'Sık sorulan sorular' },
  admin: { group: 'İçerik', useAsTitle: 'soru', defaultColumns: ['soru', '_status', 'sira'], description: 'Ziyaretçilerin sık sorduğu sorulara kısa ve doğrudan yanıtlar sağlar.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'soru', label: 'Ziyaretçinin sorusu', type: 'text', required: true,
      admin: { description: 'SSS başlığı olarak ziyaretçiye gösterilecek açık ve doğal dilde soru.' } },
    { name: 'yanit', label: 'Doğrudan yanıt', type: 'textarea', required: true, maxLength: 1200,
      admin: { description: 'Sorunun altında gösterilecek yanıt. Kesinleşmemiş fiyat, süre, garanti veya montaj vaadi yazmayın.' } },
    { name: 'hizmetler', label: 'İlgili hizmetler', type: 'relationship', relationTo: 'hizmetler', hasMany: true,
      admin: { description: 'Bu sorunun hangi hizmet sayfalarında ilgili olduğunu belirtir.' } },
    orderField, ...verificationFields(),
  ],
};

export const RehberYazilari: CollectionConfig = {
  slug: 'rehber_yazilari', labels: { singular: 'Rehber yazısı', plural: 'Rehber yazıları' },
  admin: { group: 'İçerik', useAsTitle: 'baslik', defaultColumns: ['baslik', '_status', 'updatedAt'], description: 'Cam ve ayna seçimi hakkında bilgilendirici yazıları yönetir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'baslik', label: 'Rehber başlığı', type: 'text', required: true,
      admin: { description: 'Rehber liste ve detay sayfasındaki büyük başlığı değiştirir.' } }, slugField('baslik'), summaryField,
    richContentField(), { name: 'kapak_gorseli', label: 'Rehber kapak görseli', type: 'upload', relationTo: 'medyalar',
      admin: { description: 'Rehber kartı ve yazı üst bölümünde kullanılan görseli değiştirir.' } },
    { name: 'kontrol_eden', label: 'Teknik olarak kontrol eden', type: 'text',
      admin: { description: 'Yazıdaki teknik bilgileri kontrol eden yetkili veya uzman kaydı. Doğrulanmamış bir isim eklemeyin.' } },
    ...verificationFields(), seoFields(),
  ],
};

export const Sayfalar: CollectionConfig = {
  slug: 'sayfalar', labels: { singular: 'Sayfa', plural: 'Sayfalar' },
  admin: { group: 'İçerik', useAsTitle: 'baslik', defaultColumns: ['baslik', 'slug', '_status'], description: 'Hakkımızda veya bilgilendirme gibi bağımsız içerik sayfalarını yönetir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'baslik', label: 'Sayfa başlığı', type: 'text', required: true,
      admin: { description: 'Bağımsız sayfanın ana başlığı ve varsayılan tarayıcı başlığıdır.' } }, slugField('baslik'), summaryField,
    richContentField(), ...verificationFields(), seoFields(),
  ],
};

export const Kampanyalar: CollectionConfig = {
  slug: 'kampanyalar', labels: { singular: 'Kampanya', plural: 'Kampanyalar' },
  admin: { group: 'İçerik', useAsTitle: 'baslik', defaultColumns: ['baslik', 'baslangic', 'bitis', '_status'], description: 'Yayınlanmış ve tarih aralığı geçerli kampanyalar site açıldığında pencere olarak gösterilir. Geçerli birden fazla kampanya varsa ziyaretçiye rastgele biri gösterilir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'baslik', label: 'Kampanya başlığı', type: 'text', required: true,
      admin: { description: 'Açılış penceresinde ziyaretçinin göreceği ana başlık.' } }, summaryField,
    richContentField('kosullar', 'Kampanya koşulları'),
    { name: 'baslangic', label: 'Kampanya başlangıcı', type: 'date', required: true,
      admin: { description: 'Kampanyanın geçerli olmaya başladığı tarih. Görünür metindeki tarihle aynı olmalıdır.' } },
    { name: 'bitis', label: 'Kampanya bitişi', type: 'date', required: true,
      admin: { description: 'Kampanyanın sona erdiği tarih ve saat. Bu andan sonra pencere otomatik olarak gösterilmez.' } },
    { name: 'gorsel', label: 'Kampanya görseli', type: 'upload', relationTo: 'medyalar',
      admin: { description: 'Kampanya açılış penceresinin üst kısmında kullanılacak görseli değiştirir.' } },
    ...verificationFields(),
  ],
};

export const Yorumlar: CollectionConfig = {
  slug: 'yorumlar', labels: { singular: 'Doğrulanmış yorum', plural: 'Doğrulanmış yorumlar' },
  admin: { group: 'İçerik', useAsTitle: 'gostergelik_ad', defaultColumns: ['gostergelik_ad', 'kaynak', 'sitede_goster', '_status'], description: 'Google veya web sitesi üzerinden alınan gerçek müşteri yorumlarından hangilerinin sitede gösterileceğini yönetir.' },
  access: contentAccess, hooks: contentHooks, versions: contentVersions,
  fields: [
    { name: 'gostergelik_ad', label: 'Gösterilecek ad / kurum', type: 'text', required: true,
      admin: { description: 'Yorum yanında ziyaretçiye gösterilecek, sahibinin onayladığı ad veya kurum adı.' } },
    { name: 'yorum', label: 'Yayınlanacak yorum', type: 'textarea', required: true, maxLength: 1000,
      admin: { description: 'İzin verilen gerçek yorum metni. Anlamını değiştirecek düzenleme veya temsili metin eklemeyin.' } },
    { name: 'kaynak', label: 'Yorum kaynağı', type: 'text', required: true,
      admin: { description: 'Ziyaretçiye gösterilecek kaynak adı. Örnek: Google veya Web sitesi.' } },
    { name: 'kaynak_baglantisi', label: 'Kaynak bağlantısı', type: 'text',
      admin: { description: 'Google yorumunun veya doğrulanabilir kaynak sayfasının https:// ile başlayan bağlantısı. Web sitesi içi yorumlarda boş kalabilir.' },
      validate: (value: unknown) => value == null || value === '' || (typeof value === 'string' && /^https:\/\/[^\s]+$/i.test(value))
        ? true : 'https:// ile başlayan geçerli bir bağlantı girin.' },
    { name: 'puan', label: 'Puan', type: 'number', min: 1, max: 5,
      admin: { description: 'Kaynakta yıldız puanı varsa 1–5 arasında girin; yoksa boş bırakın.' } },
    { name: 'sitede_goster', label: 'Sitede göster', type: 'checkbox', defaultValue: true,
      admin: { description: 'Açık ve Yayınlandı durumundaysa yorum /yorumlar ve Bilgi Merkezi sayfalarında görünür.' } },
    orderField, ...verificationFields(),
  ],
};

export const HizmetBolgeleri: CollectionConfig = {
  slug: 'hizmet_bolgeleri', labels: { singular: 'Hedef ilçe', plural: 'Hedef ilçeler' },
  admin: { group: 'İçerik', useAsTitle: 'ad', defaultColumns: ['ad', 'hedef_kapsam', 'operasyon_teyidi'], description: 'Ankara bölge sayfasındaki 25 ilçeyi ve varsa ilçeye özel çalışma koşullarını yönetir.' },
  access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'ad', label: 'İlçe adı', type: 'text', required: true, unique: true,
      admin: { description: 'Ana sayfa ve /hizmet-bolgeleri listesindeki görünen ilçe adını değiştirir.' } }, orderField,
    { name: 'hedef_kapsam', label: 'İletişim hedef kapsamında', type: 'checkbox', defaultValue: true, required: true,
      admin: { description: 'Açıksa ilçe ana sayfa ve bölge listesindeki hedef kapsamda görünür. Bu seçim kesin montaj veya nakliye vaadi değildir.' } },
    { name: 'operasyon_teyidi', label: 'Yerinde çalışma koşulları', type: 'textarea',
      admin: { description: 'İlçeye özel ve işletme tarafından doğrulanmış koşul varsa bölge listesinde ilçe adının altında görünür. Boşsa hizmet/montaj vaadi gösterilmez.' } },
  ],
};

export const Medyalar: CollectionConfig = {
  slug: 'medyalar', labels: { singular: 'Medya', plural: 'Medyalar' },
  admin: { group: 'Medya ve dosyalar', useAsTitle: 'alt', defaultColumns: ['thumbnail', 'alt', 'filename'], description: 'Logo, kapak ve uygulama görsellerini yükler.' },
  access: { create: signedIn, delete: adminOnly, update: signedIn, read: () => true },
  fields: [
    { name: 'alt', label: 'Alternatif metin', type: 'text', required: true, maxLength: 180,
      admin: { description: 'Görseli göremeyen kullanıcıya ne olduğunu anlatır. Görseldeki gerçek içeriği kısa ve nesnel yazın; “resim” diye başlamayın.' } },
    { name: 'kaynak', label: 'Görsel kaynağı / sahiplik', type: 'text', required: true, access: { read: staffField },
      admin: { description: 'Fotoğrafın kim tarafından çekildiği veya kullanım hakkının nereden geldiğine dair dahili kanıttır; sitede gösterilmez.' } },
    ...verificationFields(),
  ],
  upload: {
    staticDir: 'media-local', adminThumbnail: 'kucuk', focalPoint: true,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'kucuk', width: 720, height: 480, fit: 'cover', withoutEnlargement: true },
      { name: 'buyuk', width: 1920, height: 1280, fit: 'inside', withoutEnlargement: true },
      { name: 'dikey', width: 1200, height: 1500, fit: 'cover', withoutEnlargement: true },
    ],
  },
};

export const Dosyalar: CollectionConfig = {
  slug: 'dosyalar', labels: { singular: 'Genel dosya', plural: 'Genel dosyalar' },
  admin: { group: 'Medya ve dosyalar', useAsTitle: 'baslik', description: 'Ziyaretçiye sunulabilecek PDF belgelerini yönetir; proje fotoğrafları için Medyalar bölümünü kullanın.' },
  access: { create: signedIn, delete: adminOnly, update: signedIn, read: () => true },
  fields: [
    { name: 'baslik', label: 'Dosya başlığı', type: 'text', required: true,
      admin: { description: 'PDF bağlantısı yanında ziyaretçiye gösterilecek anlaşılır belge adı.' } },
    { name: 'aciklama', label: 'Dosya açıklaması', type: 'textarea',
      admin: { description: 'Belgenin ne içerdiğini ve hangi durumda kullanılacağını açıklar.' } }, ...verificationFields(),
  ],
  upload: { staticDir: 'public-files', mimeTypes: ['application/pdf'], crop: false, focalPoint: false },
};

export const Yonlendirmeler: CollectionConfig = {
  slug: 'yonlendirmeler', labels: { singular: 'Yönlendirme', plural: 'Yönlendirmeler' },
  admin: { group: 'Sistem', useAsTitle: 'kaynak', description: 'Eski veya değişen site adreslerini yeni ilgili sayfaya yönlendirmek için kullanılır.' },
  access: { create: adminOnly, delete: adminOnly, read: () => true, update: adminOnly },
  fields: [
    { name: 'kaynak', label: 'Eski site içi yol', type: 'text', required: true, unique: true,
      admin: { description: 'Ziyaretçinin veya arama motorunun gelebileceği eski yol. Örnek: /eski-hizmet.' } },
    { name: 'hedef', label: 'Yeni site içi yol', type: 'text', required: true,
      admin: { description: 'Eski yolun yönleneceği çalışan yeni sayfa. Örnek: /hizmetler/ozel-olcu-ayna.' },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && value !== siblingData?.kaynak
        ? true : 'Geçerli, farklı bir site içi hedef girin.' },
    { name: 'kalici', label: 'Kalıcı yönlendirme (308)', type: 'checkbox', defaultValue: true,
      admin: { description: 'Adres değişikliği kalıcıysa açık bırakın. Geçici yönlendirme yalnız gerçekten geçici durumlarda kullanılmalıdır.' } },
  ],
};

export const DenetimKaydi: CollectionConfig = {
  slug: 'denetim_kaydi', labels: { singular: 'Denetim kaydı', plural: 'Denetim kayıtları' },
  admin: { group: 'Sistem', useAsTitle: 'islem', description: 'Kritik panel işlemlerinin sistem tarafından oluşturulan salt okunur izlerini gösterir; elle kayıt eklenmez.' },
  access: { create: () => false, delete: () => false, read: adminOnly, update: () => false },
  fields: [
    { name: 'islem', label: 'İşlem', type: 'text', required: true,
      admin: { description: 'Sistem tarafından kaydedilen işlem türü.' } },
    { name: 'koleksiyon', label: 'Koleksiyon / global', type: 'text', required: true,
      admin: { description: 'İşlemin hangi içerik veya ayar alanında gerçekleştiğini belirtir.' } },
    { name: 'kayit_id', label: 'Kayıt kimliği', type: 'text',
      admin: { description: 'İşlem belirli bir kayda aitse o kaydın dahili kimliği.' } },
    { name: 'yonetici', label: 'Yönetici', type: 'relationship', relationTo: 'yoneticiler',
      admin: { description: 'İşlemi yapan panel kullanıcısını gösterir.' } },
  ],
};

export const contentCollections = [
  Hizmetler, KullanimAlanlari, IslemSecenekleri, Uygulamalar, SSS, RehberYazilari,
  Sayfalar, Kampanyalar, Yorumlar, HizmetBolgeleri, Medyalar, Dosyalar,
  Yonlendirmeler, DenetimKaydi,
];
