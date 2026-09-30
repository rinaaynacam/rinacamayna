import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug, safeRedirectSource, safeRedirectTarget, safeVideoURL } from '../src/payload/fields.ts';

test('Türkçe başlık güvenli URL kısa adına dönüşür', () => {
  assert.equal(createSlug('Ev ve Yaşam Alanları'), 'ev-ve-yasam-alanlari');
  assert.equal(createSlug('Özel Ölçü / İç Mekân'), 'ozel-olcu-ic-mekan');
  assert.equal(createSlug('  Duş Camı & Ayna  '), 'dus-cami-ayna');
});

test('Uygulama videosu yalnız güvenli ve desteklenen HTTPS adreslerini kabul eder', () => {
  for (const value of [
    'https://youtu.be/abc123',
    'https://www.youtube.com/watch?v=abc123',
    'https://vimeo.com/123456',
    'https://media.example.com/uygulama.mp4',
    'https://media.example.com/uygulama.webm?version=2',
  ]) assert.equal(safeVideoURL(value), true);

  for (const value of [
    'http://youtu.be/abc123',
    'javascript:alert(1)',
    'https://example.com/sayfa',
    'not-a-url',
  ]) assert.notEqual(safeVideoURL(value), true);
});

test('Yönlendirmeler yalnız güvenli site içi kaynak ve hedef kabul eder', () => {
  assert.equal(safeRedirectSource('/eski-hizmet/ayna'), true);
  assert.equal(safeRedirectTarget('/hizmetler/ozel-olcu-ayna', '/eski-hizmet'), true);
  for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/%2fevil.example', '/satir\nsonu']) {
    assert.notEqual(safeRedirectTarget(value, '/eski'), true);
  }
  for (const value of ['/', '//evil', '/Eski Sayfa', '/eski?x=1', '/%2feski']) {
    assert.notEqual(safeRedirectSource(value), true);
  }
  assert.notEqual(safeRedirectTarget('/eski', '/eski'), true);
});
