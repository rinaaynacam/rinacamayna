# Yerel geliştirme

24 Eylül 2026 — ilk çalışan P0/P1 akışı.

## Açma

Docker Desktop çalışırken proje kökünde:

```powershell
docker compose up -d db
npm run dev
```

Site: http://localhost:3000 — panel: http://localhost:3000/admin

İlk yerel yönetici bilgileri `.env.admin` dosyasında. Bu dosya gizlidir, Git tarafından yok sayılır. Parolayı paylaşmayın veya görev kaydına yapıştırmayın. Komut tekrar çalıştırılırsa mevcut yönetici korunur. Yerel sunucu yalnız loopback üzerinde dinler.

## Yeni geliştirme ortamı

```powershell
npm ci
node scripts/env-hazirla.mjs
node scripts/local-db-env.mjs
docker compose up -d db
npm run payload:migrate
npm run seed:initial
npm run admin:bootstrap
npm run dev
```

Node 22.18.0 ve npm 10.9.3 ile doğrulandı. Yerel DB `rina_dev`, port `15432`; Windows 55432 portunu ayırdığı için kullanılmadı. `.env.local` ve `.env.db` bağımsız Rina sırları içerir. Referans UV projesinin DB/secret/verisi kullanılmaz.

Test DB için `docker compose --profile test up -d db-test`; ayrı `rina_test` veritabanı 15433 portundadır ve geçicidir. Bu DB servisi henüz çalıştırılıp doğrulanmadı. Mevcut e2e testleri yalnız boş/yapay verili yerel development ortamında çalıştırıldı; telefon değişikliğini `finally` içinde geri alır. Production veya gerçek müşteri verisi bulunan ortamda çalıştırmayın.

## Doğrulama

```powershell
npm test
npm run typecheck
npm run lint
npm run build
# Yerel sunucu açıkken, Windows Edge ile:
npm run test:e2e
```

Build migration çalıştırmaz. Migration ayrı, kontrollü adımdır. İlk migration `src/migrations/20260924_122933.ts`, tam CMS şeması `20260924_132338.ts`, ana sayfa taslak akışı `20260924_132818.ts` dosyasındadır; üçü de development DB'ye başarıyla uygulandı.

## Yerel kurtarma

```powershell
npm run admin:recover
```

Sunucu erişimli yetkili için: `rina-admin` parolasını rastgele yeniler, oturumları ve kilidi sıfırlar; yeni bilgi `.env.admin-recovery` dosyasına bir kez yazılır. Mevcut kurtarma dosyasını ezmez. Başka yönetici için `RINA_ADMIN_USERNAME` güvenli yerel ortamda ayarlanır. Kurtarma akışı henüz uçtan uca test edilmedi; production prosedürü değildir.

## Yayın kapıları

- MFA tamamlanmadı. `APP_ENV` development değilse panel ve yönetici REST yolları 503 ile kapalıdır.
- İndeksleme kapalıdır. Robots ve site metadata kasıtlı olarak noindex kalır; yayın kabulünde birlikte güncellenecek.
- Hizmet/proje/medya/yayın modelleri, editoryal ana sayfa ve ortak bölge sayfası hazırdır. Gerçek hizmet, uygulama ve görsel kayıtları işletme teyidiyle panelden girilmelidir; seed bunları oluşturmaz.
- Hosting/DNS değişmedi. Üretim DB'si, yedek ve geri dönüş denemesi yapılmadı.
- Tam P4 güvenlik kabulü ve bağımlılık bildirimlerinin değerlendirilmesi bekliyor.
