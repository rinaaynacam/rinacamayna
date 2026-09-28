import test from 'node:test';
import assert from 'node:assert/strict';
import { readEnvironment, canonical, normalizeCanonical } from '../src/lib/env.mjs';

const valid = {
  APP_ENV: 'development',
  SITE_URL: 'http://localhost:3000',
  CANONICAL_SITE_URL: canonical,
  VERITABANI_URL: 'postgresql://localhost/rina_test',
  PAYLOAD_GIZLI_ANAHTAR: 'a'.repeat(48),
  INDEXING_ENABLED: 'true',
};

test('Eksik secret veya DB sessiz fallback kullanmaz', () => {
  for (const key of ['VERITABANI_URL', 'PAYLOAD_GIZLI_ANAHTAR']) {
    assert.throws(() => readEnvironment({ ...valid, [key]: '' }), new RegExp(key));
  }
});

test('Önizleme ve development indekslenemez', () => {
  assert.equal(readEnvironment(valid).indexing, false);
  assert.equal(readEnvironment({ ...valid, APP_ENV: 'preview', SITE_URL: 'https://preview.example.com' }).indexing, false);
});

test('Üretim domaini ortam ayarından değiştirilebilir ve SITE_URL ile aynı olmalıdır', () => {
  const changedDomain = 'https://yeni-rina.example';
  const production = readEnvironment({
    ...valid,
    APP_ENV: 'production',
    SITE_URL: changedDomain,
    CANONICAL_SITE_URL: changedDomain,
  });
  assert.equal(production.canonicalURL, changedDomain);
  assert.equal(production.indexing, true);
  assert.throws(() => readEnvironment({
    ...valid,
    APP_ENV: 'production',
    SITE_URL: 'https://preview.example.com',
    CANONICAL_SITE_URL: changedDomain,
  }), /aynı olmalı/);
});

test('Canonical yalnız HTTPS origin kabul eder', () => {
  for (const value of ['http://example.com', 'https://example.com/path', 'https://example.com/', 'javascript:alert(1)']) {
    assert.throws(() => normalizeCanonical(value));
  }
  assert.equal(normalizeCanonical('https://www.example.com'), 'https://www.example.com');
});

test('Hata mesajı hatalı bağlantıdaki sırları yansıtmaz', () => {
  assert.throws(() => readEnvironment({ ...valid, VERITABANI_URL: 'SECRET-invalid-url' }), error => !error.message.includes('SECRET'));
});

test('R2 seçildiğinde bütün kalıcı medya ayarları doğrulanır', () => {
  const r2 = readEnvironment({
    ...valid,
    MEDYA_DEPOLAMA: 'r2',
    R2_HESAP_ID: 'a'.repeat(32),
    R2_KOVA_ADI: 'rina-medya',
    R2_ERISIM_ANAHTARI: 'access-key',
    R2_GIZLI_ANAHTAR: 'secret-key',
    MEDYA_PUBLIC_URL: 'https://media.example.com',
  });
  assert.equal(r2.r2.endpoint, `https://${'a'.repeat(32)}.r2.cloudflarestorage.com`);
  assert.equal(r2.r2.publicURL, 'https://media.example.com');
  assert.throws(() => readEnvironment({
    ...valid,
    MEDYA_DEPOLAMA: 'r2',
    R2_HESAP_ID: 'a'.repeat(32),
    R2_KOVA_ADI: 'rina-medya',
    R2_ERISIM_ANAHTARI: 'access-key',
    R2_GIZLI_ANAHTAR: 'secret-key',
    MEDYA_PUBLIC_URL: 'https://media.example.com/path',
  }), /MEDYA_PUBLIC_URL/);
  assert.throws(() => readEnvironment({ ...valid, MEDYA_DEPOLAMA: 'r2' }), /R2 için eksik/);
  assert.throws(() => readEnvironment({ ...valid, MEDYA_DEPOLAMA: 'disk' }), /local veya r2/);
});
