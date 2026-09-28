import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

try { process.loadEnvFile('.env.local'); } catch {}

const canonical = process.env.CANONICAL_SITE_URL;
if (!canonical || new URL(canonical).protocol !== 'https:') {
  throw new Error('CANONICAL_SITE_URL HTTPS olarak ayarlanmalı.');
}

const port = Number(process.env.LIGHTHOUSE_PORT || 3100);
const baseURL = `http://127.0.0.1:${port}`;
// Kullanıcının hedefi "90 üzeri" olduğu için varsayılan kabul eşiği 91'dir.
const threshold = Number(process.env.LIGHTHOUSE_MIN_SCORE || 91);
const outputDirectory = path.resolve('test-results', 'lighthouse');
const productionEnvironment = {
  ...process.env,
  APP_ENV: 'production',
  SITE_URL: canonical,
  CANONICAL_SITE_URL: canonical,
  INDEXING_ENABLED: 'true',
};

const targets = [
  { route: '/', profile: 'mobile' },
  { route: '/', profile: 'desktop' },
  { route: '/uygulamalar', profile: 'mobile' },
  { route: '/bilgi-merkezi', profile: 'mobile' },
  { route: '/hizmetler/ozel-olcu-ayna', profile: 'mobile' },
];
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve(child) : reject(new Error(`${command} ${args.join(' ')} kod ${code} ile durdu.`)));
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(baseURL, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Production sunucusu zamanında başlamadı: ${baseURL}`);
}

await mkdir(outputDirectory, { recursive: true });
console.log('PageSpeed bütçesi için production ayarlarıyla derleme hazırlanıyor...');
await run(process.execPath, ['node_modules/next/dist/bin/next', 'build'], { env: productionEnvironment });

const server = spawn(process.execPath, [
  'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port),
], { env: productionEnvironment, stdio: 'inherit' });
let chrome;
let profileDirectory;
const failures = [];

try {
  await waitForServer();
  profileDirectory = await mkdtemp(path.join(tmpdir(), 'rina-lighthouse-'));
  chrome = await launch({
    chromePath: process.env.CHROME_PATH,
    userDataDir: profileDirectory,
    logLevel: 'error',
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-extensions'],
  });

  for (const target of targets) {
    const result = await lighthouse(`${baseURL}${target.route}`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: categories,
    }, target.profile === 'desktop' ? desktopConfig : undefined);
    if (!result) throw new Error(`Lighthouse raporu üretilemedi: ${target.route} (${target.profile})`);
    const safeRoute = target.route === '/' ? 'home' : target.route.slice(1).replaceAll('/', '-');
    await writeFile(path.join(outputDirectory, `${safeRoute}-${target.profile}.json`), result.report);
    const scores = Object.fromEntries(categories.map(category => [category, Math.round((result.lhr.categories[category]?.score ?? 0) * 100)]));
    console.log(`${target.profile.padEnd(7)} ${target.route.padEnd(36)} ${categories.map(category => `${category}=${scores[category]}`).join(' ')}`);
    for (const category of categories) {
      if (scores[category] < threshold) failures.push(`${target.route} ${target.profile} ${category}: ${scores[category]} < ${threshold}`);
    }
  }
} finally {
  if (chrome) await chrome.kill();
  server.kill('SIGTERM');
  if (profileDirectory) {
    await new Promise(resolve => setTimeout(resolve, 750));
    await rm(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }).catch(() => {});
  }
}

if (failures.length) {
  console.error(`PageSpeed bütçesi başarısız:\n- ${failures.join('\n- ')}`);
} else {
  console.log(`PageSpeed bütçesi geçti: tüm kategori puanları ${threshold} veya üzeri.`);
}
process.exit(failures.length ? 1 : 0);
