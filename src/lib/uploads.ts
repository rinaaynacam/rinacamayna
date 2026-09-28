import { APIError, type CollectionBeforeValidateHook, type PayloadRequest } from 'payload';
import sharp from 'sharp';

export const MAX_UPLOAD_BYTES = 4_000_000;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const MAX_IMAGE_EDGE = 10_000;

type ImageKind = 'jpeg' | 'png' | 'webp' | 'avif';

function startsWith(buffer: Buffer, signature: number[]) {
  return signature.every((byte, index) => buffer[index] === byte);
}

export function detectImageKind(buffer: Buffer): ImageKind | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp' && /(?:avif|avis)/.test(buffer.subarray(8, 40).toString('ascii'))) return 'avif';
  return null;
}

export function hasPDFSignature(buffer: Buffer) {
  const tail = buffer.subarray(Math.max(0, buffer.length - 1024)).toString('ascii');
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-' && tail.includes('%%EOF');
}

function uploadFile(req: PayloadRequest) {
  const file = req.file;
  if (!file) return null;
  if (!Buffer.isBuffer(file.data) || file.data.length === 0) {
    throw new APIError('Dosya içeriği güvenli biçimde doğrulanamadı.', 400, null, true);
  }
  if (file.size > MAX_UPLOAD_BYTES || file.data.length > MAX_UPLOAD_BYTES) {
    throw new APIError('Dosya en fazla 4 MB olabilir.', 413, null, true);
  }
  return file;
}

const mimeByKind: Record<ImageKind, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
};

async function sanitizeImage(req: PayloadRequest) {
  const file = uploadFile(req);
  if (!file) return;
  const kind = detectImageKind(file.data);
  if (!kind || mimeByKind[kind] !== file.mimetype) {
    throw new APIError('Dosyanın gerçek biçimi ile seçilen görsel türü uyuşmuyor.', 400, null, true);
  }

  let metadata;
  try {
    metadata = await sharp(file.data, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'warning' }).metadata();
  } catch {
    throw new APIError('Görsel bozuk, desteklenmiyor veya piksel sınırını aşıyor.', 400, null, true);
  }
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (!width || !height || width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE || width * height > MAX_IMAGE_PIXELS) {
    throw new APIError('Görsel en fazla 40 megapiksel ve bir kenarda 10.000 piksel olabilir.', 400, null, true);
  }

  let pipeline = sharp(file.data, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'warning' })
    .rotate()
    .resize({ width: 4096, height: 4096, fit: 'inside', withoutEnlargement: true });
  if (kind === 'jpeg') pipeline = pipeline.jpeg({ quality: 85, progressive: true });
  if (kind === 'png') pipeline = pipeline.png({ compressionLevel: 9 });
  if (kind === 'webp') pipeline = pipeline.webp({ quality: 85 });
  if (kind === 'avif') pipeline = pipeline.avif({ quality: 55, effort: 4 });

  // Sharp varsayılan olarak EXIF, XMP, ICC ve konum metadata'sını çıktıya taşımaz.
  const sanitized = await pipeline.toBuffer();
  if (sanitized.length > MAX_UPLOAD_BYTES) {
    throw new APIError('İşlenen görsel 4 MB sınırını aşıyor.', 413, null, true);
  }
  file.data = sanitized;
  file.size = sanitized.length;
}

export const validateAndSanitizeImageUpload: CollectionBeforeValidateHook = async ({ req }) => {
  await sanitizeImage(req);
};

export const validatePDFUpload: CollectionBeforeValidateHook = ({ req }) => {
  const file = uploadFile(req);
  if (!file) return;
  if (file.mimetype !== 'application/pdf' || !hasPDFSignature(file.data)) {
    throw new APIError('Yalnız gerçek PDF dosyaları yüklenebilir.', 400, null, true);
  }
};
