import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { getPayload } from 'payload';
import config from '../src/payload.config';

const production = process.argv.includes('--production');
const isDevelopment = process.env.APP_ENV === 'development';

if (production === isDevelopment) {
  throw new Error(
    production
      ? 'Production yönetici kurulumu development ortamında çalıştırılamaz.'
      : 'Development dışındaki ortamlar için açıkça --production kullanın.',
  );
}

const reset = process.argv.includes('--reset');
const username = (process.env.RINA_ADMIN_USERNAME || (production ? '' : 'rina-admin')).trim();
const configuredPassword = process.env.RINA_ADMIN_PASSWORD;

if (!/^[a-z0-9][a-z0-9._-]{2,63}$/i.test(username)) {
  throw new Error('Yönetici kullanıcı adı 3-64 karakter olmalı ve yalnız harf, rakam, nokta, tire veya alt çizgi içermelidir.');
}

if (production && (!configuredPassword || configuredPassword.length < 20)) {
  throw new Error('Production yönetici parolası RINA_ADMIN_PASSWORD içinde en az 20 karakter olmalıdır.');
}

const payload = await getPayload({ config });
try {
  const accounts = await payload.find({ collection: 'yoneticiler', overrideAccess: true, limit: 1 });
  if (accounts.totalDocs && !reset) {
    console.log('Yönetici zaten var; hesap ve parola korundu.');
  } else {
    const password = production ? configuredPassword! : randomBytes(30).toString('base64url');
    const file = reset ? '.env.admin-recovery' : '.env.admin';
    if (!production) {
      // Write once before mutation: a failed run cannot overwrite an operator credential.
      await writeFile(file, `RINA_ADMIN_USERNAME=${username}\nRINA_ADMIN_PASSWORD=${password}\n`, { flag: 'wx', mode: 0o600 });
    }
    if (reset) {
      const users = await payload.find({ collection: 'yoneticiler', overrideAccess: true, where: { username: { equals: username } }, limit: 1 });
      if (!users.docs.length) throw new Error('Kurtarılacak yönetici bulunamadı.');
      await payload.update({ collection: 'yoneticiler', id: users.docs[0].id, overrideAccess: true,
        data: { password, sessions: [], loginAttempts: 0, lockUntil: null } });
    } else await payload.create({ collection: 'yoneticiler', overrideAccess: true, context: { operatorBootstrap: true }, data: { username, password, role: 'admin' } });
    console.log(
      production
        ? `Production yöneticisi ${reset ? 'kurtarıldı' : 'oluşturuldu'}. Kimlik bilgileri loglanmadı.`
        : `Yerel yönetici ${reset ? 'kurtarıldı' : 'oluşturuldu'}. Bilgiler yalnız ${file} dosyasında; Git ve loglarda yok.`,
    );
  }
} finally { await payload.destroy(); }
process.exit(0);
