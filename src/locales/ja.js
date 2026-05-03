/**
 * Japanese translation strings
 */

const ja = {
  /* Clock */
  clock_aria_label: '時計と日付',
  day_names: [
    '日曜日', '月曜日', '火曜日', '水曜日',
    '木曜日', '金曜日', '土曜日'
  ],
  month_names: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ],

  /* Search bar */
  search_aria_label: '検索',
  search_label: '検索',
  search_placeholder: 'Googleで検索...',
  search_placeholder_dynamic: '{engine}で検索...',

  /* Speed dial */
  speed_dial_aria_label: 'クイックアクセス',
  speed_dial_add: 'サイトを追加',
  speed_dial_add_folder: 'フォルダを追加',
  speed_dial_toolbar_label: 'クイックアクセス管理',
  speed_dial_manage: '管理',
  speed_dial_done: '完了',
  speed_dial_actions: '操作',
  folder_empty: 'このフォルダは空です。',
  folder_add_site: 'サイトを追加',
  folder_edit: 'フォルダを編集',
  folder_delete: 'フォルダを削除',
  folder_drop_to_root_hint: 'メイン画面にドロップ',
  folder_delete_modal_title: 'フォルダを削除',
  folder_delete_modal_unnamed_folder: '無題のフォルダ',
  folder_delete_modal_description: '「{name}」を削除しようとしています。{count}件のサイトが含まれています。',
  folder_delete_modal_empty_description: '「{name}」は削除されます。保存されたサイトはありません。',
  folder_delete_modal_move_title: 'サイトをメイン画面へ移動',
  folder_delete_modal_move_description: 'フォルダを削除し、サイトはメイン画面に残します。',
  folder_delete_modal_delete_title: 'フォルダと一緒に削除',
  folder_delete_modal_delete_description: 'フォルダと中のすべてのサイトを削除します。',
  folder_delete_modal_empty_notice: 'このフォルダは空なので、フォルダのみ削除されます。',
  folder_delete_modal_empty_action: 'フォルダを削除',

  /* Note widget */
  note_aria_label: 'メモ',
  note_placeholder: 'ここにメモを書いてください...',
  note_pin: '固定',
  note_pin_panel: 'メモパネルを固定',
  note_add: 'メモを追加',
  note_back_to_list: 'メモ一覧に戻る',
  note_search_label: 'メモを検索',
  note_search_placeholder: 'メモを検索...',
  note_filter_label: 'メモフィルター',
  note_filter_active: 'アクティブ',
  note_filter_archived: 'アーカイブ',
  note_list_label: 'メモ一覧',
  note_editor_label: 'メモエディター',
  note_title_label: 'メモのタイトル',
  note_title_placeholder: 'タイトル',
  note_content_label: 'メモ本文',
  note_pin_item: 'メモを固定',
  note_unpin_item: '固定を解除',
  note_archive_item: 'メモをアーカイブ',
  note_restore_item: 'メモを復元',
  note_delete_item: 'メモを削除',
  note_delete_confirm_title: 'メモを削除しますか？',
  note_delete_confirm_description: 'このメモは削除されます。短時間であれば元に戻せます。',
  note_delete_confirm_cancel: 'キャンセル',
  note_delete_confirm_action: 'メモを削除',
  note_untitled: '無題のメモ',
  note_empty_excerpt: '内容はまだありません',
  note_empty: 'メモはまだありません。',
  note_archived_empty: 'アーカイブ済みメモはありません。',
  note_search_empty: '検索に一致するメモはありません。',
  note_clear_search: '検索をクリア',
  note_deleted: 'メモを削除しました。',
  note_updated_at: '最終編集: {date}',

  /* Modal */
  modal_title_add: 'サイトを追加',
  modal_title_edit: 'サイトを編集',
  modal_title_add_folder: 'フォルダを追加',
  modal_title_edit_folder: 'フォルダを編集',
  modal_label_name: '名前',
  modal_label_url: 'URL',
  modal_label_icon: 'アイコン名（任意）',
  modal_error_name: '名前を入力してください。',
  modal_error_url: 'URLを入力してください。',
  modal_error_url_invalid: '有効なURLを入力してください。',
  modal_error_save_failed: '変更を保存できませんでした。もう一度お試しください。',
  modal_cancel: 'キャンセル',
  modal_save: '保存',
  modal_placeholder_folder: 'フォルダ名',
  modal_label_location: '場所',
  modal_location_root: 'メイン画面',
  modal_duplicate_url: 'このURLはすでに保存されています。',
  modal_preview_title: 'プレビュー',
  modal_preview_empty_name: 'サイト名',
  modal_preview_empty_url: 'URLプレビュー',

  /* Context menu */
  context_edit: '編集',
  context_delete: '削除',
  context_remove_from_folder: 'フォルダから削除',

  /* Toast */
  toast_site_deleted: 'サイトを削除しました。',
  toast_folder_deleted: 'フォルダを削除しました。サイトはメイン画面に移動しました。',
  toast_folder_deleted_with_contents: 'フォルダと中のサイトを削除しました。',
  toast_site_removed_from_folder: 'サイトをメイン画面に移動しました。',
  toast_site_moved_folder: 'サイトをフォルダに移動しました。',
  toast_undo: '元に戻す',
  toast_restored: '復元しました。',

  /* Footer */
  footer_tabs: '{tabs} タブ、{windows} ウィンドウ',
  footer_theme_toggle: 'テーマ切替',
  footer_icon_style: 'アイコンスタイル切替',
  footer_icon_style_favicon: 'Faviconモードが有効です',
  footer_icon_style_simple: 'Simple Iconsモードが有効です',
  footer_settings: '設定',

  /* Settings panel */
  settings_title: '設定',
  settings_search_engine: '検索エンジン',
  settings_layout: 'レイアウト',
  settings_show_clock: '時計を表示',
  settings_show_search: '検索バーを表示',
  settings_show_memory: 'メモリ状態を表示',

  /* Background */
  settings_background: '背景',
  settings_bg_light_colors: '明るい色',
  settings_bg_dark_colors: '暗い色',
  settings_bg_upload: '画像をアップロード',
  settings_bg_reset: 'リセット',

  /* Data management */
  settings_data_management: 'データ管理',
  settings_export: 'データをエクスポート',
  settings_import: 'データをインポート',
  settings_import_success: 'データが正常にインポートされました。再読み込み中...',
  settings_import_error: '無効なバックアップファイルです。',
  settings_importing: 'データをインポートしています...',
  settings_import_file_too_large: 'バックアップファイルが大きすぎます。',
  settings_export_success: 'バックアップファイルをエクスポートしました。',
  settings_export_error: 'バックアップファイルをエクスポートできませんでした。',
  settings_about_by: '作者',
  settings_about_developer: '開発者',
};

export default ja;
