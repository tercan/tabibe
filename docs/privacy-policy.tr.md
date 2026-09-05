# Tabibe Gizlilik Politikası

[English](privacy-policy.md) | Türkçe | [Français](privacy-policy.fr.md) | [Deutsch](privacy-policy.de.md) | [Italiano](privacy-policy.it.md)

**Yürürlük tarihi:** 5 Eylül 2026

Tabibe, tarayıcınızda yerel olarak çalışmak üzere tasarlanmış bir Chromium yeni sekme eklentisidir. Analiz, reklam, telemetri, kullanıcı hesabı veya uzak uygulama sunucusu içermez.

## Cihazınızda saklanan veriler

Tabibe; hızlı erişim sitelerini ve klasörlerini, notları ve not defterlerini, görünüm ayarlarını, yüklenen arka plan görsellerini ve özellik tercihlerini chrome.storage.local içinde saklar. Bu bilgiler yerel tarayıcı profilinizde kalır ve geliştiriciye iletilmez.

Yedek dışa aktarma işlemi cihazınızda bir JSON dosyası oluşturur. Yedek içe aktarma işlemi yalnızca seçtiğiniz dosyayı okur, yerel olarak doğrular ve kabul edilen verileri eklentinin yerel depolama alanına yazar.

Kayıtlı adres ve adlar, not metinleri, etiketler, zaman damgaları, yerel kayıt kimlikleri ve kurtarma taslakları yalnızca yeni sekme çalışma alanınız için kullanılır. Tabibe bulut eşitlemesi sunmaz. Tarayıcı demosunda eklenti depolaması yerine localStorage kullanılır.

## Tarayıcı izinleri

Tabibe en az yetki ilkesini uygular:

- storage, eklenti verilerini yerel tarayıcı profilinizde saklamak için zorunludur.
- search, gönderdiğiniz aramayı Chrome Search API üzerinden Chrome’un varsayılan arama sağlayıcısına iletmek için gereklidir. Tarayıcınızın arama ayarlarını değiştirmez.
- favicon isteğe bağlıdır. Site simgelerini etkinleştirdiğinizde Tabibe, tarayıcının önceden bildiği adresler için Chrome’un yerleşik favicon sağlayıcısını kullanabilir. Bu izni Ayarlar bölümünden geri alabilirsiniz.
- system.memory isteğe bağlıdır. Yalnızca bellek göstergesini etkinleştirdiğinizde istenir ve gösterge kapatılarak geri alınabilir.

Tabibe, yerel gösterge için sekme/pencere sayılarını tabs izni olmadan okur; sekme adreslerine, başlıklarına veya tarama geçmişine erişmez. İsteğe bağlı bellek değerleri geçici olarak gösterilir; saklanmaz ve geliştiriciye gönderilmez. Diğer sayfaları, çerezleri, parolaları veya cihaz sensörlerini okumaz.

## Ağ etkinliği

Marka simgeleri Simple Icons kaynağından eklenti içinde yerel olarak paketlenir. Kayıtlı site adresleri harici bir simge servisine gönderilmez ve Tabibe analiz veya telemetri isteği yapmaz.

Yalnızca gönderdiğiniz aramalar ve açtığınız bağlantılar (notlardaki bağlantılar dâhil) Tabibe dışına yönlendirilir. Tabibe içinde açıkça başka bir sağlayıcı seçmedikçe tarayıcınızın varsayılan arama sağlayıcısı kullanılır. Tabibe sorguları kaydetmez. Hedef siteler IP adresiniz gibi olağan bağlantı bilgilerini kendi politikalarına göre alır. Tarayıcı hizmetlerinde tarayıcı sağlayıcısının politikaları geçerlidir.

## Denetim seçenekleriniz

Siteleri, klasörleri, notları ve not defterlerini düzenleyebilir veya silebilir; görünüm tercihlerini değiştirebilir ya da sıfırlayabilir; isteğe bağlı izinleri verebilir veya geri alabilir ve Ayarlar bölümünden doğrulanmış bir yedeği dışa aktarabilir ya da geri yükleyebilirsiniz.

## Saklama ve silme

Bir öğeyi silmek onu etkin çalışma alanından kaldırır. Geri alma kopyaları, kurtarma taslakları ve yedek geri yükleme veya veri sıfırlama öncesi oluşturulan kopya, önceki içeriği yerel olarak tutabilir. Tabibe’nin tüm eklenti depolamasını temizlemek veya eklentiyi kaldırmak bu yerel eklenti verilerini kaldırır. Dışa aktarılan JSON dosyaları ve cihaz/tarayıcı yedekleri siz ayrıca silene kadar kalır.

## Depolama ve hizmet sınırları

Yerel depolama ve dışa aktarılan JSON dosyaları Tabibe tarafından şifrelenmez. Tabibe bir parola kasası değildir; parola, ödeme bilgisi veya başka hassas bilgiler saklamaktan kaçının. Tarayıcı profilinizi, cihazınızı ve yedeklerinizi koruyun. Geliştirici yerel çalışma alanınızın bir kopyasını tutmaz; bu verileri uzaktan getiremez, silemez veya kurtaramaz.

Kesintisiz çalışma, kayıpsız saklama, veri kurtarma veya sürekli destek garantisi verilmez. Yazılım, uygulanabilir hukukun izin verdiği ölçüde olduğu gibi, ek garanti olmadan sunulur. Emredici tüketici hakları ve hukuken sınırlandırılamayan sorumluluklar saklıdır. Bu sınırlar politikadaki veri kullanım taahhütlerini daraltmaz.

## Sınırlı Kullanım (Limited Use)

Tabibe’nin Chrome API’lerinden alınan bilgiler dâhil kullanıcı verilerini kullanımı, Chrome Web Mağazası Kullanıcı Verisi Politikası ve Limited Use gereksinimlerine uyar. Veriler yalnızca açıklanan yeni sekme özellikleri için kullanılır; satılmaz, reklam, profilleme, kredi değerlendirmesi veya ilgisiz amaçlarla kullanılmaz. Destek için paylaşmayı seçmediğiniz sürece geliştirici yerel çalışma alanı içeriğine erişemez.

## Politika değişiklikleri

Bu politikadaki önemli değişiklikler ilgili Tabibe sürümüyle birlikte belgelenecektir. Politika değiştiğinde yürürlük tarihi güncellenecektir.

## İletişim

Geliştirici: Tercan Keskin. Gizlilik soruları için projenin hata takip sayfasını kullanabilirsiniz. GitHub bildirimleri herkese açıktır; özel not, yedek dosyası veya kimlik bilgisi eklemeyin. Gönüllü olarak gönderdiğiniz bilgiler GitHub’ın politikalarına göre işlenir ve talebinizi yanıtlamak için geliştirici tarafından okunabilir. Projenin herkese açık sitesi GitHub Pages üzerinde barındırılır; barındırma hizmetinin politikaları da geçerlidir.

[Tabibe sorun bildirimlerini aç](https://github.com/tercan/tabibe/issues)

[Türkçe](https://tercan.github.io/tabibe/privacy/?lang=tr)
