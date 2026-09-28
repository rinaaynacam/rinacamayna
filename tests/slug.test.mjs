import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug } from '../src/payload/fields.ts';

test('Türkçe başlık güvenli URL kısa adına dönüşür', () => {
  assert.equal(createSlug('Ev ve Yaşam Alanları'), 'ev-ve-yasam-alanlari');
  assert.equal(createSlug('Özel Ölçü / İç Mekân'), 'ozel-olcu-ic-mekan');
  assert.equal(createSlug('  Duş Camı & Ayna  '), 'dus-cami-ayna');
});
