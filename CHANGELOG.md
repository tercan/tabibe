# Changelog

Bu dosya, projede yapılan tüm önemli değişiklikleri belgelemektedir.
Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına dayanmaktadır.
Versiyon numaralandırması [Semantic Versioning](https://semver.org/lang/tr/) prensiplerine uymaktadır.

## [0.1.1] - 2026-02-25 17:45

### Added

- `docs/` klasörüne proje tasarım sistemine uygun (koyu tema, keskin köşeler) modern tanıtım sayfası (landing page) eklendi
- Tanıtım sayfası için İngilizce ve Türkçe dil desteği eklendi
- `package.json` ve `manifest.json` versiyon numaraları `0.1.1` olarak güncellendi

## [0.1.0] - 2026-02-25 15:24

### Added

- Vite + React proje altyapısı kuruldu
- Chrome Extension Manifest V3 yapılandırması oluşturuldu (`newtab` override, `storage` izni)
- Vanilla CSS ile global stil mimarisi kuruldu (CSS Reset, design tokens, light/dark tema)
- Clock, SearchBar, SpeedDial, NotePanel, SettingsPanel, Footer bileşenleri eklendi
- Sürükle-bırak ile site sıralama ve klasörleme desteği eklendi
- Site ekleme/düzenleme modalı (SiteModal) eklendi
- Sağ tık bağlam menüsü (ContextMenu) eklendi
- Çoklu dil desteği (TR, EN, ZH, ES, HI, AR, PT, BN, RU, JA) eklendi
- GPL v3 lisans dosyası eklendi
- Responsive tasarım breakpoint'leri tanımlandı
- Paylaşımlı `CloseIcon` bileşeni oluşturuldu
- Site benzersiz ID sistemi (UUID) ve geriye dönük migration eklendi
- Opsiyonel bellek izni (`system.memory`) ve ayarlar toggle'ı eklendi
- Bellek durumu gösterimi için `show_memory` ayarı eklendi
- Simple Icons whitelist önbelleği (30 gün TTL) eklendi
- Footer'a sayfa görünürlük API'si ile polling duraklatma eklendi
- CSS `@keyframes` animasyonları (`fade_in`, `slide_up`) tanımlandı
- Ayarlar paneline eklenti hakkında bilgi kartı eklendi
- Yedekleme dosyası tarih-saat formatı (`YYYYMMDD-HHmm`) eklendi
- İçe aktarma için dosya boyutu (5MB) ve veri yapısı doğrulaması eklendi
- `README.md`, `CHANGELOG.md` ve `.gitignore` dosyaları oluşturuldu

### Changed

- Simge öncelik sistemi yeniden yapılandırıldı (Simple Icon → Favicon → Default globe)
- Google Favicon API'sine protokol dahil gönderim (`https://` origin) düzeltildi
- ContextMenu viewport taşma kontrolü eklendi
- Folder modal açıkken scroll kilidi eklendi
- `chrome.runtime.lastError` kontrolleri eklendi (Footer)
- Footer polling aralığı 5s'den 30s'ye çıkarıldı
- Arka plan görseli depolama `dataURL` → `blob URL` dönüşümü eklendi
- Sürükle-bırak hedef alanı tam genişliğe çıkarıldı
- Drop target highlight `icon-wrapper` üzerine taşındı

### Fixed

- Ölü kod temizlendi (`show_note`, kullanılmayan prop'lar, CRUD fonksiyonları)
- Site eşleştirme URL tabanlıdan ID tabanlıya çevrildi
- NotePanel overlay erişilebilirlik sorunu düzeltildi (`aria-hidden` → `role="presentation"`)
- Simge adı alanı düzenleme sırasında boş bırakılarak kaydedilememe sorunu düzeltildi
- Simple Icons 404 hataları whitelist kontrolü ile önlendi
- Default globe simgesi data URI çift encoding sorunu düzeltildi
- `handle_icon_error` data URI string karşılaştırma sorunu düzeltildi

### Security

- `system.memory` izni `optional_permissions`'a taşındı
- İçe aktarma verisi yapısal doğrulaması eklendi (max 50 anahtar, sites dizi kontrolü)
