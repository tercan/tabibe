# Changelog

Günlük dili: [English](../../CHANGELOG.md) | Türkçe

Bu dosya, projede yapılan tüm önemli değişiklikleri belgelemektedir.
Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına dayanmaktadır.
Versiyon numaralandırması [Semantic Versioning](https://semver.org/lang/tr/) prensiplerine uymaktadır.

## [0.3.0] - 2026-05-03 17:54

### Added

- Tek not alanı yerine başlık, içerik, sabitleme, arama, aktif/arşiv görünümü ve geri alınabilir silme destekli çoklu not sistemi eklendi
- Eski `tabibe-note` verisini yeni `tabibe-notes` çoklu not yapısına otomatik taşıyan migration eklendi

### Changed

- Not paneli, not listesi ve düzenleyiciyi aynı yüzeyde gösteren iki bölmeli üretkenlik paneline dönüştürüldü
- Not paneli, ilk açılışta listeyi gösteren ve not seçildiğinde geri düğmeli tek sütun editör görünümüne geçen akışa dönüştürüldü
- Not listesi, uzun başlıklara daha fazla alan ayıracak şekilde özet ve tarih satırları kaldırılarak sıkılaştırıldı
- Not panelindeki aktif/arşiv filtreleri küçültülerek arama çubuğuyla aynı satıra taşındı
- Not listesindeki her not satırı, diğer notlardan ayrışması için belirgin çerçeve ve aktif/hover vurgusuyla güncellendi
- Not silme işlemi, geri alınabilir silme öncesinde onay isteyen panel içi karar ekranıyla güncellendi
- Ana hızlı erişim grid'indeki büyük site ekle ve klasör ekle kartları kaldırıldı; ekleme aksiyonları sağ üst araç çubuğunda bırakıldı
- Klasör modalının üst aksiyonları metin yerine erişilebilir ikon butonlarına dönüştürüldü
- Arka plan renkleri açık/koyu gruplara ayrıldı ve seçilen renk grubuna göre tema otomatik değişecek şekilde güncellendi
- Import doğrulaması `tabibe-notes` dizisini de kapsayacak şekilde genişletildi

## [0.2.0] - 2026-05-03 02:40

### Added

- Klasör silme işlemi için içeriği ana ekrana taşıma veya klasörle birlikte silme seçenekleri sunan karar ekranı eklendi
- Hızlı erişim alanına görünür site ekleme, klasör ekleme ve yönetim modu araç çubuğu eklendi
- Site ve klasör kartlarına sağ tık dışında kullanılabilen görünür işlem düğmesi eklendi
- Site silme, klasör silme, klasörden çıkarma ve klasöre taşıma işlemleri için geri alma bildirimi eklendi
- Site ekleme/düzenleme formuna hedef konum seçimi, URL tabanlı ad/simge önerisi, kart önizlemesi ve yinelenen URL uyarısı eklendi
- Klasör modalına klasör içinden site ekleme, klasör düzenleme, güvenli klasör silme ve boş durum aksiyonu eklendi
- Klasör içindeki site simgelerini sürükle-bırak ile sıralama desteği eklendi
- Klasör içindeki site simgelerini sürükle-bırak ile ana ekrana çıkarma desteği eklendi
- Klasörden ana ekrana sürükleme sırasında ana grid'de animasyonlu hedef kart önizlemesi eklendi
- Modal ve panel bileşenleri için ortak focus trap ve focus geri dönüş altyapısı eklendi
- Ayarlar panelindeki import/export akışları için erişilebilir durum mesajları eklendi

### Changed

- Klasör silme işlemi varsayılan olarak içindeki siteleri ana ekrana taşıyacak şekilde güvenli hale getirildi
- Site ekleme/düzenleme formundaki isteğe bağlı simge adı alanı manuel override olarak çalışacak şekilde güncellendi
- Hızlı erişim kartları yönetim modunda açılmak yerine düzenleme akışına yönlenecek şekilde güncellendi
- Hızlı erişim işlemleri için tüm mevcut çeviri dosyalarına yeni UI metinleri eklendi
- Site modalı, klasör modalı, not paneli ve ayarlar paneli Escape/Tab klavye davranışları açısından tutarlı hale getirildi
- Ayarlar panelindeki import/export geri bildirimleri `alert()` yerine inline ve `aria-live` destekli mesajlara taşındı
- Hızlı erişim yönetim kontrolleri metinsiz, ikon odaklı ve sağ üst köşede içerikten bağımsız duracak şekilde sadeleştirildi
- Ana ekran ve klasör içi sürükle-bırak sıralamasında hedef simgelerin yer açarak hareket etmesini sağlayan özel move animasyonu eklendi
- Simge stili seçimi, favicon ve Simple Icons modlarında gerçek kaynak önceliğini değiştirecek şekilde düzeltildi
- Simple Icons karşılığı bulunmayan siteler için favicon tabanlı siyah-beyaz hibrit simge görünümü eklendi

### Fixed

- Arka plan görseli kullanılırken saat ve tarihin açık/koyu temalarda okunabilir kalması için temaya duyarlı saat yüzeyi eklendi
- Arka plan görseli yüklüyken tema değiştirmenin görseli sıfırlaması düzeltildi
- Tema değiştirme butonunun seçili preset arka plan rengini açık/koyu gruptaki karşılığına taşımaması düzeltildi
- Not panelinde arşiv boş durumunun panelin altına itilmesi düzeltildi
- Not panelinde boş notların listeye ve kalıcı kayda eklenebilmesi engellendi
- Simge adı alanı boş bırakıldığında kayıt sırasında otomatik olarak URL'den tekrar doldurulması düzeltildi
- Klasör içinden klasör düzenleme modalı açılıp kaydedildiğinde veya vazgeçildiğinde kullanıcının ana ekrana düşmesi düzeltildi
- Klasör içinden site ekleme modalı açılıp kaydedildiğinde veya vazgeçildiğinde kullanıcının ana ekrana düşmesi düzeltildi
- Simple Icons karşılığı olmayan sitelerde favicon tabanlı siyah-beyaz simgenin CSS mask nedeniyle görünmemesi düzeltildi
- Klasöre taşıma sırasında aynı URL zaten hedef klasördeyse sitenin listeden kaybolma riski giderildi
- Simge klasör üzerine sürüklendiğinde klasöre taşıma yerine simge-klasör sıralaması yapılması düzeltildi
- Klasöre taşıma bekleme alanı varsayılan davranış yapılırken simge ile klasörün kenar bölgeden yer değiştirebilmesi geri getirildi
- Klasör orta alanında başlayan bırakma işleminin bekleme süresi tamamlanmadan da klasöre taşıma olarak algılanması sağlandı
- Klasör düzenleme kaydının güncel hızlı erişim listesi yerine eski storage snapshot'ına göre başarısız olabilmesi düzeltildi
- Klasör düzenleme modalının eski form state'iyle açılması ve kayıt hatasını sessiz geçmesi engellendi
- Klasör düzenleme açılırken URL alanı olmayan klasör verisinin modalı çökertmesi düzeltildi

## [0.1.2] - 2026-05-03 02:29

### Changed

- Uygulama içinde gösterilen sürüm bilgisi `package.json` sürümünden build zamanında okunacak şekilde güncellendi

### Fixed

- `package.json`, `package-lock.json`, `manifest.json` ve ayarlar ekranındaki sürüm referansları `0.1.2` olarak senkronize edildi
- Kullanılmayan eski `APP_VERSION` sabiti kaldırıldı

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
