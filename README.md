# Tabibe

Chromium tabanlı tarayıcılar için modern, minimalist ve yüksek performanslı yeni sekme (new tab) açılış sayfası eklentisi.

**Güncel sürüm:** `0.3.0`

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
- Favicon ve Simple Icons simge modları
- Simple Icons karşılığı olmayan siteler için favicon tabanlı siyah-beyaz hibrit simge görünümü
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

## Veri ve Gizlilik

Tabibe verileri kullanıcının tarayıcısında saklar. Siteler, klasörler, notlar, ayarlar ve arka plan tercihleri `chrome.storage.local` veya yerel geliştirme ortamında `localStorage` üzerinden yönetilir. Import/export işlemleri JSON dosyasıyla yerel olarak yapılır.

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

### Eklenti olarak yükleme

1. Projeyi build edin: `npm run build`
2. Chromium tabanlı tarayıcıda `chrome://extensions` adresine gidin
3. "Geliştirici modu"nu etkinleştirin
4. "Paketlenmemiş öğe yükle" ile `dist/` klasörünü seçin

## Lisans

Bu proje [GPL v3](LICENSE) lisansı altında yayınlanmıştır.
