import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const credentials = Object.fromEntries(readFileSync('.env.admin', 'utf8').trim().split(/\r?\n/).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
const localEnvironment = Object.fromEntries(readFileSync('.env.local', 'utf8').trim().split(/\r?\n/)
  .filter(line => line && !line.startsWith('#')).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
const canonicalSiteURL = localEnvironment.CANONICAL_SITE_URL;
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.startsWith('Aktif kampanyalardan biri popup olur')) return;
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const closeCampaign = () => document.querySelectorAll<HTMLDialogElement>('dialog.campaign-popup[open]')
        .forEach(dialog => dialog.close());
      new MutationObserver(closeCampaign).observe(document.body, { attributes: true, childList: true, subtree: true });
      closeCampaign();
    });
  });
});
test('Anonim erişim, kapalı kayıt ve parola kurtarma', async ({ request }) => {
  expect((await request.get('/api/yoneticiler')).status()).toBe(403);
  expect((await request.post('/api/globals/iletisim_bilgileri', { data: { cta_etiketi: 'Yetkisiz' } })).status()).toBe(403);
  for (const path of ['first-register', 'forgot-password', 'reset-password']) {
    expect((await request.post(`/api/yoneticiler/${path}`, { data: {} })).status()).toBe(404);
  }
  const response = await request.get('/api/public-settings');
  expect(response.status()).toBe(200);
  expect(Object.keys(await response.json()).sort()).toEqual(['greeting','label','message','number','quoteLabel']);
});
test('CMS numara güncellemesi tüm CTA ve açık formda kullanılır; geçersiz numara reddedilir', async ({ page, request }) => {
  const login = await request.post('/api/yoneticiler/login', { data: { username: credentials.RINA_ADMIN_USERNAME, password: credentials.RINA_ADMIN_PASSWORD } });
  expect(login.ok()).toBeTruthy();
  const token = (await login.json()).token;
  const auth = { Authorization: `JWT ${token}` };
  const original = await (await request.get('/api/globals/iletisim_bilgileri')).json();
  const originalNumber = original.whatsapp_numarasi;
  await page.goto('/');
  const testNumber = '905550000000';
  try {
    expect((await request.post('/api/globals/iletisim_bilgileri', { headers: auth, data: { whatsapp_numarasi: 'javascript:alert(1)' } })).status()).toBe(400);
    expect((await request.post('/api/globals/iletisim_bilgileri', { headers: auth, data: { whatsapp_numarasi: testNumber } })).ok()).toBeTruthy();
    await page.getByRole('button', { name: 'Mesajı hazırla' }).click();
    const preview = page.getByRole('region', { name: 'Mesaj önizlemesi' });
    await expect(preview.getByRole('link')).toHaveAttribute('href', new RegExp(testNumber));
    await expect(preview.getByRole('textbox')).toHaveValue(/İhtiyacımı ve ölçüleri birlikte/);
    await page.reload();
    const links = page.locator('a[href^="https://wa.me/"]');
    expect(await links.count()).toBeGreaterThanOrEqual(5);
    for (const link of await links.all()) await expect(link).toHaveAttribute('href', new RegExp(testNumber));
  } finally {
    expect((await request.post('/api/globals/iletisim_bilgileri', { headers: auth, data: { whatsapp_numarasi: originalNumber } })).ok()).toBeTruthy();
  }
});

