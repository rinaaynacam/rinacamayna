import type { Medyalar } from '@/payload-types';

export function mediaValue(value: number | Medyalar | null | undefined): Medyalar | null {
  return value && typeof value === 'object' && value.url ? value : null;
}

export function mediaPath(value: number | Medyalar | null | undefined): string | null {
  const image = mediaValue(value);
  if (!image?.url) return null;
  if (!image.url.startsWith('http')) return image.url;
  const parsed = new URL(image.url);
  return parsed.pathname.startsWith('/api/medyalar/file/') ? parsed.pathname : image.url;
}

function safeMediaPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('http')) return value;
  const parsed = new URL(value);
  return parsed.pathname.startsWith('/api/medyalar/file/') ? parsed.pathname : value;
}

export function absoluteMediaURL(value: number | Medyalar | null | undefined, origin: string): string | null {
  const path = mediaPath(value);
  return path ? new URL(path, origin).toString() : null;
}

export function CmsImage({ media, priority = false, sizes = '100vw', className = '' }: {
  media: number | Medyalar | null | undefined;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const image = mediaValue(media);
  if (!image?.url) return null;
  const src = mediaPath(image) as string;
  const candidates = [image.sizes?.kucuk, image.sizes?.buyuk, image]
    .map(candidate => ({ src: safeMediaPath(candidate?.url), width: candidate?.width ?? 0, bytes: candidate?.filesize ?? Number.MAX_SAFE_INTEGER }))
    .filter((candidate): candidate is { src: string; width: number; bytes: number } => Boolean(candidate.src && candidate.width))
    .sort((a, b) => a.width - b.width || a.bytes - b.bytes)
    .filter((candidate, index, list) => index === list.findIndex(item => item.width === candidate.width));
  const srcSet = candidates.map(candidate => `${candidate.src} ${candidate.width}w`).join(', ') || undefined;
  const loadingProps = priority ? { loading: 'eager' as const, fetchPriority: 'high' as const } : { loading: 'lazy' as const };
  // Payload creates the responsive derivatives at upload time. Serving them
  // directly avoids a second runtime transformation and remains host-independent.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} srcSet={srcSet} sizes={sizes} alt={image.alt} decoding="async"
    style={{ position: 'absolute', width: '100%', height: '100%', inset: 0 }} {...loadingProps} />;
}
