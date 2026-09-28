# Rina Cam & Ayna — yerel web uygulaması

Bu çalışma alanında Next.js, Payload CMS ve PostgreSQL ile çalışan Rina sitesi ile yönetim paneli bulunur. Uygulama geliştirme aşamasındadır; üretim yayını ve işletme onaylı gerçek hizmet/görsel içeriği henüz tamamlanmamıştır.

Ana kaynak deposu: [github.com/rinaaynacam/rinacamayna](https://github.com/rinaaynacam/rinacamayna). Netlify ve diğer yayın hizmetleri bu depoya bağlanacaktır.

Sürüm 2.1 hedefi: Ankara merkezi ve tüm ilçelerinde cam veya ayna işi yaptırmak isteyen bireysel ve kurumsal müşterilere ulaşmak. Ev, iş yeri, dekorasyon, proje ve mobilya ihtiyaçları birlikte ele alınır. İlçe listesi ve içerik/SEO planı ana şartnamede; düzenlenebilir ilk veriler `baslangic-modulleri/rina-initial.json` dosyasındadır.

## Başlamak

Docker Desktop açıkken `docker compose up -d db` ve ardından `npm run dev` çalıştırın. Site `http://localhost:3000`, panel `http://localhost:3000/admin` adresindedir. Yeni ortam kurulumu, migration, seed ve admin adımları için [yerel geliştirme rehberini](docs/YEREL-GELISTIRME.md) izleyin.

## Dosyalar

| Dosya | İşlev |
|---|---|
| `docs/DOMAIN-YAYIN.md` | Alan adı ve WhatsApp için düzeltilmiş teknik not |
| `docs/UCRETSIZ-BULUT-YAYINI.md` | Netlify + Neon + Cloudflare R2 kurulum, yayın ve geri dönüş adımları |
| `baslangic-modulleri/` | Bağımsız WhatsApp modülü, test ve ilk CMS seed verisi |
| `.env.example` | Gizli değer içermeyen başlangıç env sözleşmesi |
| `scripts/env-hazirla.mjs` | Mevcut env'yi ezmeden yerel secret oluşturma |

## Hazır modülü deneme

Güncel desteklenen Node.js kurulu terminalde, paket kökünde:

```bash
node --test baslangic-modulleri/whatsapp.test.mjs
```

Bu komut e-posta/WhatsApp göndermez ve dış ağa bağlanmaz. Yalnızca numara, mesaj ve URL davranışını test eder.

İlk `.env.local` dosyasını isteğe bağlı hazırlamak için:

```bash
node scripts/env-hazirla.mjs
```

Script varsa dosyayı ezmez, secret'ı terminale basmaz. `VERITABANI_URL` gerçek yerel bağlantıyla ayrıca doldurulur. Bu komut web uygulamasını veya veritabanını kurmaz.

Güncel üretim domaini adayı `rinacamayna.com` olsa da alan adı kod değişmeden `CANONICAL_SITE_URL` ve `SITE_URL` ile değiştirilebilir. Üretimde iki değer aynı HTTPS origin olmalıdır. Müşteri iletişimi yalnızca WhatsApp `0542 231 30 69`; e-posta yoktur ve numara panelden yönetilir.

PageSpeed bütçesi `npm run test:pagespeed` ile production derlemesinde ölçülür. Ana sayfa mobil/masaüstü, uygulamalar, bilgi merkezi ve örnek hizmet sayfasında performans, erişilebilirlik, en iyi uygulamalar ve SEO puanlarının her biri en az 91 olmalıdır.

Üretim için seçilen ücretsiz ticari mimari Netlify Free, Neon Free PostgreSQL ve Cloudflare R2'dir. Hesaplar bağlandıktan sonra yayın öncesi ortam sözleşmesi `npm run cloud:preflight` ile doğrulanır. Agentic browsing için kök `/llms.txt` rotası, erişilebilir ad/rol yapısı ve değişebilir canonical bağlantıları uygulamada hazırdır.
# Çalışan yerel uygulama — 24 Eylül 2026

Next.js + Payload + PostgreSQL ilk akışı kuruldu. Site `http://localhost:3000`, panel `http://localhost:3000/admin`.
Başlatma, güvenli yerel giriş ve test komutları: [Yerel geliştirme](docs/YEREL-GELISTIRME.md).
Bu ilk çalışan aşamadır; tüm içerikler ve üretim yayını tamamlanmadı.
