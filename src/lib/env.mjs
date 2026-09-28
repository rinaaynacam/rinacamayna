const developmentCanonical = 'https://rinacamayna.com';

/** @param {string | undefined} value @param {string} [label] */
export function normalizeCanonical(value, label = 'CANONICAL_SITE_URL') {
  if (!value) throw new Error(`Eksik ortam ayarı: ${label}`);
  let parsed;
  try { parsed = new URL(value); }
  catch { throw new Error(`${label} geçerli bir URL olmalı.`); }
  if (parsed.protocol !== 'https:' || parsed.origin !== value || parsed.username || parsed.password) {
    throw new Error(`${label} yalnızca HTTPS origin olmalı.`);
  }
  return parsed.origin;
}

// Development and isolated unit tests retain the current domain. Production
// still fails closed through readEnvironment when the explicit env value is absent.
export const canonical = normalizeCanonical(process.env.CANONICAL_SITE_URL || developmentCanonical);

/** @param {Record<string, string | undefined>} source */
export function readEnvironment(source = process.env) {
  const required = ['APP_ENV', 'SITE_URL', 'CANONICAL_SITE_URL', 'VERITABANI_URL', 'PAYLOAD_GIZLI_ANAHTAR'];
  for (const key of required) if (!source[key]) throw new Error(`Eksik ortam ayarı: ${key}`);
  if (!['development', 'preview', 'production'].includes(source.APP_ENV)) throw new Error('APP_ENV geçersiz.');
  const canonicalURL = normalizeCanonical(source.CANONICAL_SITE_URL);
  if (source.PAYLOAD_GIZLI_ANAHTAR.length < 48) throw new Error('PAYLOAD_GIZLI_ANAHTAR en az 48 karakter olmalı.');
  let site, database;
  try { site = new URL(source.SITE_URL); database = new URL(source.VERITABANI_URL); }
  catch { throw new Error('Site veya veritabanı URL biçimi geçersiz.'); }
  if (!['postgres:', 'postgresql:'].includes(database.protocol)) throw new Error('PostgreSQL bağlantısı gerekli.');
  if (!['http:', 'https:'].includes(site.protocol) || site.origin !== source.SITE_URL) throw new Error('SITE_URL yalnız origin olmalı.');
  if (source.APP_ENV === 'production' && site.origin !== canonicalURL) throw new Error('Üretimde SITE_URL ve CANONICAL_SITE_URL aynı olmalı.');
  if (source.APP_ENV !== 'development' && site.protocol !== 'https:') throw new Error('HTTPS gerekli.');
  const mediaStorage = source.MEDYA_DEPOLAMA || 'local';
  if (!['local', 'r2'].includes(mediaStorage)) throw new Error('MEDYA_DEPOLAMA local veya r2 olmalı.');
  let r2;
  if (mediaStorage === 'r2') {
    const keys = ['R2_HESAP_ID', 'R2_KOVA_ADI', 'R2_ERISIM_ANAHTARI', 'R2_GIZLI_ANAHTAR', 'MEDYA_PUBLIC_URL'];
    for (const key of keys) if (!source[key]) throw new Error(`R2 için eksik ortam ayarı: ${key}`);
    const accountId = /** @type {string} */ (source.R2_HESAP_ID);
    const bucket = /** @type {string} */ (source.R2_KOVA_ADI);
    const publicURL = normalizeCanonical(source.MEDYA_PUBLIC_URL, 'MEDYA_PUBLIC_URL');
    if (!/^[a-f0-9]{32}$/i.test(accountId)) throw new Error('R2_HESAP_ID biçimi geçersiz.');
    if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error('R2_KOVA_ADI biçimi geçersiz.');
    r2 = {
      accountId,
      bucket,
      accessKeyId: /** @type {string} */ (source.R2_ERISIM_ANAHTARI),
      secretAccessKey: /** @type {string} */ (source.R2_GIZLI_ANAHTAR),
      publicURL,
      endpoint: `https://${source.R2_HESAP_ID}.r2.cloudflarestorage.com`,
    };
  }
  return {
    appEnv: source.APP_ENV,
    siteURL: site.origin,
    canonicalURL,
    databaseURL: source.VERITABANI_URL,
    secret: /** @type {string} */ (source.PAYLOAD_GIZLI_ANAHTAR),
    indexing: source.APP_ENV === 'production' && source.INDEXING_ENABLED === 'true',
    mediaStorage,
    r2,
  };
}
