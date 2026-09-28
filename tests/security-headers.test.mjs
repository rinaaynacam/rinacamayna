import test from 'node:test';
import assert from 'node:assert/strict';
import { securityHeaders } from '../src/lib/security.mjs';

const asMap = source => Object.fromEntries(securityHeaders(source).map(item => [item.key, item.value]));

test('development noindex kalır ve production-only CSP/HSTS eklenmez', () => {
  const headers = asMap({ APP_ENV: 'development', INDEXING_ENABLED: 'false' });
  assert.equal(headers['X-Robots-Tag'], 'noindex, nofollow');
  assert.equal(headers['Content-Security-Policy'], undefined);
  assert.equal(headers['Strict-Transport-Security'], undefined);
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
});

test('production güvenlik başlıkları ve indeksleme politikası uygulanır', () => {
  const headers = asMap({ APP_ENV: 'production', INDEXING_ENABLED: 'true' });
  assert.equal(headers['X-Robots-Tag'], undefined);
  assert.match(headers['Content-Security-Policy'], /object-src 'none'/);
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.doesNotMatch(headers['Content-Security-Policy'], /unsafe-eval/);
  assert.match(headers['Strict-Transport-Security'], /max-age=31536000/);
  assert.equal(headers['Permissions-Policy'], 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
});

test('R2 medya origin değeri CSP içine yalnız geçerli HTTPS origin olarak girer', () => {
  const headers = asMap({
    APP_ENV: 'production',
    INDEXING_ENABLED: 'true',
    MEDYA_DEPOLAMA: 'r2',
    MEDYA_PUBLIC_URL: 'https://media.example.com',
  });
  assert.match(headers['Content-Security-Policy'], /img-src[^;]+https:\/\/media\.example\.com/);

  const unsafe = asMap({
    APP_ENV: 'production',
    INDEXING_ENABLED: 'true',
    MEDYA_DEPOLAMA: 'r2',
    MEDYA_PUBLIC_URL: "https://media.example.com/; script-src *",
  });
  assert.doesNotMatch(unsafe['Content-Security-Policy'], /media\.example\.com/);
});