test('Sitemap, robots, security headers and JSON-LD only expose publishable content', async ({ request }) => {
  const login = await request.post('/api/yoneticiler/login', { data: { username: credentials.RINA_ADMIN_USERNAME, password: credentials.RINA_ADMIN_PASSWORD } });
  expect(login.ok()).toBeTruthy();
  const headers = { Authorization: `JWT ${(await login.json()).token}` };
  const suffix = Date.now();
  const created: Array<{ collection: string; id: number }> = [];

  try {
    const records = [
      { ad: `Taslak sitemap kontrolu ${suffix}`, slug: `taslak-sitemap-${suffix}`, indekslenebilir: true, status: 'draft' },
      { ad: `Noindex sitemap kontrolu ${suffix}`, slug: `noindex-sitemap-${suffix}`, indekslenebilir: false, status: 'published' },
    ];
    for (const record of records) {
      const response = await request.post('/api/hizmetler', { headers, data: {
        ad: record.ad,
        slug: record.slug,
        ozet: 'Sitemap yayin ve indeksleme filtresi icin gecici kabul kaydi.',
        sira: 999,
        seo: { indekslenebilir: record.indekslenebilir },
        _status: record.status,
      } });
      expect(response.ok(), record.slug).toBeTruthy();
      created.push({ collection: 'hizmetler', id: (await response.json()).doc.id });
    }

    const sitemapResponse = await request.get('/sitemap.xml');
    expect(sitemapResponse.status()).toBe(200);
    const sitemap = await sitemapResponse.text();
    expect(sitemap).toContain(`${canonicalSiteURL}/`);
    expect(sitemap).toContain(`${canonicalSiteURL}/hizmetler/ozel-olcu-ayna`);
    expect(sitemap).not.toContain(records[0].slug);
    expect(sitemap).not.toContain(records[1].slug);
    expect(sitemap).not.toMatch(/rinacamayna\.com\/(admin|api|kampanyalar)/);
    for (const location of [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])) {
      expect(new URL(location).origin).toBe(canonicalSiteURL);
    }
    expect([...sitemap.matchAll(/<loc>/g)].length).toBe([...sitemap.matchAll(/<lastmod>/g)].length);

    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Disallow: /');

    const llms = await request.get('/llms.txt');
    expect(llms.status()).toBe(200);
    expect(llms.headers()['content-type']).toContain('text/plain');
    const llmsText = await llms.text();
    expect(llmsText).toContain('# Rina Cam & Ayna');
    expect(llmsText).toContain(`${canonicalSiteURL}/hizmetler/ozel-olcu-ayna`);
    expect(llmsText).not.toContain(records[0].slug);
    expect(llmsText).not.toContain(records[1].slug);

    const home = await request.get('/');
    expect(home.status()).toBe(200);
    expect(home.headers()['x-content-type-options']).toBe('nosniff');
    expect(home.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(home.headers()['permissions-policy']).toContain('camera=()');
    expect(home.headers()['x-robots-tag']).toContain('noindex');
    const homeHtml = await home.text();
    expect(homeHtml).toContain('application/ld+json');
    expect(homeHtml).toContain('LocalBusiness');
    expect(homeHtml).toContain('905422313069');
    expect(homeHtml).not.toContain('mailto:');

    const service = await request.get('/hizmetler/ozel-olcu-ayna');
    expect(service.status()).toBe(200);
    const serviceHtml = await service.text();
    expect(serviceHtml).toContain('Service');
    expect(serviceHtml).toContain(`${canonicalSiteURL}/hizmetler/ozel-olcu-ayna`);
  } finally {
    for (const item of created.reverse()) {
      expect((await request.delete(`/api/${item.collection}/${item.id}`, { headers })).ok()).toBeTruthy();
    }
  }
});
test('Form hatada metni korur, ölçü ve Türkçe önizleme çalışır', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('form', { name: 'WhatsApp teklif mesajı hazırlama formu' })).toBeVisible();
  await page.getByLabel('İhtiyacınız / ek not').fill('Ev için ayna & cam?');
  await page.route('**/api/public-settings', route => route.fulfill({ status: 503, body: '{}' }));
  await page.getByRole('button', { name: 'Mesajı hazırla' }).click();
  await expect(page.locator('form [role="alert"]')).toContainText('Metniniz korunuyor');
  await expect(page.getByLabel('İhtiyacınız / ek not')).toHaveValue('Ev için ayna & cam?');
  await page.unroute('**/api/public-settings');
  await page.getByLabel('İlçe', { exact: false }).selectOption('Çankaya');
  await page.getByRole('button', { name: /Ürün ve ölçü ekle/ }).click();
  await page.getByLabel('Ürün / model').fill('Duvar aynası');
  await page.getByLabel('En', { exact: true }).fill('1,5');
  await page.getByRole('button', { name: 'Mesajı hazırla' }).click();
  await expect(page.locator('form [role="alert"]')).toContainText('En ve boy birlikte');
  await page.getByLabel('Boy', { exact: true }).fill('80');
  await page.getByLabel('Birim').selectOption('cm');
  await page.getByRole('button', { name: 'Mesajı hazırla' }).click();
  await expect(page.getByLabel('Hazırlanan mesaj')).toHaveValue(/1,5 × 80 cm/);
  await expect(page.getByLabel('Hazırlanan mesaj')).toHaveValue(/Çankaya/);
  await page.screenshot({ path: 'test-results/quote-desktop.png', fullPage: true });
});
test('320–1920 px taşma ve ilk ekran kontrolü', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.hero-media img')).toHaveAttribute('src', /mirror(?:-480)?\.webp/);
  await expect(page.locator('.hero-media img')).toHaveAttribute('srcset', /\s\d+w/);
  await expect(page.locator('.hero-measure')).toContainText('3200 MM');
  await expect(page.locator('.media-caption')).toContainText('Özel ölçü · İç mekân');
  await expect(page.getByText('CAMIN ŞEFFAFLIĞI', { exact: false })).toBeVisible();
  await expect(page.getByText('WHATSAPP’TAN FOTOĞRAF EKLEYİN')).toHaveCount(0);
  await expect(page.locator('nav a', { hasText: 'SEÇİLİ İŞLER' })).toHaveAttribute('href', '/uygulamalar');
  await expect(page.locator('#bolgeler')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
  const firstService = page.locator('.service-row').first();
  const restingColor = await firstService.evaluate(element => getComputedStyle(element).backgroundColor);
  await firstService.hover();
  expect(await firstService.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(restingColor);
  for (const width of [320,375,390,680,768,960,1024,1100,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('body *')]
      .filter(element => element.getBoundingClientRect().right > window.innerWidth + 1)
      .map(element => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) }))
      .slice(0, 8));
    expect(overflow, `${width}px genişlikte taşan öğeler`).toEqual([]);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const selectedHeading = page.locator('.selected-work .section-heading');
  const [labelBox, titleBox, descriptionBox] = await Promise.all([
    selectedHeading.locator('.eyebrow').boundingBox(),
    selectedHeading.locator('h2').boundingBox(),
    selectedHeading.locator('p').last().boundingBox(),
  ]);
  expect(labelBox && titleBox && labelBox.y < titleBox.y).toBeTruthy();
  expect(descriptionBox && titleBox && descriptionBox.x > titleBox.x).toBeTruthy();
  await selectedHeading.screenshot({ path: 'test-results/selected-work-heading.png' });
  expect(errors).toEqual([]);
});

