# Tabibe

Dil: [English](../../README.md) | Türkçe

Chromium tabanlı tarayıcılar için modern, minimalist ve yüksek performanslı yeni sekme (new tab) açılış sayfası eklentisi.

**Güncel sürüm:** `0.5.0`

## Hakkında

Tabibe, yeni sekme deneyimini kişisel bir kontrol ve üretkenlik alanına dönüştüren açılış sayfası eklentisidir. Hızlı erişim, klasörler, notlar, arama, tema, arka plan ve yedekleme özelliklerini tek ekranda sade bir üretkenlik alanı olarak birleştirir.

### Temel Özellikler

- Saat ve tarih görünümü
- Arama çubuğu (Google, Bing, DuckDuckGo, Yandex)
- Hızlı erişim ızgarası ile site ve klasör yönetimi
- Site ve klasör ekleme, düzenleme, silme ve geri alma akışları
- Klasör içinden site ekleme, klasör düzenleme ve güvenli klasör silme karar ekranı
- Ana ekran, klasör içi ve klasörden ana ekrana sürükle-bırak desteği
- Sürükle-bırak sırasında daha anlaşılır hedef ve taşıma animasyonları
- Çoklu not sistemi: başlık, içerik, arama, aktif/arşiv görünümü ve sabitleme
- Boş not kaydını engelleyen not kontrolü
- Not silme için onay ekranı ve geri alma bildirimi
- Açık/koyu tema desteği
- Açık/koyu arka plan renk grupları ve seçili renge göre otomatik tema geçişi
- Tema değiştirirken eşlenik arka plan rengini otomatik seçme
- Yerel arka plan görseli yükleme
- Sabitlenmiş yerel Simple Icons kataloğu, isteğe bağlı Chrome favicon'ları ve her zaman kullanılabilen monogram fallback'i ile dayanıklı site simgeleri
- Otomatik, marka, site ve harf modlarını sunan aranabilir simge seçici
- WCAG odaklı kontrast, görünür klavye odağı, reduced-motion desteği ve minimum hedef boyutları
- Yeniden deneme, doğrulanmış yedekleme, korumalı sıfırlama ve tek adımlı geri alma sunan kurtarılabilir yükleme/depolama hata durumları
- Tüm uygulama verileri için JSON import/export desteği (siteler, klasörler, ayarlar ve çoklu notlar dahil)
- 10 arayüz dili desteği: Türkçe, English, Español, Português, Русский, العربية, हिन्दी, বাংলা, 中文, 日本語
- Günlük alıntı sözler: Türkçe ve İngilizce havuz; diğer arayüz dillerinde İngilizce fallback kullanılır

### Tasarım Felsefesi

- Modern ve minimalist flat tasarım
- Keskin köşeler (sharp corners)
- Solid renkler, gradient yok
- Net ve okunabilir tipografi

## Teknoloji Yığını

- **UI Kütüphanesi:** React
- **Build Aracı:** Vite
- **Stil Mimarisi:** Vanilla CSS
- **Eklenti Manifestosu:** Chrome Extension Manifest V3
- **Veri Katmanı:** chrome.storage.local / localStorage

## Mimari

Tabibe; kalıcı veri erişimini, alan işlemlerini, sürükle-bırak koordinasyonunu ve sunum katmanını birbirinden ayırır. Site, klasör ve not değişiklikleri test edilmiş saf işlemlerle yürütülür; React kancaları asenkron kayıt ve yaşam döngüsü davranışını yönetir; üst seviye kurtarma sınırları beklenmeyen render veya depolama hatalarının boş yeni sekme üretmesini engeller.

## Veri ve Gizlilik

Tabibe verileri kullanıcının tarayıcısında saklar. Siteler, klasörler, notlar, ayarlar ve arka plan tercihleri `chrome.storage.local` tabanlı sürümlenmiş veri katmanı veya yerel geliştirme ortamında `localStorage` üzerinden yönetilir. İçe/dışa aktarma işlemleri önizleme, doğrulama, geri dönüş ve geri alma desteğiyle yerel JSON dosyaları üzerinden yapılır.

Marka simgeleri eklenti içinde yerel olarak paketlenir ve üçüncü taraf simge servisi gerektirmez. Chrome favicon sağlayıcısı yalnızca kullanıcının açık izniyle etkinleştirilir; marka veya favicon çözümlenemediğinde yerel monogram her zaman kullanılabilir.

Tabibe analiz, reklam, telemetri veya uzak uygulama sunucusu içermez. İzinler ve veri işleme ayrıntıları için [Gizlilik Politikası](../privacy-policy.tr.md) belgesine bakabilirsiniz.

## Geliştirme

### Gereksinimler

- Node.js (v18+)
- npm veya yarn
- Chromium tabanlı tarayıcı (Chrome, Edge, Brave, Opera vb.)

### Kurulum

```bash
git clone https://github.com/tercan/tabibe.git
cd tabibe
npm install
```

### Geliştirme sunucusu

```bash
npm run dev
```

### Kalite kontrolleri

```bash
npm run quality
npm run test:e2e
npm run audit
```

### Eklenti olarak yükleme

1. Projeyi build edin: `npm run build`
2. Chromium tabanlı tarayıcıda `chrome://extensions` adresine gidin
3. "Geliştirici modu"nu etkinleştirin
4. "Paketlenmemiş öğe yükle" ile `dist/` klasörünü seçin

## Lisans

Bu proje [GPL v3](../../LICENSE) lisansı altında yayınlanmıştır.

Paketlenen marka simgeleri [Simple Icons](https://simpleicons.org/) `16.26.0` sürümünden alınır; eklenti paketi kaynak projenin CC0-1.0 lisansını ve marka kullanım bildirimini içerir.
