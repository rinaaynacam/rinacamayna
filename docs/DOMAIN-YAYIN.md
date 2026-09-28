# Rina Cam & Ayna — Domain, Hosting ve WhatsApp Teknik Notları

Sürüm: 2.1 · 24 Eylül 2026  
Bu dosya önceki e-posta kullanım kararının yerine geçer. Ana şartname: `Rina-Cam-Ayna-Master-Plan.md`.

## 1. Güncel bilgiler

| Konu | Karar / durum |
|---|---|
| Alan adı | Güncel aday `https://rinacamayna.com`; yayın öncesi değişebilir. |
| Hedef kapsam | Ankara merkezi ve tüm ilçelerinde cam veya ayna işi yaptırmak isteyen bireysel ve kurumsal müşteriler. |
| Müşteri iletişimi | Yalnızca WhatsApp. |
| Numara | `0542 231 30 69` |
| Bağlantı numarası | `905422313069` |
| Bağlantı | `https://wa.me/905422313069` |
| E-posta | Kullanıcı kullanılacak firma e-postası olmadığını netleştirdi. Önceki `info@rinacamayna.com` kullanım kararı iptal edildi. |
| Düzenlenebilirlik | Numara, CTA etiketleri ve mesaj şablonları tek CMS ayarından yönetilecek. |
| Görünen sağlayıcı | Paylaşılan ekran görüntüsünde Hostinger Uluslararası. |
| Görünen IP | `195.35.60.102`; mevcut durum görüntüsü, yeni yayın hedefi değildir. |
| Görünen nameserver | `ns1.dns-parking.com`, `ns2.dns-parking.com` |
| Panel erişimi | Domain/DNS/hosting şifreleri geliştirme tarafıyla paylaşılmadı. |
| Uygulayan kişi | Müşterinin mevcut teknik yetkilisi; adı ve ulaşılabilirliği alınacak. |

Hosting/IP/nameserver bilgileri canlı DNS veya panelden bu çalışma kapsamında doğrulanmadı. Ekran görüntüsünden hosting paketi, domain kayıt firması veya hesap sahipliği kesinleştirilmez.

## 2. Geliştirme ve yayın kararı

Uygulama VS Code + Codex ile ayrı Rina projesi olarak geliştirilecek. Next.js + Payload CMS + PostgreSQL, UV GitHub referansının temel mimarisi olacak. Tasarım son Rina önizlemesine dayanacak.

Ücretsiz ticari başlangıç mimarisi Netlify Free + Neon Free PostgreSQL + Cloudflare R2 Standard olarak seçildi. Hostinger alan adı ve DNS sağlayıcısı olarak kalabilir; alan adı transferi veya nameserver değişimi otomatik gereklilik değildir. Netlify yalnız uygulamayı, Neon production veritabanını, R2 kalıcı medya ve PDF dosyalarını barındırır.

Hesap oluşturma, limit doğrulama, migration, medya taşıma ve geri dönüş adımları `UCRETSIZ-BULUT-YAYINI.md` belgesindedir. Canlı Netlify projesi oluşmadan DNS hedefi uydurulmaz.

## 3. Şifre paylaşılmadan görev dağılımı

| İşlem | Geliştirme tarafı | Mevcut teknik yetkili |
|---|---|---|
| Bulut hesabı | Netlify/Neon/R2 env ve yayın gereksinimlerini listeler | İşletme sahipliğindeki hesapları açar veya sınırlı davet verir |
| Yedek | Dosya/DB/DNS/medya envanteri ve geri dönüş planı hazırlar | Erişim gereken yedeği alır ve ulaşılabilirliğini doğrular |
| Yayın | Build, migration, ortam değişkeni adları ve kurulum adımlarını hazırlar | Yetki gereken yükleme, DB ve uygulama ayarlarını uygular |
| DNS | Gerçek hedef sağlayıcının kayıtlarını tam tablo olarak verir | Aktif DNS bölgesinde yalnız belirtilen kayıtları değiştirir |
| SSL | Kök ve www alan adları için gereksinimleri belirler | Panelde sertifika bağlantısını/kurulumunu yapar |
| URL geçişi | Eski → yeni sayfa listesi ve kuralları hazırlar | Panel/sunucu yetkisi isteyen kuralları uygular |
| Search Console | Gerçek TXT veya doğrulama değerini iletir | Kaydı ekler veya erişim davetini gerçekleştirir |
| Son kontrol | DNS, HTTPS, yönlendirme, site ve WhatsApp davranışını test eder | Gerektiğinde düzeltme veya geri dönüş uygular |

