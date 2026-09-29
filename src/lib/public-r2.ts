import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readEnvironment } from './env.mjs';

type PublicPrefix = 'medyalar' | 'dosyalar';

let client: S3Client | undefined;

function r2Client() {
  const env = readEnvironment();
  if (!env.r2) return null;
  client ??= new S3Client({
    credentials: {
      accessKeyId: env.r2.accessKeyId,
      secretAccessKey: env.r2.secretAccessKey,
    },
    endpoint: env.r2.endpoint,
    forcePathStyle: true,
    region: 'auto',
  });
  return { client, bucket: env.r2.bucket };
}

function objectKey(prefix: PublicPrefix, segments: string[]) {
  if (!segments.length) return null;
  const safe = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
  if (segments.some((segment) => !safe.test(segment) || segment === '.' || segment === '..')) return null;
  return `${prefix}/${segments.join('/')}`;
}

function notFound() {
  return new Response('Dosya bulunamadı.', {
    status: 404,
    headers: { 'Cache-Control': 'public, max-age=60', 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function servePublicR2Object(
  request: Request,
  prefix: PublicPrefix,
  segments: string[],
  headOnly = false,
) {
  const key = objectKey(prefix, segments);
  const storage = r2Client();
  if (!key || !storage) return notFound();

  try {
    const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: key }));
    if (!object.Body) return notFound();

    const headers = new Headers({
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800',
      'Content-Type': object.ContentType || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    if (object.ContentLength !== undefined) headers.set('Content-Length', String(object.ContentLength));
    if (object.ETag) headers.set('ETag', object.ETag);
    if (object.LastModified) headers.set('Last-Modified', object.LastModified.toUTCString());
    if (prefix === 'dosyalar') {
      headers.set('Content-Disposition', `attachment; filename="${segments.at(-1)}"`);
      headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
    }

    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch && object.ETag && ifNoneMatch === object.ETag) {
      await object.Body.transformToWebStream().cancel();
      return new Response(null, { status: 304, headers });
    }

    return new Response(headOnly ? null : object.Body.transformToWebStream(), { status: 200, headers });
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return notFound();
    return new Response('Dosya geçici olarak kullanılamıyor.', {
      status: 502,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
