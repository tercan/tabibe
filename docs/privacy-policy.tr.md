# Tabibe Gizlilik Politikası

Dil: [English](privacy-policy.md) | Türkçe

**Yürürlük tarihi:** 17 Temmuz 2026

Tabibe, kullanıcının tarayıcısında yerel olarak çalışmak üzere tasarlanmış bir Chromium yeni sekme eklentisidir. Analiz, reklam, telemetri, kullanıcı hesabı veya uzak uygulama sunucusu içermez.

## Saklanan Veriler

Tabibe; hızlı erişim sitelerini ve klasörlerini, notları, görünüm ayarlarını, yüklenen arka plan görsellerini ve özellik tercihlerini `chrome.storage.local` içinde saklar. Bu bilgiler yerel tarayıcı profilinde kalır ve geliştiriciye iletilmez.

Yedek dışa aktarma işlemi kullanıcının cihazında bir JSON dosyası oluşturur. Yedek içe aktarma işlemi yalnızca kullanıcının seçtiği dosyayı okur, yerel olarak doğrular ve kabul edilen verileri eklentinin yerel depolama alanına yazar.

## İzinler

- `storage`, eklenti verilerini yerel tarayıcı profilinde saklamak için zorunludur.
- `favicon` isteğe bağlıdır. Kullanıcı site simgelerini açıkça etkinleştirdiğinde Tabibe, tarayıcının önceden bildiği adresler için Chrome'un yerleşik favicon sağlayıcısını kullanabilir. İzin, Tabibe ayarlarından geri alınabilir.
- `system.memory` isteğe bağlıdır. Yalnızca kullanıcı bellek göstergesini etkinleştirdiğinde istenir ve gösterge kapatılarak geri alınabilir.

Tabibe; tarama geçmişine, sekme metaverilerine, sayfa içeriğine, çerezlere, indirilenlere, kameraya, mikrofona, konuma veya kişilere erişim istemez.

## Ağ Etkinliği

Marka simgeleri Simple Icons kaynağından eklenti içinde yerel olarak paketlenir. Tabibe, kayıtlı site adreslerini harici bir simge servisine göndermez ve telemetri ya da analiz isteği yapmaz.

Ağ yönlendirmesi yalnızca kullanıcı kayıtlı bir siteyi açtığında, seçili arama sağlayıcısına arama gönderdiğinde veya görünür proje/geliştirici bağlantısını izlediğinde gerçekleşir.

## Veri Kontrolü

Kullanıcılar site, klasör ve notları ayrı ayrı düzenleyebilir veya silebilir; görünüm ayarlarını sıfırlayabilir; yedek dışa aktarabilir; doğrulanmış yedeği geri yükleyebilir ya da Tabibe'yi kaldırıp tarayıcıdaki yerel depolamasını temizleyerek tüm eklenti verilerini silebilir.

## Değişiklikler

Bu politikadaki önemli değişiklikler ilgili Tabibe sürümüyle birlikte belgelenecektir. Politika değiştiğinde yukarıdaki yürürlük tarihi güncellenecektir.

## İletişim

Gizlilikle ilgili sorular projenin [GitHub deposu](https://github.com/tercan/tabibe) üzerinden iletilebilir.