test('Seçili işler ana sayfada kalır, tüm yayınlanmış görseller galeri sayfasında açılır', async ({ page, request }) => {
  type ServiceRef = { slug?: string; ad?: string };
  type ApplicationRef = { _status?: string; gorseller?: unknown[]; hizmetler?: Array<number | ServiceRef> };
  const applicationResponse = await request.get('/api/uygulamalar?limit=100&sort=sira&depth=1');
  expect(applicationResponse.ok()).toBeTruthy();
  const data = await applicationResponse.json();
  const published = (data.docs as ApplicationRef[]).filter(application => application._status === 'published');
  const imageCount = published.reduce((total, application) => total + (application.gorseller?.length ?? 0), 0);

  await page.goto('/');
  const selectedCount = await page.locator('.work-item').count();
  expect(selectedCount).toBeGreaterThan(0);
  expect(selectedCount).toBeLessThanOrEqual(published.length);
  await page.locator('nav a', { hasText: 'SEÇİLİ İŞLER' }).click();
  await expect(page).toHaveURL(/\/uygulamalar$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('UYGULAMALARI');
  await expect(page.locator('.application-gallery-card')).toHaveCount(imageCount);
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon\.svg|\/api\/medyalar\/file\//);
  const galleryImages = page.locator('.application-gallery-image img');
  await expect(galleryImages).toHaveCount(imageCount);
  for (const image of await galleryImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }

  const categories = new Map<string, string>();
  for (const application of published) for (const service of application.hizmetler ?? []) {
    if (typeof service === 'object' && service.slug && service.ad) categories.set(service.slug, service.ad);
  }
  expect(categories.size).toBeGreaterThan(0);
  const [categorySlug, categoryName] = [...categories][0];
  const filteredImageCount = published
    .filter(application => application.hizmetler?.some(service => typeof service === 'object' && service.slug === categorySlug))
    .reduce((total, application) => total + (application.gorseller?.length ?? 0), 0);
  await page.getByRole('link', { name: categoryName, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`kategori=${categorySlug}`));
  await expect(page.getByRole('link', { name: categoryName, exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.application-gallery-card')).toHaveCount(filteredImageCount);
  await page.getByRole('link', { name: 'Tümü', exact: true }).click();
  await expect(page.locator('.application-gallery-card')).toHaveCount(imageCount);

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('body *')]
      .filter(element => element.getBoundingClientRect().right > window.innerWidth + 1)
      .map(element => ({ tag: element.tagName, className: element.className }))
      .slice(0, 8));
    expect(overflow, `/uygulamalar ${width}px genişlikte taşan öğeler`).toEqual([]);
    if (width === 320) {
      const filterSizes = await page.locator('.application-filters a').evaluateAll(elements => elements.map(element => {
        const box = element.getBoundingClientRect();
        return { width: Math.round(box.width), height: Math.round(box.height) };
      }));
      expect(filterSizes.every(size => size.width === 320 && size.height >= 56)).toBeTruthy();
      await page.locator('.application-filters').screenshot({ path: 'test-results/applications-filters-320.png' });
    }
  }
  await page.screenshot({ path: 'test-results/applications-1440.png', fullPage: true });
});

test('Uzun sayfa görselleri responsive ve lazy yüklenir; koyu bölümler görünürken hafifçe açılır', async ({ page }) => {
  await page.goto('/uygulamalar');
  const galleryImages = page.locator('.application-gallery-image img');
  expect(await galleryImages.count()).toBeGreaterThan(2);
  await expect(galleryImages.nth(1)).toHaveAttribute('loading', 'lazy');
  await expect(galleryImages.nth(1)).toHaveAttribute('sizes', /(100vw|50vw|33vw)/);
  await expect(galleryImages.nth(1)).toHaveAttribute('srcset', /(?:[?&]w=\d+|\s\d+w)/);

  await page.goto('/bilgi-merkezi');
  const hubImage = page.locator('.usage-card-image img').first();
  await expect(hubImage).toHaveAttribute('loading', 'lazy');
  await expect(hubImage).toHaveAttribute('srcset', /(?:[?&]w=\d+|\s\d+w)/);
  const hubReveal = page.locator('#rehberler[data-motion-reveal="true"]');
  await expect(hubReveal).toHaveCount(1);
  await hubReveal.scrollIntoViewIfNeeded();
  await expect.poll(() => hubReveal.evaluate(element => getComputedStyle(element).opacity)).toBe('1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const homeReveal = page.locator('#isler[data-motion-reveal="true"]');
  await expect(homeReveal).toHaveCount(1);
  expect(await homeReveal.evaluate(element => getComputedStyle(element).opacity)).not.toBe('0.35');
});

test('İçerik adresi başlıktan otomatik üretilir ve panelde URL girişi istenmez', async ({ page, request }) => {
  const login = await request.post('/api/yoneticiler/login', { data: { username: credentials.RINA_ADMIN_USERNAME, password: credentials.RINA_ADMIN_PASSWORD } });
  expect(login.ok()).toBeTruthy();
  const token = (await login.json()).token;
  const headers = { Authorization: `JWT ${token}` };
  let createdID: number | null = null;
  const uniqueTitle = `URL Otomasyon Kontrolü ${Date.now()}`;
  try {
    const response = await request.post('/api/kullanim_alanlari', { headers, data: {
      ad: uniqueTitle,
      ozet: 'Otomatik URL üretimini doğrulamak için geçici kayıt.',
      _status: 'draft',
    } });
    expect(response.ok()).toBeTruthy();
    const created = await response.json();
    createdID = created.doc.id;
    expect(created.doc.slug).toMatch(/^url-otomasyon-kontrolu-\d+$/);

    await page.goto('/admin/collections/kullanim_alanlari/create');
    await expect(page.getByLabel('Sayfa adresi (otomatik)')).toHaveCount(0);
  } finally {
    if (createdID !== null) expect((await request.delete(`/api/kullanim_alanlari/${createdID}`, { headers })).ok()).toBeTruthy();
  }
});

test('Site renkleri panelden değiştirilir ve güvenli HEX olarak uygulanır', async ({ page, request }) => {
  const login = await request.post('/api/yoneticiler/login', { data: { username: credentials.RINA_ADMIN_USERNAME, password: credentials.RINA_ADMIN_PASSWORD } });
  expect(login.ok()).toBeTruthy();
  const headers = { Authorization: `JWT ${(await login.json()).token}` };
  const original = await (await request.get('/api/globals/site_ayarlari')).json();
  const originalColors = original.renkler;
  const testColors = { ...originalColors, zemin: '#f1f0ea', vurgu: '#00aa88' };

  try {
    const invalid = await request.post('/api/globals/site_ayarlari', { headers, data: { renkler: { ...testColors, vurgu: 'red; background:black' } } });
    expect(invalid.status()).toBe(400);
    expect((await request.post('/api/globals/site_ayarlari', { headers, data: { renkler: testColors } })).ok()).toBeTruthy();
    await page.goto('/');
    const colors = await page.locator('body').evaluate(element => ({
      paper: getComputedStyle(element).getPropertyValue('--paper').trim(),
      accent: getComputedStyle(element).getPropertyValue('--accent').trim(),
    }));
    expect(colors).toEqual({ paper: '#f1f0ea', accent: '#00aa88' });

    await page.goto('/admin/login');
    await page.getByLabel('Kullanıcı adı').fill(credentials.RINA_ADMIN_USERNAME);
    await page.getByLabel('Parola', { exact: true }).fill(credentials.RINA_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/globals/site_ayarlari');
    await expect(page.getByLabel('Ana zemin rengi')).toBeVisible();
    await expect(page.getByLabel('Vurgu ve düğme rengi')).toBeVisible();
  } finally {
    expect((await request.post('/api/globals/site_ayarlari', { headers, data: { renkler: originalColors } })).ok()).toBeTruthy();
  }
});
test('E-postasız giriş ekranı, gerçek 404 ve noindex', async ({ page, request }) => {
  await page.goto('/admin/login');
  await expect(page.getByLabel('Kullanıcı adı')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.locator('a[href*="forgot"]')).toHaveCount(0);
  await page.getByLabel('Kullanıcı adı').fill(credentials.RINA_ADMIN_USERNAME);
  await page.getByLabel('Parola', { exact: true }).fill(credentials.RINA_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Giriş yap', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  for (const label of ['Hizmetler', 'Gerçek uygulamalar', 'Medyalar', 'Ana sayfa içeriği']) {
    await expect(page.getByRole('heading', { name: label, exact: true, level: 3 })).toBeVisible();
  }
  await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
  await page.goto('/admin/globals/site_ayarlari');
  await expect(page.getByText('Seçildiğinde sitenin sol üst ve alt bölümündeki yazının yerini alır.', { exact: false })).toBeVisible();
  await page.goto('/admin/globals/ana_sayfa_icerigi');
  await expect(page.getByText('Ana sayfanın ilk ekranında sağdaki büyük görsel alanını değiştirir.', { exact: false })).toBeVisible();
  await page.goto('/admin/collections/hizmetler/create');
  await expect(page.getByLabel('İşletme doğrulaması')).toHaveCount(0);
  await expect(page.getByLabel('Onaylayan yetkili')).toHaveCount(0);
  await expect(page.getByText('Hizmet liste satırında ve hizmet detay sayfasının üst görsel alanında kullanılır.', { exact: false })).toBeVisible();
  await page.screenshot({ path: 'test-results/admin-field-help.png', fullPage: true });
  await page.goto('/admin/collections/uygulamalar/create');
  await expect(page.getByText('Kategori / ilgili hizmetler', { exact: true })).toBeVisible();
  await page.goto('/admin/globals/iletisim_bilgileri');
  await expect(page.getByLabel('WhatsApp numarası', { exact: false })).toHaveValue('905422313069');
  expect((await request.get('/olmayan-sayfa')).status()).toBe(404);
  expect((await request.get('/')).headers()['x-robots-tag']).toContain('noindex');
});

test('Hizmet ve bölge sayfaları yalnız yayınlanabilir CMS verisini gösterir', async ({ page, request }) => {
  expect((await request.get('/api/globals/ana_sayfa_icerigi?draft=true')).status()).toBe(403);
  const serviceResponse = await request.get('/api/hizmetler?limit=100&sort=sira');
  expect(serviceResponse.ok()).toBeTruthy();
  const serviceData = await serviceResponse.json();
  for (const service of serviceData.docs) {
    expect(service._status).toBe('published');
  }

  await page.goto('/hizmetler');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('CAM VE AYNA');
  await expect(page.locator('.index-row')).toHaveCount(serviceData.docs.length);
  if (serviceData.docs.length === 0) await expect(page.getByText('Doğrulanmış hizmet kayıtları hazırlanıyor.')).toBeVisible();
  expect((await request.get('/hizmetler/yayinlanmamis-test-kaydi')).status()).toBe(404);

  await page.goto('/hizmet-bolgeleri');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('KOŞULLARI BİRLİKTE');
  await expect(page.locator('.district-index article')).toHaveCount(25);
  await expect(page.locator('.district-index a')).toHaveCount(0);

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/hizmetler', '/hizmet-bolgeleri']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('body *')]
        .filter(element => element.getBoundingClientRect().right > window.innerWidth + 1)
        .map(element => ({ tag: element.tagName, className: element.className }))
        .slice(0, 8));
      expect(overflow, `${path} ${width}px genişlikte taşan öğeler`).toEqual([]);
    }
  }
  await page.screenshot({ path: 'test-results/regions-1440.png', fullPage: true });
});

