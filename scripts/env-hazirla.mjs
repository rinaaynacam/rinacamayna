import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const template = new URL('../.env.example', import.meta.url);
const destination = new URL('../.env.local', import.meta.url);
const source = await readFile(template, 'utf8');
const result = source.replace(/^PAYLOAD_GIZLI_ANAHTAR=$/m, `PAYLOAD_GIZLI_ANAHTAR=${randomBytes(48).toString('hex')}`);

try {
  await writeFile(destination, result, { flag: 'wx', mode: 0o600 });
  console.log(`${fileURLToPath(destination)} oluşturuldu. VERITABANI_URL alanını yerel Rina bağlantısıyla doldurun.`);
} catch (error) {
  if (error?.code === 'EEXIST') {
    console.error('.env.local zaten var; korunuyor. Var olan ayarları kendiniz kontrol edin.');
    process.exitCode = 1;
  } else {
    console.error('Yerel ortam dosyası oluşturulamadı. Dosya yazma iznini kontrol edin.');
    process.exitCode = 1;
  }
}
