import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppLink, composeQuoteMessage, formatTrWhatsAppNumber, normalizeTrWhatsAppNumber } from './whatsapp.mjs';

test('Türkiye telefon biçimleri aynı WhatsApp hesabına dönüşür', () => {
  for (const value of ['05422313069', '5422313069', '905422313069', '+90 (542) 231 30 69', '0090 542 231 30 69']) {
    assert.equal(normalizeTrWhatsAppNumber(value), '905422313069');
  }
  assert.equal(formatTrWhatsAppNumber('+90 542 231 30 69'), '0542 231 30 69');
});

test('bozuk telefon ve URL enjeksiyonu reddedilir', () => {
  for (const value of ['', '123', 'abc05422313069', '+44 7700 900123', '905422313069?text=ek', 'https://evil.example', '++905422313069', '+05422313069']) {
    assert.throws(() => normalizeTrWhatsAppNumber(value));
  }
});

test('CMS farklı numara verdiğinde bağlantı ve görünen numara değişir', () => {
  const result = buildWhatsAppLink('05001112233', 'Test taslağı');
  assert.equal(new URL(result.href).pathname, '/905001112233');
  assert.equal(result.displayNumber, '0500 111 22 33');
  assert.equal(result.href.includes('905422313069'), false);
});

test('Türkçe karakterler ve ayırıcılar başka URL parametresi oluşturmaz', () => {
  const message = 'Şifonyer aynası & ölçü?\n#2: 45 × 60 cm + bronz';
  const result = buildWhatsAppLink('05422313069', message);
  const url = new URL(result.href);
  assert.equal(url.origin, 'https://wa.me');
  assert.deepEqual([...url.searchParams.keys()], ['text']);
  assert.equal(url.searchParams.get('text'), message);
  assert.equal(url.hash, '');
  assert.equal(result.requiresCopy, false);
});

test('iki ürünün ölçüsü, birimi ve adedi ayrı kalır', () => {
  const message = composeQuoteMessage({ company: 'Örnek Atölye', items: [
    { product: 'Konsol aynası', width: '120', height: '70', unit: 'cm', quantity: 4, color: 'Netleştirilecek' },
    { product: 'Şifonyer', width: '450,5', height: '600', unit: 'mm', quantity: 2 },
  ] });
  assert.match(message, /120 × 70 cm \| Adet: 4/);
  assert.match(message, /450,5 × 600 mm \| Adet: 2/);
  assert.match(message, /2\. Şifonyer/);
});

test('bireysel ziyaretçi firma ve ölçü olmadan mesaj hazırlar; ilçe isteğe bağlıdır', () => {
  const general = composeQuoteMessage();
  assert.match(general, /^Merhaba, cam veya ayna ihtiyacım için teklif almak istiyorum\./);
  assert.match(general, /İhtiyacımı ve ölçüleri birlikte/);
  assert.doesNotMatch(general, /Firma|İlçe|mobilya üretimi/);
  const personal = composeQuoteMessage({ district: 'Polatlı', items: [{ product: 'Ev için ayna', quantity: 1 }] });
  assert.match(personal, /İlçe \/ semt: Polatlı/);
  assert.match(personal, /Ölçüler netleştirilecek/);
  assert.doesNotMatch(personal, /Firma/);
});

test('geçersiz ölçü, adet ve satır sayısı reddedilir', () => {
  for (const item of [
    { product: 'Ayna', width: -1, height: 20 },
    { product: 'Ayna', width: 0, height: 20 },
    { product: 'Ayna', width: 20 },
    { product: 'Ayna', width: '1e5', height: 20 },
    { product: 'Ayna', quantity: 1.5 },
    { product: 'Ayna', quantity: 0 },
    { product: 'Ayna', unit: 'inch' },
  ]) assert.throws(() => composeQuoteMessage({ items: [item] }));
  assert.throws(() => composeQuoteMessage({ items: Array.from({ length: 11 }, () => ({ product: 'Ayna' })) }));
});

test('uzun mesaj sessizce kesilmez ve kopyalama seçeneği gerektirir', () => {
  const message = 'Ölçü listesi: ' + 'şçğü '.repeat(800);
  const result = buildWhatsAppLink('05422313069', message);
  assert.equal(result.href, 'https://wa.me/905422313069');
  assert.equal(result.requiresCopy, true);
  assert.equal(result.message, message.trim());
});

test('CMS hazır mesajı değişebilir ve alan uzunlukları denetlenir', () => {
  assert.match(composeQuoteMessage({}, { greeting: 'Merhaba, modelimi paylaşmak istiyorum.' }), /^Merhaba, modelimi paylaşmak istiyorum\./);
  assert.throws(() => composeQuoteMessage({ company: 'x'.repeat(161) }));
  assert.throws(() => composeQuoteMessage({ district: 'x'.repeat(161) }));
  assert.throws(() => composeQuoteMessage({ note: 'x'.repeat(1001) }));
});

test('boş metin için düz sohbet bağlantısı ve gönderim iddiası olmayan veri üretilir', () => {
  const result = buildWhatsAppLink('05422313069');
  assert.equal(result.href, 'https://wa.me/905422313069');
  assert.equal(result.requiresCopy, false);
  assert.equal('sent' in result, false);
});