test('CMS içerikleri gerçek hizmet ve bilgi alanlarına bağlıdır', async ({ page, request }) => {
  await page.goto('/bilgi-merkezi');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('DOĞRU UYGULAMAYI');
  await expect(page.getByText('ÖRNEK', { exact: false })).toHaveCount(0);
  for (const value of ['Özel ölçü ayna', 'Ev ve yaşam alanları', 'Rodajlı kenar', 'Duş camı seçerken nelere bakılır?']) {
    await expect(page.getByText(value, { exact: false }).first()).toBeVisible();
  }
  await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="/rehber"]')).toBeVisible();
  await expect(page.locator('footer a[href="/sss"]')).toBeVisible();
  await expect(page.locator('footer a[href^="https://www.google.com/maps/search/"]')).toBeVisible();
  await page.goto('/yorumlar');
  await expect(page.getByText('Panelde “Sitede göster” seçeneği açık olan ve yayınlanmış gerçek yorumlar.')).toHaveCount(0);

  await page.goto('/hizmetler/ozel-olcu-ayna');
  await expect(page.getByText('Rodajlı kenar')).toBeVisible();
  await expect(page.getByText('Ölçüleri kesin bilmem gerekir mi?')).toBeVisible();
  await expect(page.getByText('Ev ve yaşam alanları')).toBeVisible();

  const independent = await request.get('/hakkimizda');
  expect(independent.status()).toBe(200);
  expect(await independent.text()).toContain('Rina Cam &amp; Ayna');
  expect((await request.get('/eski-ornek-sayfa', { maxRedirects: 0 })).status()).toBe(404);

  const login = await request.post('/api/yoneticiler/login', { data: { username: credentials.RINA_ADMIN_USERNAME, password: credentials.RINA_ADMIN_PASSWORD } });
  const token = (await login.json()).token;
  const headers = { Authorization: `JWT ${token}` };
  for (const collection of ['hizmetler', 'kullanim_alanlari', 'islem_secenekleri', 'uygulamalar', 'sss', 'rehber_yazilari', 'sayfalar', 'medyalar']) {
    const response = await request.get(`/api/${collection}?limit=1`, { headers });
    expect(response.ok(), collection).toBeTruthy();
    expect((await response.json()).docs.length, collection).toBeGreaterThan(0);
  }

  await page.goto('/rehber');
  await expect(page.locator('.guide-card')).toHaveCount(3);
  await page.goto('/sss');
  expect(await page.locator('.faq-list details').count()).toBeGreaterThan(0);

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/bilgi-merkezi', '/rehber', '/sss', '/yorumlar']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('body *')]
        .filter(element => element.getBoundingClientRect().right > window.innerWidth + 1)
        .map(element => ({ tag: element.tagName, className: element.className }))
        .slice(0, 8));
      expect(overflow, `${path} ${width}px genişlikte taşan öğeler`).toEqual([]);
    }
    await page.goto('/bilgi-merkezi');
    if (width === 320) {
      const navSizes = await page.locator('.content-hub > .content-hub-nav a').evaluateAll(elements => elements.map(element => {
        const box = element.getBoundingClientRect();
        return { width: Math.round(box.width), height: Math.round(box.height) };
      }));
      expect(navSizes.every(size => size.width === 320 && size.height >= 56)).toBeTruthy();
      await page.locator('.content-hub > .content-hub-nav').screenshot({ path: 'test-results/content-hub-nav-320.png' });
    }
    await page.screenshot({ path: `test-results/content-hub-${width}.png`, fullPage: true });
  }

  expect((await request.get('/api/teklif_takibi', { headers })).status()).toBe(404);
  await page.goto('/admin/collections/hizmet_bolgeleri/create');
  await expect(page.getByLabel('Özgün ilçe detay sayfası yayınla')).toHaveCount(0);
  await expect(page.getByLabel('İlçeye özgü doğrulanmış içerik')).toHaveCount(0);
});

