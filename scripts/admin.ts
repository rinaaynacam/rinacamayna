import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { getPayload } from 'payload';
import config from '../src/payload.config';
if (process.env.APP_ENV !== 'development') throw new Error('Bu ilk kurulum komutu yalnız yerel geliştirme içindir.');
const reset = process.argv.includes('--reset');
const username = process.env.RINA_ADMIN_USERNAME || 'rina-admin';
const payload = await getPayload({ config });
try {
  const accounts = await payload.find({ collection: 'yoneticiler', overrideAccess: true, limit: 1 });
  if (accounts.totalDocs && !reset) {
    console.log('Yönetici zaten var; hesap ve parola korundu.');
  } else {
    const password = randomBytes(30).toString('base64url');
    const file = reset ? '.env.admin-recovery' : '.env.admin';
    // Write once before mutation: a failed run cannot overwrite an operator credential.
    await writeFile(file, `RINA_ADMIN_USERNAME=${username}\nRINA_ADMIN_PASSWORD=${password}\n`, { flag: 'wx', mode: 0o600 });
    if (reset) {
      const users = await payload.find({ collection: 'yoneticiler', overrideAccess: true, where: { username: { equals: username } }, limit: 1 });
      if (!users.docs.length) throw new Error('Kurtarılacak yönetici bulunamadı.');
      await payload.update({ collection: 'yoneticiler', id: users.docs[0].id, overrideAccess: true,
        data: { password, sessions: [], loginAttempts: 0, lockUntil: null } });
    } else await payload.create({ collection: 'yoneticiler', overrideAccess: true, context: { operatorBootstrap: true }, data: { username, password, role: 'admin' } });
    console.log(`Yerel yönetici ${reset ? 'kurtarıldı' : 'oluşturuldu'}. Bilgiler yalnız ${file} dosyasında; Git ve loglarda yok.`);
  }
} finally { await payload.destroy(); }
process.exit(0);
