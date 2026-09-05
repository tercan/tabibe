# Changelog

Günlük dili: [English](../../CHANGELOG.md) | Türkçe

Bu dosya, projede yapılan tüm önemli değişiklikleri belgelemektedir.
Format [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) standardına dayanmaktadır.
Versiyon numaralandırması [Semantic Versioning](https://semver.org/lang/tr/) prensiplerine uymaktadır.

## [1.5.0] - 2026-09-06 00:30

### Added

- Defterler, etiketler, yerel kurtarma taslakları ve örnek notlar içeren Not Kütüphanesi ve Hızlı Yakalama akışı eklendi.
- Fransızca, Almanca ve İtalyanca desteğiyle arayüz dili sayısı 13 oldu.
- Çevrimdışı çok dilli gizlilik politikası ve eşitlenen herkese açık politika sayfaları eklendi.

### Changed

- Not kontrolleri sadeleştirildi; yeni sekme yüzeyleri, klavye eylemleri ve RTL düzenleri iyileştirildi.
- İngilizce ve Türkçe GitHub Pages sitesi gerçek ekran görüntüleri, güncel özellikler, sürüm indirmeleri, kurulum adımları ve yerel veri sınırlarıyla yenilendi.
- Site ortak yerelleştirme kaynağından üretiliyor; yerel görseller, metadata, sitemap ve responsive erişilebilirlik kontrolleri eklendi.
- Güncel Lighthouse araç zinciri için geliştirme ortamı gereksinimi Node.js 22.19+ oldu.

### Fixed

- Varsayılan arama Chrome Search API ile tarayıcı tercihini izliyor; sürümsüz eski tercihler bir kez taşınırken sonraki açık seçimler korunuyor.
- Arama sağlayıcısı hedef boyutu ve klavye odağı düzeltildi.
- Release ZIP içeriği üretim derlemesiyle karşılaştırılıyor ve proje lisansı pakete ekleniyor.

### Security

- Lighthouse ve yardımcı geliştirme bağımlılıkları güncellendi; tam npm denetiminde bilinen açık bulunmadı.
- Şifreleme veya kesin veri kurtarma vaadi vermeden depolama, yedekleme, kurtarma kopyaları, destek ve Limited Use açıklamaları netleştirildi.

## [1.4.0] - 2026-07-18 00:48

### Added

- Seçimi koruyan kalın, italik, madde işaretli liste, kontrol listesi ve bağlantı ekleme eylemlerine sahip simge tabanlı Markdown araç çubuğu eklendi
- GFM görev listeleri, tablolar, kod, başlıklar ve harici bağlantılar sunan responsive Markdown önizlemesi eklendi
- Not editörüne Unicode uyumlu kelime ve karakter sayaçları eklendi
- Klavyeyle kullanılabilen erişilebilir şablon menüsüyle yerelleştirilmiş boş not, günlük plan, toplantı ve kontrol listesi şablonları eklendi

### Changed

- Not editörü odaklı bir bileşene ayrıldı; biçimlendirme, şablon üretimi, sayaçlar ve URL politikası test edilen domain modüllerine taşındı
- Birincil not ekleme kontrolü, boş notu ilk seçenek olarak koruyan kompakt bir şablon seçiciye dönüştürüldü

### Security

- Önizlemelerde ham HTML ve uzak görseller çalıştırılmadı; öğeler açık bir izin listesiyle, bağlantılar `http`, `https` ve `mailto` protokolleriyle sınırlandırıldı

## [1.3.0] - 2026-07-18 00:31

### Added

- Tümünü seçme, toplu etiket ekleme/kaldırma, arşivleme, geri yükleme ve silme eylemlerine sahip çoklu not yönetimi eklendi
- Odak düzenlenebilir alanların dışındayken hızlı not için `Alt+Shift+N`, çalışma alanında yeni not ve arama için `N` ile `/` komutları eklendi
- Toplu not silme için çoğul onay, bildirim ve geri alma davranışı eklendi

### Changed

- Tekli ve toplu silme, geri alındığında notların özgün konumunu koruyan ortak sıralı geri yükleme akışında birleştirildi
- Tarayıcıya ayrılmış kısayolların ve metin giriş tuşlarının başlık, içerik, arama veya form alanı odaktayken doğal davranışı korundu

### Fixed

- Tüketilmiş bir hızlı yakalama isteğinin not paneli yeniden bağlandığında boş not olarak tekrar açılması engellendi

## [1.2.0] - 2026-07-18 00:12

### Added

- Oluşturma, yeniden adlandırma, silme, çoklu atama ve etiket duyarlı arama sunan merkezi ve renk tokenı tabanlı not etiketleri eklendi
- Görünür sonuç sayıları ve kalıcı güncelleme/oluşturma/başlık sıralamasıyla sabitlenmiş, etiket ve tarih filtreleri eklendi
- Yerel sürümü, diğer sekmedeki sürümü veya iki sürümü kopya olarak koruyan açık sekmeler arası çakışma kararları eklendi

### Changed

- Uygulama verileri not `tagIds` alanları, monoton revision değerleri, merkezi `noteTags` ve bozuk referans temizliğiyle şema v2'ye geçirildi
- Yedek formatı v2 ve içe aktarma önizlemesi not etiketlerini kapsayacak şekilde genişletilirken v1 ve v0.3 yedek uyumluluğu korundu

### Security

- Eski bir not yazımının başka sekmedeki daha yeni sürümün üzerine sessizce yazmasını engelleyen iyimser revision kontrolleri eklendi

## [1.1.0] - 2026-07-17 23:43

### Added

- Not paneli için kalıcı sol ve sağ konum kontrolleri eklendi
- Responsive üç sütunlu, iki sütunlu ve tek görünümlü düzenlere sahip tam ekran Notlarım çalışma alanı eklendi

### Changed

- Tam ekran etkinken panel sabitleme askıya alındı ve panel moduna dönüldüğünde kayıtlı sabitleme durumu geri yüklendi
- RTL dillerinde fiziksel panel konumu korundu; odak tuzağı, sayfa kaydırma kilidi ve klavye gezinmesi tam ekran çalışma alanını kapsayacak şekilde genişletildi

## [1.0.1] - 2026-07-17 23:28

### Added

- Öğe sayısını gösteren ayrı klasör yüzeyleri ve Notlarım için özel not defteri simgesi eklendi

### Changed

- Hızlı erişim simgeleri küçültüldü, klasör renkleri yumuşatıldı ve etkileşimli yüzeylerdeki focus göstergeleri güçlendirildi

### Fixed

- Monogram fallback'lerinin yüklenen marka ve favicon görsellerinin altında görünür kalması engellendi
- Başarıyla yüklenen faviconların fallback zaman aşımı iptal edilerek görünür kalması sağlandı

## [1.0.0] - 2026-07-17 04:16

### Added

- Sürüm eşitliği, izin kapsamı, CSP, yerelleştirme, çalışma zamanı simge kaynakları, secret taraması, dokümantasyon ve ZIP içeriği için yayın hazırlığı kapısı eklendi
- v0.3.0 yedeklerinin güncel biçime eksiksiz yeniden dışa aktarımı ve başarısız geri yükleme yazımlarında otomatik rollback davranışı testlerle güvenceye alındı
- Eşlenmiş İngilizce ve Türkçe Chrome Web Mağazası listeleme metinleri ile eklenti ve herkese açık proje sayfalarına doğrudan gizlilik politikası bağlantıları eklendi
- 10 arayüz dilinin tamamını aynı mesaj sözleşmesinde tutan çeviri testi eklendi

### Changed

- 0.x yol haritasında tamamlanan veri, simge, erişilebilirlik, mimari, yerelleştirme ve performans çalışmaları kararlı 1.0.0 sürüm tabanına taşındı
- Eski sürüm numarası, geniş izin, yasak dosya, harici çalışma zamanı simge servisi veya eksik mağaza dokümantasyonu içeren sürümleri engelleyecek şekilde CI genişletildi
- Belgelenen ve zorunlu geliştirme çalışma zamanı kalite araç zincirinin Node.js 20.19+ gereksinimiyle eşitlendi

### Security

- Kararlı paketin yalnızca `storage` zorunlu iznini istediği, `favicon` ve `system.memory` izinlerini isteğe bağlı tuttuğu, uzaktan kod çalıştırmadığı ve bilinen bağımlılık açığı içermediği doğrulandı

## [0.6.1] - 2026-07-17 04:04

### Added

- Performans, erişilebilirlik, iyi uygulamalar ve SEO için Lighthouse sürüm bütçeleri eklendi
- Token, spacing, gölge, gradient, radius ve letter-spacing kurallarını denetleyen otomatik CSS mimari kontrolü eklendi
- Arka plan object URL yaşam döngüsü ve olay tabanlı tarayıcı istatistikleri için testler eklendi

### Changed

- İlk JavaScript yükünü 113.447 gzip bayta indirmek için notlar, ayarlar, context menu ve site/klasör modal akışları gerektiğinde yüklenecek şekilde ayrıldı
- 30 saniyelik sekme/pencere polling döngüsü Chrome olay dinleyicileri ve görünürlük tabanlı yenilemeyle değiştirildi
- Tek parça stil dosyası token, reset, base, layout, bileşen, yardımcı, responsive ve animasyon katmanlarına ayrıldı

### Fixed

- Üretilen arka plan object URL'lerinin görsel değiştiğinde veya yeni sekme kapandığında serbest bırakılması sağlandı
- Not paneli asenkron veri yüklemesinden sonra yeniden açıldığında Escape ile kapatma ve odak tuzağı davranışı düzeltildi

## [0.6.0] - 2026-07-17 03:42

### Added

- Canlı konum bildirimi ve geri alma desteğiyle klavyeden sola/sağa sıralama, klasöre taşıma ve ana ekrana taşıma eylemleri eklendi
- Kalıcı dil seçimi, kök dil/yön eşitlemesi ve desteklenen 10 dilin tamamı için uzantı metadatası eklendi
- Yinelenen URL'lerde mevcut siteyi güncelleme veya ikinci kaydı ekleme kararı eklendi
- Yerel geliştirme ve özel ağ adreslerinden ayrılan genel HTTP güvenlik uyarısı eklendi
- Site ve klasör formlarına asenkron kayıt ilerlemesi ile disabled durumları eklendi

### Changed

- Context menu rol modeli, odağı çağıran düğmeye geri döndüren native düğme ve seçim eylem listesiyle değiştirildi
- Yöne bağlı düzen kuralları logical CSS özelliklerine dönüştürüldü; panel, toggle, toast ve portallara sağdan sola davranış eklendi
- Düşük öncelikli sekme, pencere ve bellek sayaçları mobilde kompakt bilgi menüsüne taşındı

### Fixed

- Kullanıcının seçtiği arayüz dilinin her yeni sekme yüklemesinde tarayıcı diline dönmesi engellendi
- Yinelenen kayıtların açık kullanıcı kararı olmadan sessizce kabul edilmesi engellendi

## [0.5.0] - 2026-07-17 03:21

### Added

- Site, klasör ve not değişiklikleri için test edilmiş alan işlem modülleri eklendi
- Hızlı erişim kalıcılığı, sürükleme koordinasyonu, not yaşam döngüsü ve referans sayımlı gövde kaydırma kilidi için ayrı kancalar eklendi
- Uygulama yükleme, depolama kurtarma, korumalı sıfırlama, sıfırlama öncesi yedekleme ve geri alma durumları eklendi
- Kurtarma akışları, depolama sıfırlama/geri alma, gezinme, ortak kaydırma kilidi ve ayrıştırılan alan işlemleri için birim testleri eklendi

### Changed

- Hızlı erişim verisi, sürükleme davranışı, overlay'ler, gezinme ve değişiklik mantığı ana sunum bileşeninden ayrıldı
- Not kalıcılığı, filtreleme, oluşturma, güncelleme, arşivleme, geri yükleme ve silme davranışları not panelinden ayrıldı
- Bileşen bağımlılığını ve tekrarlanan kaynak yönetimini kaldırmak için arama motoru yapılandırması ile yedek dosyası üretimi merkezileştirildi

### Fixed

- Tam sayfa yenileme tabanlı kurtarma, yalnızca hızlı erişim depolamasını yeniden deneyen akışla değiştirildi
- Eş zamanlı panel ve modal kullanımında bir yüzeyin başka bir yüzeye ait gövde kaydırma kilidini kaldırması engellendi
- Yedek indirmeleri için oluşturulan nesne URL'lerinin her durumda iptal edilmesi sağlandı

## [0.4.1] - 2026-07-17 02:53

### Added

- Yerel veri işleme, ağ davranışı ve isteğe bağlı izinleri açıklayan İngilizce ve Türkçe gizlilik politikaları eklendi
- Otomatik tema kontrastı, klavye odağı, hedef boyutu, reduced-motion, CSP ve izin kapsamı kontrolleri eklendi

### Changed

- İsteğe bağlı favicon ve sistem belleği izinleri, bu özellikleri etkinleştiren kontroller üzerinden geri alınabilir hale getirildi
- Reduced-motion davranışı CSS geçişlerini, keyframe'leri ve sürükle-bırak taşıma efektlerini kapsayacak şekilde genişletildi
- Eklenti paketi gizli dosyalara, source map'lere, kimlik bilgilerine, arşivlere, kaynak klasörlerine ve sembolik bağlantılara karşı sertleştirildi

### Fixed

- Açık ve koyu tema tokenları, bütün arka plan presetlerinde WCAG 2.2 AA metin, kontrol ve odak kontrastı eşiklerini karşılayacak şekilde güncellendi
- Görünür odak göstergeleri geri getirildi; kompakt kontroller ve ayar bağlantıları en az 24 CSS piksel hedefe çıkarıldı

### Security

- Gereksiz zorunlu `tabs` izni kaldırılırken Tabs API gezinme davranışı gerçek uzantı profilinde doğrulandı
- Uzantı sayfaları için yerel script, varlık, görsel ve bağlantılarla sınırlı açık CSP eklendi

## [0.4.0] - 2026-07-17 02:39

### Added

- Aranabilir marka seçimi ve paketlenmiş lisans bildirimleriyle sabitlenmiş yerel Simple Icons 16.26.0 kataloğu eklendi
- Yalnızca kullanıcının açık eylemiyle istenen isteğe bağlı Chrome favicon desteği eklendi
- Kayıtlı her sitenin çevrimdışı durumda görünür fallback'e sahip olması için deterministik yerel monogramlar eklendi
- Site formuna canlı önizlemeli otomatik, marka, site ve harf simge tercihleri eklendi

### Changed

- Eski simge adı alanı, yapılandırılmış simge tercih modeli ve otomatik migration ile değiştirildi
- Çalışma zamanındaki Iconify, Simple Icons CDN ve Google S2 simge istekleri yerel varlıklar ve Chrome'un yerleşik favicon sağlayıcısıyla değiştirildi

### Fixed

- Simple Icons eşleşmesi bulunmadığında veya görsel isteği hata verdiğinde, zaman aşımına uğradığında ya da çevrimdışı olduğunda site simgesinin kaybolması düzeltildi
- Önbellekli yerel SVG yüklemesinin state eşitlemesinden önce tamamlanması nedeniyle monogram fallback'inde kalması düzeltildi

## [0.3.1] - 2026-07-17 02:17

### Added

- Site, klasör, not ve ayarlar için sürümlenmiş uygulama veri şeması ile tek bir asenkron depolama katmanı eklendi
- Birim testi, gerçek uzantı E2E testi, erişilebilirlik, lint, format, bağımlılık denetimi, paket bütçesi ve paket doğrulama kalite kapıları eklendi
- İçe aktarma önizlemesi, aşamalı geri yükleme doğrulaması, otomatik geri dönüş ve tek adımda geri alma desteği eklendi

### Changed

- Yüklenen arka plan görselleri depolamadan önce yerel olarak optimize edilecek ve dosya türü/boyutu doğrulanacak şekilde güncellendi
- Notların kalıcı kaydı, görünür kayıt durumları ve yeni sekme gizlendiğinde veya kapatıldığında yaşam döngüsü kaydıyla güncellendi
- Site ve klasör değişiklikleri, kalıcı depolama hatasında önceki arayüz durumunu geri yükleyecek ve kullanıcıya hata bildirecek şekilde güncellendi

### Fixed

- Bilinçli olarak boş bırakılmış hızlı erişim listesinin migration sırasında varsayılan sitelerle yeniden doldurulması engellendi
- Boş notların ve geçersiz içe aktarma verilerinin kalıcı duruma girmesi engellendi
- Güvensiz veya desteklenmeyen URL protokollerinin ekleme, düzenleme, gezinme veya yedekten geri yükleme akışlarında kabul edilmesi düzeltildi

### Security

- Güvenlik açığı bulunan derleme bağımlılıkları güncellendi ve bağımlılık denetimi bilinen sıfır açıkla doğrulandı
- Saklanan arka plan görselleri desteklenen raster veri URL'leriyle sınırlandırıldı ve veri alanlarına boyut limitleri eklendi

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
