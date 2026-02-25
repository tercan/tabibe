# Tabibe

Chromium tabanlı tarayıcılar için modern, minimalist ve yüksek performanslı yeni sekme (new tab) açılış sayfası eklentisi.

## Hakkında

Tabibe, yeni sekme deneyimini kişisel bir kontrol ve üretkenlik alanına dönüştüren açılış sayfası eklentisidir. Flat tasarım felsefesi, modüler widget altyapısı ve performans odaklı mimarisi ile kullanıcıya tam özelleştirme kontrolü sunar.

### Temel Özellikler

- Saat ve tarih widget'ı
- Hızlı erişim (speed dial) ızgarası
- Arama çubuğu
- Sürükle-bırak widget yönetimi
- Light ve dark tema desteği
- Arka plan kişiselleştirme (renk, yerel görsel)
- Komut paleti (Ctrl + K)
- Çoklu dashboard desteği
- Opsiyonel bulut senkronizasyonu

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
- **Veri Katmanı:** chrome.storage.local / IndexedDB

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

## Katkıda Bulunma

Tabibe açık kaynak bir projedir ve topluluk katkılarına açıktır. Katkıda bulunmak için lütfen `CONTRIBUTING.md` dosyasını inceleyin.

## Lisans

Bu proje [GPL v3](LICENSE) lisansı altında yayınlanmıştır.
