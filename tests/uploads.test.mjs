import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import {
  detectImageKind,
  hasPDFSignature,
  MAX_IMAGE_PIXELS,
  MAX_UPLOAD_BYTES,
  validateAndSanitizeImageUpload,
  validatePDFUpload,
} from '../src/lib/uploads.ts';

test('Görsel türü MIME etiketinden bağımsız dosya imzasıyla bulunur', async () => {
  const [jpeg, webp] = await Promise.all([
    readFile('public/design-reference/partition.jpg'),
    readFile('public/design-reference/mirror.webp'),
  ]);
  assert.equal(detectImageKind(jpeg), 'jpeg');
  assert.equal(detectImageKind(webp), 'webp');
  assert.equal(detectImageKind(Buffer.from('<script>alert(1)</script>')), null);
  assert.equal(hasPDFSignature(Buffer.from('%PDF-1.7\n%%EOF')), true);
  assert.equal(hasPDFSignature(Buffer.from('%PDF-1.7\n')), false);
  assert.equal(hasPDFSignature(Buffer.from('<html>')), false);
});

test('Yüklenen görsel yeniden kodlanır ve EXIF metadata taşınmaz', async () => {
  const source = await sharp({ create: { width: 64, height: 48, channels: 3, background: '#ffffff' } })
    .jpeg()
    .withExif({ IFD0: { Copyright: 'gizli-metadata' } })
    .toBuffer();
  const req = { file: { data: source, mimetype: 'image/jpeg', name: 'test.jpg', size: source.length }, headers: new Headers() };
  await validateAndSanitizeImageUpload({ req });
  const metadata = await sharp(req.file.data).metadata();
  assert.equal(metadata.exif, undefined);
  assert.ok(req.file.size <= MAX_UPLOAD_BYTES);
});

test('Sahte MIME, bozuk PDF ve aşırı büyük dosya reddedilir', async () => {
  const fakeImage = { file: { data: Buffer.from('<svg onload=alert(1)>'), mimetype: 'image/jpeg', name: 'fake.jpg', size: 21 }, headers: new Headers() };
  await assert.rejects(validateAndSanitizeImageUpload({ req: fakeImage }), /gerçek biçimi/);
  const fakePDF = { file: { data: Buffer.from('<html>'), mimetype: 'application/pdf', name: 'fake.pdf', size: 6 }, headers: new Headers() };
  assert.throws(() => validatePDFUpload({ req: fakePDF }), /gerçek PDF/);
  const tooLarge = Buffer.alloc(MAX_UPLOAD_BYTES + 1);
  assert.throws(() => validatePDFUpload({ req: { file: { data: tooLarge, mimetype: 'application/pdf', name: 'large.pdf', size: tooLarge.length }, headers: new Headers() } }), /4 MB/);
  assert.equal(MAX_IMAGE_PIXELS, 40_000_000);
});
