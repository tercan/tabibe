/**
 * Turkish translation strings
 */

const tr = {
  /* Clock */
  clock_aria_label: 'Saat ve tarih',
  day_names: [
    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba',
    'Perşembe', 'Cuma', 'Cumartesi'
  ],
  month_names: [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ],

  /* Search bar */
  search_aria_label: 'Arama',
  search_label: 'Arama',
  search_placeholder: 'Google\'da ara...',
  search_placeholder_dynamic: '{engine} ile ara...',

  /* Speed dial */
  speed_dial_aria_label: 'Hızlı erişim',
  speed_dial_add: 'Site ekle',
  speed_dial_add_folder: 'Klasör ekle',
  speed_dial_toolbar_label: 'Hızlı erişim yönetimi',
  speed_dial_manage: 'Yönet',
  speed_dial_done: 'Bitti',
  speed_dial_actions: 'İşlemler',
  folder_empty: 'Bu klasör henüz boş.',
  folder_add_site: 'Site ekle',
  folder_edit: 'Klasörü düzenle',
  folder_delete: 'Klasörü sil',
  folder_drop_to_root_hint: 'Ana ekrana bırak',
  folder_delete_modal_title: 'Klasörü sil',
  folder_delete_modal_unnamed_folder: 'Adsız klasör',
  folder_delete_modal_description: '"{name}" klasörünü silmek üzeresiniz. İçinde {count} site var.',
  folder_delete_modal_empty_description: '"{name}" klasörü silinecek. İçinde kayıtlı site yok.',
  folder_delete_modal_move_title: 'Siteleri ana ekrana taşı',
  folder_delete_modal_move_description: 'Klasör silinir, içindeki siteler ana ekranda korunur.',
  folder_delete_modal_delete_title: 'Klasörle birlikte sil',
  folder_delete_modal_delete_description: 'Klasör ve içindeki tüm siteler silinir.',
  folder_delete_modal_empty_notice: 'Bu klasör boş olduğu için yalnızca klasör silinecek.',
  folder_delete_modal_empty_action: 'Klasörü sil',

  /* Not aracı */
  note_aria_label: 'Notlarım',
  note_placeholder: 'Notlarınızı buraya yazın...',
  note_pin: 'Sabitle',
  note_pin_panel: 'Not panelini sabitle',
  note_add: 'Not ekle',
  note_back_to_list: 'Not listesine dön',
  note_search_label: 'Notlarda ara',
  note_search_placeholder: 'Notlarda ara...',
  note_filter_label: 'Not filtresi',
  note_filter_active: 'Aktif',
  note_filter_archived: 'Arşiv',
  note_list_label: 'Not listesi',
  note_editor_label: 'Not düzenleyici',
  note_title_label: 'Not başlığı',
  note_title_placeholder: 'Başlık',
  note_content_label: 'Not içeriği',
  note_pin_item: 'Notu sabitle',
  note_unpin_item: 'Not sabitlemesini kaldır',
  note_archive_item: 'Notu arşivle',
  note_restore_item: 'Notu geri al',
  note_delete_item: 'Notu sil',
  note_delete_confirm_title: 'Not silinsin mi?',
  note_delete_confirm_description: 'Bu not silinecek. Kısa süre içinde geri alabilirsiniz.',
  note_delete_confirm_cancel: 'Vazgeç',
  note_delete_confirm_action: 'Notu sil',
  note_untitled: 'Adsız not',
  note_empty_excerpt: 'Henüz içerik yok',
  note_empty: 'Henüz not yok.',
  note_archived_empty: 'Arşivlenmiş not yok.',
  note_search_empty: 'Aramanızla eşleşen not bulunamadı.',
  note_clear_search: 'Aramayı temizle',
  note_deleted: 'Not silindi.',
  note_updated_at: 'Son düzenleme: {date}',

  /* Modal */
  modal_title_add: 'Site Ekle',
  modal_title_edit: 'Site Düzenle',
  modal_title_add_folder: 'Klasör Ekle',
  modal_title_edit_folder: 'Klasör Düzenle',
  modal_label_name: 'Ad',
  modal_label_url: 'URL',
  modal_label_icon: 'Simge adı (isteğe bağlı)',
  modal_error_name: 'Lütfen bir site adı girin.',
  modal_error_url: 'Lütfen bir URL girin.',
  modal_error_url_invalid: 'Lütfen geçerli bir URL girin.',
  modal_error_save_failed: 'Değişiklikler kaydedilemedi. Lütfen tekrar deneyin.',
  modal_cancel: 'İptal',
  modal_save: 'Kaydet',
  modal_placeholder_folder: 'Klasör adı',
  modal_label_location: 'Konum',
  modal_location_root: 'Ana ekran',
  modal_duplicate_url: 'Bu URL zaten kayıtlı.',
  modal_preview_title: 'Önizleme',
  modal_preview_empty_name: 'Site adı',
  modal_preview_empty_url: 'URL önizlemesi',

  /* Context menu */
  context_edit: 'Düzenle',
  context_delete: 'Sil',
  context_remove_from_folder: 'Klasörden çıkar',

  /* Bildirimler */
  toast_site_deleted: 'Site silindi.',
  toast_folder_deleted: 'Klasör silindi. İçindeki siteler ana ekrana taşındı.',
  toast_folder_deleted_with_contents: 'Klasör ve içindeki siteler silindi.',
  toast_site_removed_from_folder: 'Site ana ekrana taşındı.',
  toast_site_moved_folder: 'Site klasöre taşındı.',
  toast_undo: 'Geri al',
  toast_restored: 'Geri alındı.',

  /* Footer */
  footer_tabs: '{tabs} sekme, {windows} pencere',
  footer_theme_toggle: 'Tema değiştir',
  footer_icon_style: 'Simge stilini değiştir',
  footer_icon_style_favicon: 'Favicon modu kullanılıyor',
  footer_icon_style_simple: 'Simple Icons modu kullanılıyor',
  footer_settings: 'Ayarlar',

  /* Ayarlar paneli */
  settings_title: 'Ayarlar',
  settings_search_engine: 'Arama Motoru',
  settings_layout: 'Görünüm',
  settings_show_clock: 'Saati göster',
  settings_show_search: 'Arama çubuğunu göster',
  settings_show_memory: 'Bellek durumunu göster',

  settings_background: 'Arka Plan',
  settings_bg_light_colors: 'Açık renkler',
  settings_bg_dark_colors: 'Koyu renkler',
  settings_bg_upload: 'Görsel yükle',
  settings_bg_reset: 'Sıfırla',
  
  /* Veri yönetimi */
  settings_data_management: 'Veri Yönetimi',
  settings_export: 'Dışa Aktar',
  settings_import: 'İçe Aktar',
  settings_import_success: 'Veriler başarıyla içe aktarıldı. Uygulama yenileniyor...',
  settings_import_error: 'Geçersiz yedek dosyası.',
  settings_importing: 'Veriler içe aktarılıyor...',
  settings_import_file_too_large: 'Yedek dosyası çok büyük.',
  settings_export_success: 'Yedek dosyası dışa aktarıldı.',
  settings_export_error: 'Yedek dosyası dışa aktarılamadı.',
  settings_about_by: 'tarafından',
  settings_about_developer: 'Geliştirici',
};

export default tr;
