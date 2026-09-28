export function securityHeaders(source = process.env) {
  const production = source.APP_ENV === 'production';
  let mediaOrigin = '';
  if (source.MEDYA_DEPOLAMA === 'r2' && source.MEDYA_PUBLIC_URL) {
    try {
      const candidate = new URL(source.MEDYA_PUBLIC_URL);
      if (candidate.protocol === 'https:' && candidate.origin === source.MEDYA_PUBLIC_URL) mediaOrigin = candidate.origin;
    } catch {
      // Ortam şeması geçersiz URL'yi ayrıca reddeder; CSP içine ham değer alınmaz.
    }
  }
  const headers = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  ];

  if (production) {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https://www.google-analytics.com${mediaOrigin ? ` ${mediaOrigin}` : ''}`,
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "frame-src 'self'",
      "manifest-src 'self'",
    ].join('; ');
    headers.push(
      { key: 'Content-Security-Policy', value: csp },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    );
  }

  if (!production || source.INDEXING_ENABLED !== 'true') {
    headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
  }
  return headers;
}
