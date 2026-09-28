/**
 * İlk bağımsız iş modülü. Ağ isteği veya mesaj gönderimi yapmaz.
 * Uygulama numarayı ve şablonları her zaman güncel CMS ayarından geçirmelidir.
 */
export function normalizeTrWhatsAppNumber(input) {
  if (typeof input !== 'string') throw new TypeError('Telefon metin olmalıdır.');
  let compact = input.trim().replace(/[\s().-]/g, '');
  if (!/^(?:\+|00)?\d+$/.test(compact)) {
    throw new Error('Telefon yalnızca rakam ve geçerli telefon biçimi içerebilir.');
  }
  if (compact.startsWith('+') || compact.startsWith('00')) {
    compact = compact.replace(/^(?:\+|00)/, '');
    if (!/^905\d{9}$/.test(compact)) throw new Error('Türkiye mobil numarası bekleniyor.');
  } else if (/^05\d{9}$/.test(compact)) {
    compact = `9${compact}`;
  } else if (/^5\d{9}$/.test(compact)) {
    compact = `90${compact}`;
  }
  if (!/^905\d{9}$/.test(compact)) throw new Error('Geçerli Türkiye mobil numarası girin.');
  return compact;
}

export function formatTrWhatsAppNumber(input) {
  const national = `0${normalizeTrWhatsAppNumber(input).slice(2)}`;
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7, 9)} ${national.slice(9)}`;
}

function line(value, label, max = 160) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') throw new TypeError(`${label} metin olmalıdır.`);
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length > max) throw new Error(`${label} en fazla ${max} karakter olmalıdır.`);
  return clean;
}

function positiveDecimal(value, label, integerOnly = false) {
  const input = String(value ?? '').trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(input)) throw new Error(`${label} pozitif sayı olmalıdır.`);
  const number = Number(input.replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0 || number > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${label} pozitif ve geçerli aralıkta olmalıdır.`);
  }
  if (integerOnly && !Number.isSafeInteger(number)) throw new Error(`${label} pozitif tam sayı olmalıdır.`);
  return String(number).replace('.', ',');
}

function isBlank(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

export function composeQuoteMessage(data = {}, templates = {}) {
  const greeting = line(templates.greeting ?? 'Merhaba, cam veya ayna ihtiyacım için teklif almak istiyorum.', 'Mesaj girişi', 300);
  const company = line(data.company, 'Firma');
  const person = line(data.person, 'İlgili kişi');
  const district = line(data.district, 'İlçe / semt');
  const delivery = line(data.delivery, 'Teslimat notu', 300);
  const note = line(data.note, 'Ek not', 1000);
  const items = data.items ?? [];
  if (!Array.isArray(items) || items.length > 10) throw new Error('En fazla 10 ürün satırı eklenebilir.');

  const lines = [greeting];
  if (company) lines.push(`Firma / kurum: ${company}`);
  if (person) lines.push(`İlgili kişi: ${person}`);
  if (district) lines.push(`İlçe / semt: ${district}`);

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('Ürün satırı geçersiz.');
    const product = line(item.product, 'Ürün / model');
    if (!product) throw new Error('Ürün / model bilgisi gereklidir.');
    const quantity = positiveDecimal(item.quantity ?? 1, 'Adet', true);
    const unit = item.unit ?? 'mm';
    if (unit !== 'mm' && unit !== 'cm') throw new Error('Birim mm veya cm olmalıdır.');
    const widthMissing = isBlank(item.width);
    const heightMissing = isBlank(item.height);
    if (widthMissing !== heightMissing) throw new Error('En ve boy birlikte girilmelidir.');
    const measurement = widthMissing
      ? 'Ölçüler netleştirilecek'
      : `${positiveDecimal(item.width, 'En')} × ${positiveDecimal(item.height, 'Boy')} ${unit}`;

    lines.push('', `${index + 1}. ${product}`, `${measurement} | Adet: ${quantity}`);
    for (const [key, title] of [['thickness', 'Kalınlık'], ['color', 'Renk'], ['edge', 'Kenar işlemi'], ['shapeNote', 'Şekil / çizim notu']]) {
      const value = line(item[key], title, 200);
      if (value) lines.push(`${title}: ${value}`);
    }
  });
  if (!items.length) lines.push('İhtiyacımı ve ölçüleri birlikte netleştirmek istiyorum.');
  if (delivery) lines.push('', `Teslimat ihtiyacı: ${delivery}`);
  if (note) lines.push('', `Not: ${note}`);
  return lines.filter((value, index) => value !== '' || index > 0).join('\n').trim();
}

export function buildWhatsAppLink(number, message = '', maxUrlLength = 1800) {
  const normalized = normalizeTrWhatsAppNumber(number);
  if (typeof message !== 'string') throw new TypeError('Mesaj metin olmalıdır.');
  if (!Number.isSafeInteger(maxUrlLength) || maxUrlLength < 100) throw new Error('URL bütçesi geçersiz.');
  const base = `https://wa.me/${normalized}`;
  const text = message.trim();
  const candidate = text ? `${base}?text=${encodeURIComponent(text)}` : base;
  const requiresCopy = candidate.length > maxUrlLength;
  return {
    href: requiresCopy ? base : candidate,
    message: text,
    requiresCopy,
    displayNumber: formatTrWhatsAppNumber(normalized),
  };
}
