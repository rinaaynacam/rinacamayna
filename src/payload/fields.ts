import { lexicalEditor } from '@payloadcms/richtext-lexical';
import type { Field } from 'payload';

export const createSlug = (value: string): string => value
  .trim()
  .toLocaleLowerCase('tr-TR')
  .replace(/[ç]/g, 'c')
  .replace(/[ğ]/g, 'g')
  .replace(/[ı]/g, 'i')
  .replace(/[ö]/g, 'o')
  .replace(/[ş]/g, 's')
  .replace(/[ü]/g, 'u')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const slugField = (sourceField = 'ad'): Field => ({
  name: 'slug', label: 'Sayfa adresi (otomatik)', type: 'text', required: true, unique: true,
  admin: {
    readOnly: true,
    condition: data => Boolean(data?.id),
    description: 'İlk kayıtta başlıktan otomatik oluşturulur. Mevcut bağlantıların bozulmaması için sonradan değiştirilemez.',
  },
  hooks: { beforeValidate: [({ value, siblingData, operation, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return createSlug(value);
    if (operation === 'update' && typeof originalDoc?.slug === 'string') return originalDoc.slug;
    const source = siblingData?.[sourceField];
    return typeof source === 'string' ? createSlug(source) : value;
  }] },
  validate: (value: unknown) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? true : 'Başlıktan geçerli bir sayfa adresi üretilemedi.',
});

export const verificationFields = (): Field[] => [];

export const seoFields = (): Field => ({
  name: 'seo', label: 'SEO ve paylaşım', type: 'group', admin: { description: 'Google sonuçları ve sosyal medya paylaşım önizlemesi için kullanılan alanlar.' }, fields: [
    { name: 'baslik', label: 'Meta başlık', type: 'text', maxLength: 70,
      admin: { description: 'Tarayıcı sekmesinde ve arama sonuçlarında görünen başlık. Boşsa içerik başlığı kullanılır.' } },
    { name: 'aciklama', label: 'Meta açıklama', type: 'textarea', maxLength: 180,
      admin: { description: 'Arama sonucunda başlığın altında gösterilebilen kısa açıklama. Sayfanın görünür ana metnini değiştirmez.' } },
    { name: 'indekslenebilir', label: 'Arama motorlarında indekslenebilir', type: 'checkbox', defaultValue: true,
      admin: { description: 'Kapalıysa bu içerik için noindex üretilir. Taslaklar bu ayardan bağımsız olarak genel sitede görünmez.' } },
    { name: 'paylasim_gorseli', label: 'Paylaşım görseli', type: 'upload', relationTo: 'medyalar',
      admin: { description: 'Bağlantı WhatsApp veya sosyal medyada paylaşıldığında kullanılan önizleme görseli; sayfa içindeki kapak görselini değiştirmez.' } },
  ],
});

export const richContentField = (name = 'icerik', label = 'İçerik'): Field => ({
  name, label, type: 'richText', editor: lexicalEditor(),
  admin: { description: 'Detay sayfasının ana metin alanını oluşturur. Başlık, paragraf, liste ve güvenli bağlantılar burada düzenlenir.' },
});

export const safeInternalLink = (value: unknown): true | string => {
  const isPath = typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
  const isAnchor = typeof value === 'string' && /^#[a-z0-9-]+$/.test(value);
  if ((!isPath && !isAnchor) || /[\\\u0000-\u001f]/.test(String(value))) {
    return 'Bağlantı / ile başlayan site içi yol veya #bolum biçiminde bir bağlantı olmalıdır.';
  }
  return true;
};

const unsafeRedirectEncoding = /%(?:2f|5c|00|0d|0a)/i;

export const safeRedirectSource = (value: unknown): true | string => {
  if (typeof value !== 'string' || value.length > 500 || unsafeRedirectEncoding.test(value)
    || !/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(value)) {
    return 'Kaynak, /eski-sayfa veya /eski/alt-sayfa biçiminde güvenli bir site içi yol olmalıdır.';
  }
  return true;
};

export const safeRedirectTarget = (value: unknown, source?: unknown): true | string => {
  if (typeof value !== 'string' || value.length > 500 || value === source || unsafeRedirectEncoding.test(value)
    || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) {
    return 'Hedef, kaynaktan farklı ve / ile başlayan güvenli bir site içi yol olmalıdır.';
  }
  return true;
};

export const menuArray = (name: string, label: string): Field => ({
  name, label, type: 'array', maxRows: 12,
  admin: { description: 'Satır sırası sitedeki bağlantı sırasını belirler. Yalnız site içi sayfa veya bölüm bağlantısı kullanılır.' }, fields: [
    { name: 'etiket', label: 'Bağlantıda görünen yazı', type: 'text', required: true, maxLength: 40,
      admin: { description: 'Ziyaretçinin menüde veya alt bilgide okuyacağı metin.' } },
    { name: 'baglanti', label: 'Site içi bağlantı', type: 'text', required: true, validate: safeInternalLink,
      admin: { description: 'Örnek: /hizmetler, /hizmet-bolgeleri veya ana sayfa bölümü için #teklif.' } },
  ],
});
