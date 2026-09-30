import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Storage } from '@payloadcms/storage-s3';
import { tr } from '@payloadcms/translations/languages/tr';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import { readEnvironment } from './lib/env.mjs';
import { adminOnly, adminField, signedIn } from './lib/access';
import { contentCollections } from './payload/collections';
import { siteGlobals } from './payload/globals';

const env = readEnvironment();
const dirname = path.dirname(fileURLToPath(import.meta.url));
const r2 = env.r2;
const r2Plugin = r2 ? s3Storage({
  enabled: true,
  bucket: r2.bucket,
  collections: {
    medyalar: {
      prefix: 'medyalar',
      disablePayloadAccessControl: true,
      generateFileURL: ({ filename, prefix }) => `${r2.publicURL}/${prefix ? `${prefix}/` : ''}${filename}`,
    },
    dosyalar: {
      prefix: 'dosyalar',
      disablePayloadAccessControl: true,
      generateFileURL: ({ filename, prefix }) => `${r2.publicURL}/${prefix ? `${prefix}/` : ''}${filename}`,
    },
  },
  config: {
    credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
    endpoint: r2.endpoint,
    forcePathStyle: true,
    region: 'auto',
  },
}) : null;
export default buildConfig({
  secret: env.secret,
  serverURL: env.siteURL,
  cors: [env.siteURL], csrf: [env.siteURL],
  graphQL: { disable: true },
  upload: {
    abortOnLimit: true,
    requestSizeLimit: 4_400_000,
    responseOnLimit: 'Yükleme isteği izin verilen boyutu aşıyor.',
    safeFileNames: true,
    preserveExtension: 5,
  },
  editor: lexicalEditor(),
  sharp,
  // Payload's default adapter logs email bodies; explicitly refuse all mail instead.
  email: () => ({ name: 'disabled', defaultFromAddress: '', defaultFromName: '',
    sendEmail: async () => { throw new Error('E-posta işlemleri kapalı.'); } }),
  i18n: { supportedLanguages: { tr }, fallbackLanguage: 'tr' },
  admin: {
    user: 'yoneticiler',
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' — Mebalci Yönetim' },
    components: {
      graphics: {
        Logo: '@/components/AdminBrand#AdminLogo',
        Icon: '@/components/AdminBrand#AdminIcon',
      },
    },
    theme: 'light',
  },
  db: postgresAdapter({ pool: { connectionString: env.databaseURL }, push: false, migrationDir: path.resolve(dirname, 'migrations') }),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  collections: [{
    slug: 'yoneticiler', labels: { singular: 'Yönetici', plural: 'Yöneticiler' },
    auth: {
      loginWithUsername: { allowEmailLogin: false, requireEmail: false },
      forgotPassword: { expiration: 0 },
      maxLoginAttempts: 5, lockTime: 900000, tokenExpiration: 3600,
      cookies: { secure: env.appEnv !== 'development', sameSite: 'Lax' },
    },
    admin: { useAsTitle: 'username', description: 'Panel kullanıcılarını ve yetkilerini yönetir. Yeni hesapları yalnız mevcut yönetici oluşturabilir.' },
    hooks: {
      beforeOperation: [({ operation }) => { if (operation === 'forgotPassword' || operation === 'resetPassword') throw new Error('Bu işlem kapalı.'); }],
      beforeChange: [({ data, operation, req, context }) => {
        if (operation === 'create' && req.user?.role !== 'admin' && context.operatorBootstrap !== true) throw new Error('Hesap yalnız yetkili kurulum komutuyla oluşturulabilir.');
        return data;
      }],
    },
    access: { create: adminOnly, read: signedIn, update: adminOnly, delete: () => false, admin: ({ req }) => Boolean(req.user) },
    fields: [{ name: 'email', type: 'email', required: false, admin: { hidden: true }, access: { read: () => false, create: () => false, update: () => false } },
      { name: 'role', label: 'Rol', type: 'select', required: true, defaultValue: 'editor',
      admin: { description: 'Yönetici yayınlama, onay, izin ve kullanıcı işlemlerini yapabilir. Editör yalnız taslak içerik hazırlayabilir.' },
      options: [{ label: 'Yönetici', value: 'admin' }, { label: 'Editör', value: 'editor' }], access: { update: adminField, create: adminField } }],
  }, ...contentCollections],
  globals: siteGlobals,
  plugins: r2Plugin ? [r2Plugin] : [],
});
