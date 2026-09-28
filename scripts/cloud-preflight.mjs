import { readEnvironment } from '../src/lib/env.mjs';

const env = readEnvironment();
if (env.appEnv !== 'production') throw new Error('Bulut ön kontrolü APP_ENV=production gerektirir.');
if (!env.r2) throw new Error('Bulut yayınında MEDYA_DEPOLAMA=r2 ve bütün R2 ayarları gerekli.');

const database = new URL(env.databaseURL);
if (!database.hostname.endsWith('.neon.tech')) throw new Error('Ücretsiz bulut planı için Neon PostgreSQL bağlantısı gerekli.');
if (!database.searchParams.has('sslmode')) throw new Error('Neon bağlantısında sslmode parametresi gerekli.');

console.log('Bulut ön kontrolü geçti: Netlify production ortamı, Neon PostgreSQL ve Cloudflare R2 ayarları biçimsel olarak hazır.');
