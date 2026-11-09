# 🛡️ Flexora - 7/24 Otomatik Doğrulama Kodu & Hesap Teslimat Sistemi

Steam, Netflix, ChatGPT, Epic Games gibi hesaplar satıyorsanız, müşterileriniz her girişte doğrulama kodu ister. **Flexora**, gece yarısı siz uyurken bile müşterinize özel erişim anahtarı (key) ile doğrulama kodunu ve hesap bilgilerini otomatik olarak teslim eden yeni nesil bir e-ticaret otomasyon sistemidir.

---

## ⚡ Temel Özellikler

### 🛒 Mağaza & Müşteri Portalı
- **Size Özel Mağaza Linki:** `flexora.net/MagazaAdiniz` veya `http://localhost:3001/store/magazam`
- **İsteğe Bağlı Kendi Domaininizi Bağlama:** DNS CNAME ile kendi alan adınızı bağlama desteği.
- **Marka Özelleştirme:** Logo, renk teması (Indigo, Cyan, Emerald, Rose, Amber, Purple), sekme başlığı, favicon ve duyuru bandı.
- **Kayıtsız Son Kullanılan Keyler:** Müşteri üye olmadan tarayıcı hafızasında (LocalStorage) son kullandığı keyleri tek tıkla görebilir ve yeniden seçebilir.
- **Müşteri İstek & Öneri Formu:** Müşteriler mağazadan çıkmadan oyun isteği veya geri bildirim gönderebilir.
- **Oyun Listesi Sergileme (Vitrin):** Mağazanızda satışta olan veya havuzda bulunan oyunları kapak görselleriyle vitrinde sergileyebilme.

### 🚀 3 Farklı Teslimat Modu
1. **Sadece Doğrulama Kodu Teslimi:** Hesap şifresi müşteriye gösterilmez, müşteri sadece mailine/2FA'sına gelen kodu alır.
2. **Sadece Hesap Bilgisi Teslimi:** Kod gerekmeyen hesaplar için doğrudan `Kullanıcı Adı : Şifre` teslim edilir.
3. **Hesap Bilgisi + Kod Birlikte Teslim:** Hem hesap giriş bilgileri hem de canlı kod alma aracı birlikte sunulur.
4. **Tek Kullanımlık Yakma (Burn on View):** Hesap bilgisi görüntülendiği anda key'in kullanılmış sayılarak kapatılması opsiyonu.

### 🔑 Gelişmiş Key Yönetimi
- **Tek Tıkla Toplu Key Üretimi:** 1 ile 500 adet arasında özel önekli (örn: `STEAM-XXXX-XXXX`) anında key basma.
- **Key Başına Çoklu Kullanım:** Her key için belirlenebilen kullanım hakkı (örn: 5 kullanım veya sınırsız).
- **Kullanımlar Arası Bekleme Süresi (Cooldown):** IMAP spamini önlemek için talepler arasına saniye bazlı bekleme süresi koyma.
- **Son Kullanma Tarihi ve Geçerlilik Süresi:** İlk kullanımdan itibaren geçerlilik süresi (örn: 30 gün).
- **Tek Tıkla Temizleme (Purge):** Kullanılmış ve süresi dolmuş keyleri tek butonla veritabanından temizleme.
- **TXT Dışa Aktarma:** Satış platformlarına (İtemsatış, GameSatış vb.) kolayca yapıştırmak için tek tıkla TXT indirme.

### 🎮 Steam & Oyun Satıcıları İçin Paket Sistemi
- **Paket Seçim Sistemi:** Müşteri tek bir key ile mağazadaki 10 oyundan dilediği **X adet oyunu** (örn: istediği 2 oyunu) kendisi seçer.
- **Alt Paket & Oyun Havuzu:** Seçilen her oyunun kendine ait hesap ve kod bilgisi otomatik olarak atanır.

### 📧 Desteklenen Mail ve 2FA Türleri
- **Gmail:** IMAP + Google Uygulama Şifresi (App Password)
- **Hotmail / Outlook:** Office 365 IMAP
- **Özel Mail Sunucuları:** cPanel, Roundcube, Plesk, Hostinger (Özel Host & Port & SSL)
- **Authenticator (2FA):** Google Authenticator / TOTP RFC 6238 algoritmasıyla anlık 30 saniyelik dönen kod üretimi.

### 🎯 Desteklenen Platformlar
- Steam (Steam Guard 5 haneli harf-rakam kodu)
- Netflix (4-6 haneli geçici erişim kodu veya oturum açma linki)
- ChatGPT / OpenAI (6 haneli doğrulama kodu)
- Epic Games (6 haneli güvenlik kodu)
- Rockstar Games
- EA / Origin
- Ubisoft Connect
- Riot Games
- Microsoft / Xbox
- Google
- Amazon OTP
- Disney+ / HBO Max / CapCut / Perplexity / Binance / Kaspersky ve mail ile kod gönderen tüm platformlar.

### 💳 Lisans & Otomatik Kurulum
- Lisans süresi 30 gündür (1 ay).
- Kurulum için harici bir veri tabanına (MySQL, PostgreSQL vb.) veya ek personele ihtiyacınız yoktur. Sıfır konfigürasyonla taşınabilir JSON veritabanı ile çalışır.
- Süre uzatmak için panel ayarlarından yeni 30 günlük lisans kodunu girmeniz yeterlidir.

---

## 🚀 Başlatma & Çalıştırma

Projeyi çalıştırmak için terminalden tek bir komut yeterlidir:

```bash
# Proje dizinine gidin
cd C:\Users\emirk\.gemini\antigravity\scratch\zguard

# Sunucuyu başlatın
npm start
```

Sunucu açıldığında aşağıdaki adreslerden erişilebilir:
- **Mağaza Portalı (Müşteri):** `http://localhost:3001/store/magazam`
- **Yönetici Paneli (Admin):** `http://localhost:3001/admin`
- **Yönetici Bilgileri:**
  - Kullanıcı Adı: `flexora999`
  - Şifre: `WCU4w6bHzygLpEV`

---

## 🧪 Hazır Test Keyleri (Demo)

Sistemi hemen test edebilmeniz için panelde önceden tanımlanmış 3 hazır key bulunmaktadır:

1. `ZG-STEAM-DEMO-2026` ➔ **Steam Guard (2FA TOTP Kodlu)**
2. `ZG-NETFLIX-4K-PASS` ➔ **Netflix Ultra HD (Mail Kodlu)**
3. `ZG-BUNDLE-SELECT-GAME` ➔ **Steam Çoklu Paket (İstediğin 2 Oyunu Seçmeli)**

Mağaza portalına girip bu keyleri girerek veya "Hızlı Test Keyleri" butonlarına tıklayarak anında deneyimleyebilirsiniz.
