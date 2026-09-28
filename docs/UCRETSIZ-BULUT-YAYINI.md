# Ücretsiz bulut yayın mimarisi

Güncel seçim: **Netlify Free + Neon Free PostgreSQL + Cloudflare R2 Standard**. Bu belge hesap açıldığı veya canlı yayın yapıldığı anlamına gelmez; kod ve yayın sözleşmesi bu mimariye hazırlanmıştır.

## Neden bu üçlü?

| Katman | Hizmet | Kullanım |
|---|---|---|
| Next.js + Payload | Netlify Free | App Router, SSR, route handler, middleware ve admin paneli |
| Veritabanı | Neon Free | Ayrı production PostgreSQL ve scale-to-zero compute |
| Medya/PDF | Cloudflare R2 Standard | Payload yüklemeleri için kalıcı S3 uyumlu obje depolama |

Vercel Hobby kişisel ve ticari olmayan kullanım içindir; işletme sitesi için seçilmedi. Cloudflare Workers tam Next.js çalıştırabilse de mevcut Payload, Sharp ve Node çalışma biçimini değiştiren ek uyarlama getirir. Netlify Free ticari projelere izin verir, ücretsiz planda ödeme çıkarmaz ve limit dolunca projeyi sonraki döneme kadar durdurur.

Ücretsiz katman sınırsız değildir. Netlify aylık 300 kredi hard limiti kullanır. Neon proje başına ücretsiz depolama/compute sınırlarına, R2 Standard ise aylık 10 GB depolama, 1 milyon Class A ve 10 milyon Class B ücretsiz işlem sınırına sahiptir. Kullanım panelleri haftalık kontrol edilir; otomatik ücretli yükseltme açılmaz.

## 1. Neon

1. İşletme hesabında yeni ve yalnız production için kullanılan bir Neon projesi oluşturun.
2. Uygulamaya yakın bir Avrupa bölgesi seçin. Serverless bağlantılar için **pooled connection string** alın.
3. Bağlantı adresini Netlify'da `VERITABANI_URL` olarak kaydedin. URL `sslmode=require` içermelidir.
4. Yerel, preview ve production aynı veritabanını paylaşmaz. Preview gerekiyorsa ayrı Neon branch ve ayrı medya prefix/bucket kullanılır.
5. Migration build komutuna eklenmez. İlk yayından hemen önce kontrollü bir terminalden production env ile `npm run payload:migrate` çalıştırılır; sonuç doğrulandıktan sonra deploy edilir.

## 2. Cloudflare R2

1. **Standard** sınıfta `rina-cam-ayna-production` benzeri ayrı bir bucket oluşturun.
2. Yalnız bu bucket için Object Read & Write yetkili S3 API token üretin. Hesap genelinde yönetici tokenı kullanmayın.
3. Bucket'a `media.<alan-adı>` gibi bir public custom domain bağlayın. Geçici aşamada R2 public development URL kullanılabilir.
4. Netlify secret'larına `R2_HESAP_ID`, `R2_KOVA_ADI`, `R2_ERISIM_ANAHTARI`, `R2_GIZLI_ANAHTAR` ve sonda `/` olmayan `MEDYA_PUBLIC_URL` değerlerini girin.
5. `MEDYA_DEPOLAMA=r2` olduğunda Payload'ın resmî S3 adaptörü medya ve PDF dosyalarını R2'ye yazar; yerel disk kullanılmaz. Netlify binary istek sınırı nedeniyle panel yüklemeleri 4 MB altında tutulur. Daha büyük gerçek ihtiyaç oluşursa doğrudan istemci yükleme ve dar CORS politikası ayrıca uygulanır.
6. Mevcut `media-local` dosyaları `medyalar/`, `public-files` dosyaları `dosyalar/` nesne öneki altında R2'ye kopyalanır; DB kayıtlarındaki dosya adlarıyla nesne anahtarları karşılaştırılır. Kopya sayısı ve örnek indirme doğrulanmadan yerel kaynak silinmez.

## 3. Netlify

1. Netlify Free projesinde Git sağlayıcısı olarak GitHub'ı, depo olarak `rinaaynacam/rinacamayna`, production branch olarak `main` seçin. `netlify.toml` build komutunu `npm run build`, yayın dizinini `.next`, Node sürümünü `22.18.0` olarak sabitler. OpenNext adaptörü Netlify tarafından otomatik uygulanır; ayrıca eski Next eklentisi sabitlenmez.
2. Aşağıdaki production ortam değişkenlerini Netlify Secret olarak girin:

```text
APP_ENV=production
SITE_URL=https://secilen-alan-adi.example
CANONICAL_SITE_URL=https://secilen-alan-adi.example
INDEXING_ENABLED=false
VERITABANI_URL=<Neon pooled SSL URL>
PAYLOAD_GIZLI_ANAHTAR=<en az 48 karakter rastgele secret>
MEDYA_DEPOLAMA=r2
R2_HESAP_ID=<Cloudflare account id>
R2_KOVA_ADI=<bucket>
R2_ERISIM_ANAHTARI=<bucket-scoped key>
R2_GIZLI_ANAHTAR=<bucket-scoped secret>
MEDYA_PUBLIC_URL=https://media.secilen-alan-adi.example
```

3. Secret değerleri deploy loguna, Git'e veya dokümana yazılmaz. Production deployundan önce aynı env setiyle `npm run cloud:preflight` çalıştırılır.
4. İlk deploy noindex kalır. Admin girişi, medya yükleme/silme, sayfa yayınlama, R2 URL'si, WhatsApp, CSP ve PageSpeed doğrulandıktan sonra `INDEXING_ENABLED=true` yapılıp yeniden deploy edilir.
5. Özel domain bağlanınca hem `SITE_URL` hem `CANONICAL_SITE_URL` aynı HTTPS origin ile değiştirilir. Eski domain yol bazlı 301/308 yönlendirilir; sitemap ve Search Console yeni adrese geçirilir.

## 4. Yayın ve geri dönüş sırası

1. Yerel DB, medya ve DNS envanterinin yedeğini alın.
2. Neon'a migration uygulayın ve tablo/migration kaydını doğrulayın.
3. Mevcut medyayı R2'ye kopyalayın; dosya sayısı, boyut ve örnek URL doğrulayın.
4. `npm run cloud:preflight`, `npm test`, `npm run build` ve `npm run test:pagespeed` çalıştırın.
5. Netlify deploy preview üzerinde admin ve kamu sayfalarını noindex olarak kabul edin.
6. Domain/DNS kaydını gerçek Netlify hedef değerleriyle yetkili uygulasın. SSL, kök/`www`, canonical ve eski URL yönlendirmelerini kontrol edin.
7. Sorunda DNS'i önceki hedefe döndürün; yeni DB ve R2 verisini silmeyin. Sorun nedeni ve geri dönüş zamanı kaydedilir.

Netlify, Neon ve Cloudflare hesap sahipliği işletmede kalır. Ücretsiz plan sınırları veya kullanım şartları değişebileceği için canlıya çıkarken resmi fiyat sayfaları yeniden kontrol edilir.
