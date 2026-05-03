/**
 * Chinese (Simplified) translation strings
 */

const zh = {
  /* Clock */
  clock_aria_label: '时钟和日期',
  day_names: [
    '星期日', '星期一', '星期二', '星期三',
    '星期四', '星期五', '星期六'
  ],
  month_names: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ],

  /* Search bar */
  search_aria_label: '搜索',
  search_label: '搜索',
  search_placeholder: '搜索 Google...',
  search_placeholder_dynamic: '搜索 {engine}...',

  /* Speed dial */
  speed_dial_aria_label: '快速访问',
  speed_dial_add: '添加网站',
  speed_dial_add_folder: '添加文件夹',
  speed_dial_toolbar_label: '快速访问管理',
  speed_dial_manage: '管理',
  speed_dial_done: '完成',
  speed_dial_actions: '操作',
  folder_empty: '此文件夹为空。',
  folder_add_site: '添加网站',
  folder_edit: '编辑文件夹',
  folder_delete: '删除文件夹',
  folder_drop_to_root_hint: '释放到主屏幕',
  folder_delete_modal_title: '删除文件夹',
  folder_delete_modal_unnamed_folder: '未命名文件夹',
  folder_delete_modal_description: '你将删除“{name}”。其中包含 {count} 个网站。',
  folder_delete_modal_empty_description: '“{name}”将被删除。其中没有保存的网站。',
  folder_delete_modal_move_title: '将网站移动到主屏幕',
  folder_delete_modal_move_description: '文件夹将被删除，其中的网站会保留在主屏幕。',
  folder_delete_modal_delete_title: '随文件夹一起删除',
  folder_delete_modal_delete_description: '文件夹及其中的所有网站都将被删除。',
  folder_delete_modal_empty_notice: '此文件夹为空，因此只会删除文件夹。',
  folder_delete_modal_empty_action: '删除文件夹',

  /* Note widget */
  note_aria_label: '我的笔记',
  note_placeholder: '在这里写笔记...',
  note_pin: '固定',
  note_pin_panel: '固定笔记面板',
  note_add: '添加笔记',
  note_back_to_list: '返回笔记列表',
  note_search_label: '搜索笔记',
  note_search_placeholder: '搜索笔记...',
  note_filter_label: '笔记筛选',
  note_filter_active: '当前',
  note_filter_archived: '归档',
  note_list_label: '笔记列表',
  note_editor_label: '笔记编辑器',
  note_title_label: '笔记标题',
  note_title_placeholder: '标题',
  note_content_label: '笔记内容',
  note_pin_item: '固定笔记',
  note_unpin_item: '取消固定',
  note_archive_item: '归档笔记',
  note_restore_item: '恢复笔记',
  note_delete_item: '删除笔记',
  note_delete_confirm_title: '删除此笔记？',
  note_delete_confirm_description: '此笔记将被删除。短时间内仍可撤销。',
  note_delete_confirm_cancel: '取消',
  note_delete_confirm_action: '删除笔记',
  note_untitled: '未命名笔记',
  note_empty_excerpt: '暂无内容',
  note_empty: '还没有笔记。',
  note_archived_empty: '没有归档笔记。',
  note_search_empty: '没有匹配搜索的笔记。',
  note_clear_search: '清除搜索',
  note_deleted: '笔记已删除。',
  note_updated_at: '最后编辑：{date}',

  /* Modal */
  modal_title_add: '添加网站',
  modal_title_edit: '编辑网站',
  modal_title_add_folder: '添加文件夹',
  modal_title_edit_folder: '编辑文件夹',
  modal_label_name: '名称',
  modal_label_url: '网址',
  modal_label_icon: '图标名称（可选）',
  modal_error_name: '请输入网站名称。',
  modal_error_url: '请输入网址。',
  modal_error_url_invalid: '请输入有效的网址。',
  modal_error_save_failed: '无法保存更改。请重试。',
  modal_cancel: '取消',
  modal_save: '保存',
  modal_placeholder_folder: '文件夹名称',
  modal_label_location: '位置',
  modal_location_root: '主屏幕',
  modal_duplicate_url: '此网址已保存。',
  modal_preview_title: '预览',
  modal_preview_empty_name: '网站名称',
  modal_preview_empty_url: '网址预览',

  /* Context menu */
  context_edit: '编辑',
  context_delete: '删除',
  context_remove_from_folder: '从文件夹中移除',

  /* Toast */
  toast_site_deleted: '网站已删除。',
  toast_folder_deleted: '文件夹已删除。网站已移动到主屏幕。',
  toast_folder_deleted_with_contents: '文件夹及其中的网站已删除。',
  toast_site_removed_from_folder: '网站已移动到主屏幕。',
  toast_site_moved_folder: '网站已移动到文件夹。',
  toast_undo: '撤销',
  toast_restored: '已恢复。',

  /* Footer */
  footer_tabs: '{tabs} 个标签页，{windows} 个窗口',
  footer_theme_toggle: '切换主题',
  footer_icon_style: '切换图标样式',
  footer_icon_style_favicon: 'Favicon 模式已启用',
  footer_icon_style_simple: 'Simple Icons 模式已启用',
  footer_settings: '设置',

  /* Settings panel */
  settings_title: '设置',
  settings_search_engine: '搜索引擎',
  settings_layout: '布局',
  settings_show_clock: '显示时钟',
  settings_show_search: '显示搜索栏',
  settings_show_memory: '显示内存状态',

  /* Background */
  settings_background: '背景',
  settings_bg_light_colors: '浅色',
  settings_bg_dark_colors: '深色',
  settings_bg_upload: '上传图片',
  settings_bg_reset: '重置',

  /* Data management */
  settings_data_management: '数据管理',
  settings_export: '导出数据',
  settings_import: '导入数据',
  settings_import_success: '数据导入成功。正在重新加载...',
  settings_import_error: '备份文件无效。',
  settings_importing: '正在导入数据...',
  settings_import_file_too_large: '备份文件过大。',
  settings_export_success: '备份文件已导出。',
  settings_export_error: '无法导出备份文件。',
  settings_about_by: '由',
  settings_about_developer: '开发者',
};

export default zh;
