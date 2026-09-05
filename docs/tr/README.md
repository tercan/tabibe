# Tabibe

Dil: [English](../../README.md) | Türkçe

Chromium tabanlı tarayıcılar için modern, minimalist ve yüksek performanslı yeni sekme (new tab) açılış sayfası eklentisi.

**Güncel sürüm:** `1.5.0`

## 1.5.0 sürümünü indir

- [Tabibe 1.5.0 ZIP](https://github.com/tercan/tabibe/releases/download/v1.5.0/tabibe-v1.5.0.zip)
- [GitHub release](https://github.com/tercan/tabibe/releases/tag/v1.5.0)
- [Website / Kurulum](https://tercan.github.io/tabibe/tr/)



## Hakkında

Tabibe, yeni sekme deneyimini kişisel bir kontrol ve üretkenlik alanına dönüştüren açılış sayfası eklentisidir. Hızlı erişim, klasörler, notlar, arama, tema, arka plan ve yedekleme özelliklerini tek ekranda sade bir üretkenlik alanı olarak birleştirir.

### Temel Özellikler

- Sürükle-bırak ve klavyeyle sıralanabilen site kısayolları ve klasörler
- Yerel paketlenmiş marka simgeleri, isteğe bağlı Chrome site simgeleri ve harf gösterimi
- Alt araçlardan veya `Alt+Shift+N` ile hızlı not yakalama
- Defterler, etiketler, metin araması, sabitlenmiş notlar ve arşiv görünümleri sunan not kütüphanesi
- Markdown yazımı/önizlemesi, kontrol listeleri, yerel kayıt durumu ve kurtarma taslakları
- Sekmeler arasındaki çakışan not düzenlemeleri için sürüm kontrollü kararlar
- Chrome Search API ile tarayıcı varsayılanını izleyen arama ve açıkça seçilebilen alternatifler
- Açık/koyu temalar, düz arka plan renkleri ve cihazınızdan görseller
- Saat, tarih, yerel sekme/pencere sayıları ve isteğe bağlı bellek göstergesi
- Doğrulama, önizleme ve tek adımlı geri alma sunan JSON yedekleme ve geri yükleme
- 13 arayüz dili: English, Türkçe, Français, Deutsch, Italiano, Español, Português, Русский, العربية, हिन्दी, বাংলা, 中文 ve 日本語
- Sağdan sola Arapça, klavye kontrolleri, azaltılmış hareket desteği ve dar pencerelere uyumlu düzenler
- 13 dilin tamamında çevrimdışı erişilebilen paket içi gizlilik politikası

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

Tabibe; kalıcı veri erişimini, alan işlemlerini, sürükle-bırak koordinasyonunu ve sunum katmanını birbirinden ayırır. Site, klasör ve not değişiklikleri test edilmiş saf işlemlerle yürütülür; React kancaları asenkron kayıt ve yaşam döngüsü davranışını yönetir; üst seviye kurtarma sınırları beklenmeyen render veya depolama hatalarının boş yeni sekme üretmesini engeller. İsteğe bağlı paneller gerektiğinde yüklenir, tarayıcı sayaçları Chrome olaylarına tepki verir ve bileşen CSS'i otomatik denetlenen tasarım tokenları etrafında düzenlenir.

## Veri ve Gizlilik

Tabibe verileri kullanıcının tarayıcısında saklar. Siteler, klasörler, notlar, ayarlar ve arka plan tercihleri `chrome.storage.local` tabanlı sürümlenmiş veri katmanı veya yerel geliştirme ortamında `localStorage` üzerinden yönetilir. İçe/dışa aktarma işlemleri önizleme, doğrulama, geri dönüş ve geri alma desteğiyle yerel JSON dosyaları üzerinden yapılır.

Marka simgeleri eklenti içinde yerel olarak paketlenir ve üçüncü taraf simge servisi gerektirmez. Chrome favicon sağlayıcısı yalnızca kullanıcının açık izniyle etkinleştirilir; marka veya favicon çözümlenemediğinde yerel monogram her zaman kullanılabilir.

Tabibe analiz, reklam, telemetri veya uzak uygulama sunucusu içermez. İzinler ve veri işleme ayrıntıları için [Gizlilik Politikası](../privacy-policy.tr.md) belgesine bakabilirsiniz. Herkese açık [Chrome Web Mağazası listeleme metni](store-listing.md) aynı davranış ve izin kapsamını belgeler.

Arama, `search` izniyle Chrome’un seçili sağlayıcısını varsayılan olarak kullanır; Tabibe içinde açıkça başka sağlayıcı seçilebilir. Sürümsüz eski sağlayıcı tercihleri bir kez tarayıcı varsayılanına taşınır. Yerel depolama ve JSON yedekleri Tabibe tarafından şifrelenmez; önemli yedeklerinizi koruyun.

## Geliştirme

### Gereksinimler

- Node.js 22.19+ (Node.js 24 önerilir)
- npm veya yarn
- Chromium tabanlı tarayıcı (Chrome, Edge, Brave, Opera vb.)

### Kurulum

```bash
git clone https://github.com/tercan/tabibe.git
cd tabibe
npm ci
```

### Geliştirme sunucusu

```bash
npm run dev
```

### Kalite kontrolleri

```bash
npm run quality
npm run test:e2e
npm run lighthouse
npm run audit
npm run package:extension
npm run check:release
```

### GitHub Pages

İngilizce/Türkçe siteyi `docs/locales/` kaynağından üretmek için `npm run build:site`, önizleme için `npm run preview:site` kullanılır. Site `main:/docs` üzerinden yayımlanır; iç çalışma belgeleri sürüm kontrolüne alınmayan `documents/` klasöründedir.

### Eklenti olarak yükleme

1. Projeyi build edin: `npm run build`
2. Chromium tabanlı tarayıcıda `chrome://extensions` adresine gidin
3. "Geliştirici modu"nu etkinleştirin
4. "Paketlenmemiş öğe yükle" ile `dist/` klasörünü seçin

## Lisans

Bu proje [GPL v3](../../LICENSE) lisansı altında yayınlanmıştır.

Paketlenen marka simgeleri [Simple Icons](https://simpleicons.org/) `16.26.0` sürümünden alınır; eklenti paketi kaynak projenin CC0-1.0 lisansını ve marka kullanım bildirimini içerir.