Talimat hazırlandı, yetkili uyguladı ve sonuç doğrulandı ayrı durumlardır. Yapılmayan panel işlemi tamamlanmış sayılmaz. Müşteri isterse sağlayıcının desteklediği sınırlı erişim daveti kullanabilir; hesap şifresini vermesi şart değildir.

Her dış işlem talimatında **işlem, neden, uygulayan kişi, kayıt adı/türü, eski değer, yeni değer, TTL, uygulama zamanı, doğrulama ve geri dönüş** yazılacak. Hedef ortam belirlenmeden IP/CNAME/TXT değeri uydurulmayacak.

## 4. DNS ile web yönlendirmesinin ayrılması

DNS, domainin hizmete bağlanmasını sağlar. HTTP yönlendirmesi eski URL'yi yeni sayfaya taşır. WhatsApp CTA ise ziyaretçinin iletişim başlatmasıdır; üçü ayrı konudur.

- Canonical web adresi `CANONICAL_SITE_URL` ortam değişkeninden gelir; güncel aday `https://rinacamayna.com`.
- HTTP ve www sürümü, gerekli yol/query korunarak ana HTTPS adrese gider.
- Eski sayfa adresleri mümkünse korunur; değişenler karşılık gelen yeni sayfaya 301/308 ile yönlendirilir.
- Bütün eski sayfalar ana sayfaya yönlendirilmez; döngü ve zincir oluşmaz.
- Kök/www DNS, HTTPS ve sunucu yönlendirmesi birlikte test edilir.
- Mevcut DNS kayıtları yedeklenir; tüm bölge sıfırlanmaz.
- E-posta kullanılmayacak olsa da neye ait olduğu bilinmeyen mevcut kayıtlar gelişigüzel silinmez.
- Nameserver değişmesi gerçekten gerekirse diğer servislerin kayıtları ayrıca korunarak planlanır.

### Alan adı değişirse

Alan adının değişmesi uygulama kodunu veya CMS kayıtlarını değiştirmeyi gerektirmez. Yeni yayın ortamında `CANONICAL_SITE_URL` ile `SITE_URL` aynı, yalnızca origin içeren HTTPS adresine ayarlanır ve uygulama yeniden derlenir. Metadata, canonical bağlantılar, sitemap, robots ve yapılandırılmış veri bu tek kaynaktan yeni adresi üretir. Yol, sorgu, kullanıcı bilgisi veya HTTP adresi kabul edilmez; hatalı üretim ayarında uygulama açılışta durur.

Yayın yetkilisi eski alan adındaki her yolu mümkün olan eş yeni yola 301/308 ile yönlendirir; kök ve `www` varyantlarını, SSL sertifikasını, DNS kayıtlarını ve geri dönüş değerlerini kaydeder. Search Console mülkü, sitemap, analitik origin ayarları ve varsa üçüncü taraf izinli origin listeleri yeni adres için güncellenir. Eski alan adı yönlendirmeler için elde tutulur. Bu dış işlemler uygulanıp doğrulanmadan domain geçişi tamamlandı sayılmaz.

## 5. E-postasız WhatsApp işleyişi

Müşteriye dönük site/panel iletişim alanında kurumsal e-posta oluşturulmaz veya gösterilmez. Mailto, e-posta zorunlu teklif formu, SMTP, Resend ve mail bildirimi kapsamdan çıkarıldı. Doğrudan arama CTA'ları da WhatsApp ile değiştirilecek.

Header, hero, footer, mobil çubuk, hizmet ve uygulama CTA'ları tek CMS numarasını kullanır. Menü ve içerik navigasyonu site içinde kalır. Numara değişikliğinde cache yenilenir; formdan devam ederken güncel numara yeniden okunur.

