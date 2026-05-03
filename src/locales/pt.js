/**
 * Portuguese translation strings
 */

const pt = {
  /* Clock */
  clock_aria_label: 'Relógio e data',
  day_names: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  month_names: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],

  /* Search bar */
  search_aria_label: 'Pesquisar',
  search_label: 'Pesquisar',
  search_placeholder: 'Pesquisar no Google...',
  search_placeholder_dynamic: 'Pesquisar no {engine}...',

  /* Speed dial */
  speed_dial_aria_label: 'Acesso rápido',
  speed_dial_add: 'Adicionar site',
  speed_dial_add_folder: 'Adicionar pasta',
  speed_dial_toolbar_label: 'Gestão de acesso rápido',
  speed_dial_manage: 'Gerir',
  speed_dial_done: 'Concluído',
  speed_dial_actions: 'Ações',
  folder_empty: 'Esta pasta está vazia.',
  folder_add_site: 'Adicionar site',
  folder_edit: 'Editar pasta',
  folder_delete: 'Excluir pasta',
  folder_drop_to_root_hint: 'Soltar na tela principal',
  folder_delete_modal_title: 'Excluir pasta',
  folder_delete_modal_unnamed_folder: 'Pasta sem título',
  folder_delete_modal_description: 'Você está prestes a excluir "{name}". Ela contém {count} site.',
  folder_delete_modal_empty_description: '"{name}" será excluída. Ela não contém sites salvos.',
  folder_delete_modal_move_title: 'Mover sites para a tela principal',
  folder_delete_modal_move_description: 'A pasta será excluída e seus sites serão mantidos na tela principal.',
  folder_delete_modal_delete_title: 'Excluir com a pasta',
  folder_delete_modal_delete_description: 'A pasta e todos os sites dentro dela serão excluídos.',
  folder_delete_modal_empty_notice: 'Esta pasta está vazia, então apenas a pasta será excluída.',
  folder_delete_modal_empty_action: 'Excluir pasta',

  /* Note widget */
  note_aria_label: 'Minhas notas',
  note_placeholder: 'Escreva suas notas aqui...',
  note_pin: 'Fixar',
  note_pin_panel: 'Fixar painel de notas',
  note_add: 'Adicionar nota',
  note_back_to_list: 'Voltar à lista de notas',
  note_search_label: 'Pesquisar notas',
  note_search_placeholder: 'Pesquisar notas...',
  note_filter_label: 'Filtro de notas',
  note_filter_active: 'Ativas',
  note_filter_archived: 'Arquivo',
  note_list_label: 'Lista de notas',
  note_editor_label: 'Editor de notas',
  note_title_label: 'Título da nota',
  note_title_placeholder: 'Título',
  note_content_label: 'Conteúdo da nota',
  note_pin_item: 'Fixar nota',
  note_unpin_item: 'Desafixar nota',
  note_archive_item: 'Arquivar nota',
  note_restore_item: 'Restaurar nota',
  note_delete_item: 'Excluir nota',
  note_delete_confirm_title: 'Excluir nota?',
  note_delete_confirm_description: 'Esta nota será excluída. Você ainda poderá desfazer por alguns instantes.',
  note_delete_confirm_cancel: 'Cancelar',
  note_delete_confirm_action: 'Excluir nota',
  note_untitled: 'Nota sem título',
  note_empty_excerpt: 'Ainda sem conteúdo',
  note_empty: 'Ainda não há notas.',
  note_archived_empty: 'Não há notas arquivadas.',
  note_search_empty: 'Nenhuma nota corresponde à sua pesquisa.',
  note_clear_search: 'Limpar pesquisa',
  note_deleted: 'Nota excluída.',
  note_updated_at: 'Última edição: {date}',

  /* Modal */
  modal_title_add: 'Adicionar site',
  modal_title_edit: 'Editar site',
  modal_title_add_folder: 'Adicionar pasta',
  modal_title_edit_folder: 'Editar pasta',
  modal_label_name: 'Nome',
  modal_label_url: 'URL',
  modal_label_icon: 'Nome do ícone (opcional)',
  modal_error_name: 'Por favor, insira um nome.',
  modal_error_url: 'Por favor, insira uma URL.',
  modal_error_url_invalid: 'Por favor, insira uma URL válida.',
  modal_error_save_failed: 'Não foi possível salvar as alterações. Tente novamente.',
  modal_cancel: 'Cancelar',
  modal_save: 'Salvar',
  modal_placeholder_folder: 'Nome da pasta',
  modal_label_location: 'Localização',
  modal_location_root: 'Tela principal',
  modal_duplicate_url: 'Esta URL já está salva.',
  modal_preview_title: 'Pré-visualização',
  modal_preview_empty_name: 'Nome do site',
  modal_preview_empty_url: 'Pré-visualização da URL',

  /* Context menu */
  context_edit: 'Editar',
  context_delete: 'Excluir',
  context_remove_from_folder: 'Remover da pasta',

  /* Toast */
  toast_site_deleted: 'Site excluído.',
  toast_folder_deleted: 'Pasta excluída. Os sites foram movidos para a tela principal.',
  toast_folder_deleted_with_contents: 'Pasta e sites excluídos.',
  toast_site_removed_from_folder: 'Site movido para a tela principal.',
  toast_site_moved_folder: 'Site movido para a pasta.',
  toast_undo: 'Desfazer',
  toast_restored: 'Restaurado.',

  /* Footer */
  footer_tabs: '{tabs} abas, {windows} janelas',
  footer_theme_toggle: 'Alternar tema',
  footer_icon_style: 'Alternar estilo de ícone',
  footer_icon_style_favicon: 'Modo favicon ativo',
  footer_icon_style_simple: 'Modo Simple Icons ativo',
  footer_settings: 'Configurações',

  /* Settings panel */
  settings_title: 'Configurações',
  settings_search_engine: 'Motor de busca',
  settings_layout: 'Layout',
  settings_show_clock: 'Mostrar relógio',
  settings_show_search: 'Mostrar barra de pesquisa',
  settings_show_memory: 'Mostrar estado da memória',

  /* Background */
  settings_background: 'Fundo',
  settings_bg_light_colors: 'Cores claras',
  settings_bg_dark_colors: 'Cores escuras',
  settings_bg_upload: 'Carregar imagem',
  settings_bg_reset: 'Redefinir',

  /* Data management */
  settings_data_management: 'Gestão de dados',
  settings_export: 'Exportar dados',
  settings_import: 'Importar dados',
  settings_import_success: 'Dados importados com sucesso. Recarregando...',
  settings_import_error: 'Arquivo de backup inválido.',
  settings_importing: 'Importando dados...',
  settings_import_file_too_large: 'O arquivo de backup é muito grande.',
  settings_export_success: 'Arquivo de backup exportado.',
  settings_export_error: 'Não foi possível exportar o arquivo de backup.',
  settings_about_by: 'por',
  settings_about_developer: 'Desenvolvedor',
};

export default pt;
