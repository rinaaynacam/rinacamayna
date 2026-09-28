import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const envPath = new URL('../.env.local', import.meta.url);
const text = await readFile(envPath, 'utf8');
if (!/^APP_ENV=development$/m.test(text) || !/^VERITABANI_URL=$/m.test(text)) throw new Error('Yalnız boş development DB ayarı hazırlanabilir.');
const password = randomBytes(32).toString('hex');
await writeFile(new URL('../.env.db', import.meta.url), `POSTGRES_PASSWORD=${password}\n`, { flag: 'wx', mode: 0o600 });
await writeFile(envPath, text.replace(/^VERITABANI_URL=$/m, `VERITABANI_URL=postgresql://rina:${password}@127.0.0.1:15432/rina_dev`), { mode: 0o600 });
console.log('Rina yerel DB ayarları hazırlandı. Gizli değerler yazdırılmadı.');

