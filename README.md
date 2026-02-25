# Tabibe

Chromium tabanlı tarayıcılar için modern, minimalist ve yüksek performanslı yeni sekme (new tab) açılış sayfası eklentisi.

## Hakkında

Tabibe, yeni sekme deneyimini kişisel bir kontrol ve üretkenlik alanına dönüştüren açılış sayfası eklentisidir. Flat tasarım felsefesi, modüler bileşen altyapısı ve performans odaklı mimarisi ile kullanıcıya tam özelleştirme kontrolü sunar.

### Temel Özellikler

- Saat ve tarih widget'ı
- Hızlı erişim (speed dial) ızgarası
- Arama çubuğu (Google, Bing, DuckDuckGo, Yandex)
- Not paneli (sabitlenebilir)
- Sürükle-bırak ile site sıralama ve klasörleme
- Light ve dark tema desteği
- Arka plan kişiselleştirme (renk, yerel görsel)
- Çoklu simge modu (Favicon / Simple Icons)
- Veri yedekleme ve geri yükleme (JSON)
- 10 dil desteği: Türkçe, English, Español, Portugûes, Русский, العربية, हिन्दी, বাংলা, 中文, 日本語

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