test('Aktif kampanyalardan biri popup olur; tarih dışındakiler ve kampanya sayfaları gösterilmez', async ({ page, request }) => {
  const login = await request.post('/api/yoneticiler/login', { data: { username: credentials.RINA_ADMIN_USERNAME, password: credentials.RINA_ADMIN_PASSWORD } });
  expect(login.ok()).toBeTruthy();
  const headers = { Authorization: `JWT ${(await login.json()).token}` };
  const suffix = Date.now();
  const created: Array<{ collection: string; id: number }> = [];

  const atDayOffset = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
  const closeCampaign = async () => {
    const dialog = page.locator('dialog.campaign-popup[open]');
    if (await dialog.count()) await page.getByRole('button', { name: 'Kampanyayı kapat' }).click();
  };

  try {
    const mediaResponse = await request.get('/api/medyalar?limit=1&depth=0');
    expect(mediaResponse.ok()).toBeTruthy();
    const campaignImageID = (await mediaResponse.json()).docs[0]?.id;
    expect(campaignImageID).toBeTruthy();
    const campaignCases = [
      { title: `Aktif kampanya A ${suffix}`, start: atDayOffset(-5), end: atDayOffset(5), active: true },
      { title: `Aktif kampanya B ${suffix}`, start: atDayOffset(-2), end: atDayOffset(8), active: true },
      { title: `Gelecek kampanya ${suffix}`, start: atDayOffset(2), end: atDayOffset(8), active: false },
      { title: `Süresi dolmuş kampanya ${suffix}`, start: atDayOffset(-8), end: atDayOffset(-2), active: false },
    ];
    for (const item of campaignCases) {
      const response = await request.post('/api/kampanyalar', { headers, data: {
        baslik: item.title,
        ozet: `${item.title} için popup görünürlük kontrolü.`,
        baslangic: item.start,
        bitis: item.end,
        gorsel: campaignImageID,
        _status: 'published',
      } });
      expect(response.ok(), item.title).toBeTruthy();
      created.push({ collection: 'kampanyalar', id: (await response.json()).doc.id });
    }

    for (const source of ['Google', 'Web sitesi']) {
      const response = await request.post('/api/yorumlar', { headers, data: {
        gostergelik_ad: `${source} yorum kontrolü ${suffix}`,
        yorum: `${source} kaynağından yayın görünürlüğü kontrolü.`,
        kaynak: source,
        kaynak_baglantisi: source === 'Google' ? 'https://www.google.com/maps' : undefined,
        puan: 5,
        sitede_goster: true,
        sira: source === 'Google' ? 1 : 2,
        _status: 'published',
      } });
      expect(response.ok()).toBeTruthy();
      const review = (await response.json()).doc;
      created.push({ collection: 'yorumlar', id: review.id });
    }

    const publishedCampaignsResponse = await request.get('/api/kampanyalar?limit=100&depth=0');
    expect(publishedCampaignsResponse.ok()).toBeTruthy();
    const now = Date.now();
    const activeTitles = ((await publishedCampaignsResponse.json()).docs as Array<{
      baslik: string; baslangic: string; bitis: string;
    }>).filter(item => Date.parse(item.baslangic) <= now && Date.parse(item.bitis) >= now)
      .map(item => item.baslik);

    await page.goto('/');
    const popup = page.locator('dialog.campaign-popup[open]');
    await expect(popup).toBeVisible();
    const popupTitle = await popup.getByRole('heading', { level: 2 }).innerText();
    expect(activeTitles).toContain(popupTitle);
    const popupImage = popup.locator('.campaign-popup-image');
    if (await popupImage.count()) {
      const [copyBox, imageBox] = await Promise.all([
        popup.locator('.campaign-popup-copy').boundingBox(),
        popupImage.boundingBox(),
      ]);
      expect(copyBox).not.toBeNull();
      expect(imageBox).not.toBeNull();
      expect(copyBox!.x).toBeLessThan(imageBox!.x);
    }
    expect(await popup.evaluate(element => getComputedStyle(element).overflowY)).toBe('hidden');
    await popup.screenshot({ path: 'test-results/campaign-popup.png' });
    await expect(popup.getByText(`Gelecek kampanya ${suffix}`, { exact: true })).toHaveCount(0);
    await expect(popup.getByText(`Süresi dolmuş kampanya ${suffix}`, { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Kampanyayı kapat' }).click();
    await expect(popup).not.toBeVisible();

    expect((await request.get('/kampanyalar')).status()).toBe(404);
    expect((await request.get('/kampanyalar/gecici-kampanya')).status()).toBe(404);

    await page.goto('/yorumlar');
    await closeCampaign();
    await expect(page.getByText(`Google yorum kontrolü ${suffix}`)).toBeVisible();
    await expect(page.getByText(`Web sitesi yorum kontrolü ${suffix}`)).toBeVisible();
    const reviewGridStyle = await page.locator('.review-grid').evaluate(element => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, border: style.borderTopWidth, cards: element.children.length };
    });
    expect(reviewGridStyle.background).toBe('rgba(0, 0, 0, 0)');
    expect(reviewGridStyle.border).toBe('0px');
    expect(reviewGridStyle.cards).toBeGreaterThanOrEqual(2);
    await page.locator('.review-grid').screenshot({ path: 'test-results/reviews-two-cards.png' });
    await page.goto('/bilgi-merkezi');
    await closeCampaign();
    await expect(page.getByText(`Google yorum kontrolü ${suffix}`)).toBeVisible();
  } finally {
    for (const item of created.reverse()) {
      expect((await request.delete(`/api/${item.collection}/${item.id}`, { headers })).ok()).toBeTruthy();
    }
  }
});