Ölçü/model/adet bilgileri tarayıcıda mesaj taslağına dönüşür ve WhatsApp'a geçilir. Kullanıcı gönderme işlemini WhatsApp içinde yapar. Site “Talebiniz alındı” veya “Mesaj gönderildi” iddiasında bulunmaz. Dosyaları kullanıcı açılan sohbete kendisi ekler.

Yönetim panelindeki gerçek teklif takibi ilk sürümde personelin manuel kaydıyla yapılır. WhatsApp tıklaması otomatik talep/sipariş oluşturmaz.

Yönetici girişi kullanıcı adıyla yapılır. E-posta tabanlı kurtarma yerine doğrulanmış MFA/kurtarma ve kontrollü sunucu reset süreci hazırlanır. Parola veya token WhatsApp üzerinden istenmez/gönderilmez.

## 6. Yetkiliden beklenecek bilgiler

- Domain kayıt firması, hesap sahibi, yenileme tarihi/sorumlusu.
- Netlify, Neon ve Cloudflare hesaplarının işletme sahipliği veya sınırlı erişim davetleri.
- Aktif DNS bölgesine erişebilen yetkili ve mevcut kök/`www` kayıt envanteri.
- PostgreSQL erişimi, kalıcı medya ve yedek olanakları.
- Güncel DNS kayıtları, CDN/proxy ve mevcut web IP doğrulaması.
- Eski sitenin dosya/DB yedeği ve korunacak URL/dosya/alt alan adları.
- Yayın talimatlarını uygulayacak kişi ve geri dönüş süresi.
- Planlanan yayın saati ve hata halinde geri dönüş sorumlusu.

## 7. Yayın sırası

1. Paket ve yetkili bilgilerini netleştir.
2. Yerel ve test ortamında yeni uygulamayı tamamla; noindex/erişim korumasını uygula.
3. Eski site, DB, medya ve DNS yedeklerini hazırla; geri yüklemeyi dene.
4. Kesin kayıtlar, migration/yayın adımları, SSL ve URL geçiş listesini yetkiliye ilet.
5. Yetkili gerekli panel işlemlerini uygulasın.
6. Geliştirme tarafı site, admin, WhatsApp, HTTPS, DNS ve URL kontrollerini yapsın.
7. Canlı kabul sonrası doğru ortamda indekslemeyi aç; sitemap ve ölçüm kontrollerini tamamla.
8. Sorunda uygulama ve veritabanı uyumunu gözeterek geri dön; eski hizmetleri kabul tamamlanmadan kapatma.

## 8. Müşteriye aktarılacak açıklama

> Yeni sitenizde yayın öncesi seçilecek alan adı kullanılacak. Site Ankara merkezi ve tüm ilçelerindeki bireysel ve kurumsal cam/ayna ihtiyaçlarına hitap edecek. Müşteri iletişimlerinin tamamı 0542 231 30 69 numaralı WhatsApp hesabına yönlenecek; numara ve hazır mesajlar yönetim panelinden değiştirilebilecek. Sitede e-posta kullanılmayacak. Uygulama Netlify, veritabanı Neon, kalıcı medya Cloudflare R2 ücretsiz katmanlarında hazırlanacak. DNS, SSL ve yönlendirme için gerçek proje hedeflerini biz yazacağız; mevcut teknik yetkiliniz DNS panelinde uygulayacak. Ardından sonucu kontrol edeceğiz.

## Kaynak ve durum

- En son müşteri talimatı önceki e-posta kararını geçersiz kılar.
- [UV referansı](https://github.com/Mebalci/uv-baski-web-sitesi)
- [Rina tasarım önizlemesi](https://rina-cam-ayna-dekor.mebalci.chatgpt.site)
- [Hostinger DNS yönetimi](https://www.hostinger.com/support/1583249-how-to-manage-dns-records-at-hostinger/)
- [Hostinger harici hizmet bağlantısı](https://www.hostinger.com/support/4737652-how-to-point-a-domain-to-external-services-at-hostinger/)
- [WhatsApp bağlantıları](https://faq.whatsapp.com/5913398998672934)

Bu belge bir uygulama planıdır; bu çalışma sırasında domain, DNS, hosting veya canlı site değiştirilmemiştir.
