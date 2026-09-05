import { createRef } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import I18nProvider from '../I18nProvider.jsx';
import { groupNotesForLibrary } from '../../domain/notePresentation.js';
import NoteEditor from './NoteEditor.jsx';
import NoteLibraryHeader from './NoteLibraryHeader.jsx';
import { NoteFilterContent, NoteMoreContent, NoteSortContent } from './NoteLibraryMenus.jsx';
import NoteListPane from './NoteListPane.jsx';
import NoteListToolbar from './NoteListToolbar.jsx';
import NoteSaveStatus from './NoteSaveStatus.jsx';

function renderLocalized(node) {
  return render(<I18nProvider>{node}</I18nProvider>);
}

function createNote(overrides = {}) {
  return {
    id: 'note-one',
    title: '',
    content: 'Capture content stays intact.',
    tagIds: [],
    notebookId: null,
    isPinned: false,
    isArchived: false,
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-04T10:00:00.000Z',
    revision: 1,
    ...overrides,
  };
}

function createEditorProps(overrides = {}) {
  return {
    activeNote: createNote(),
    contentInputRef: createRef(),
    noteNotebooks: [],
    noteTags: [],
    onBack: vi.fn(),
    onCommitAndClose: vi.fn(async () => true),
    onCopy: vi.fn(),
    onDiscard: vi.fn(),
    onManageTags: vi.fn(),
    onOpenLibrary: vi.fn(),
    onRequestClose: vi.fn(),
    onRequestDelete: vi.fn(),
    onRetrySave: vi.fn(),
    onToggleArchive: vi.fn(),
    onTogglePin: vi.fn(),
    onToggleTag: vi.fn(),
    onUpdate: vi.fn(),
    presentation: 'capture',
    saveErrorCode: null,
    saveStatus: 'idle',
    ...overrides,
  };
}

/**
 * 1. Shared note composer
 */

describe('shared note composer experience', () => {
  it('preserves the textarea node, content, and selection across capture and library views', () => {
    const props = createEditorProps();
    const view = renderLocalized(<NoteEditor {...props} />);
    const captureTextarea = view.container.querySelector('.note-composer-textarea');

    captureTextarea.focus();
    captureTextarea.setSelectionRange(8, 15);

    view.rerender(
      <I18nProvider>
        <NoteEditor {...props} presentation="library" />
      </I18nProvider>,
    );

    const libraryTextarea = view.container.querySelector('.note-composer-textarea');
    expect(libraryTextarea).toBe(captureTextarea);
    expect(libraryTextarea).toHaveValue('Capture content stays intact.');
    expect(libraryTextarea.selectionStart).toBe(8);
    expect(libraryTextarea.selectionEnd).toBe(15);
  });

  it('keeps quick capture focused on the body and exposes only its primary controls', () => {
    const onOpenLibrary = vi.fn();
    const onRequestClose = vi.fn();
    const view = renderLocalized(
      <NoteEditor
        {...createEditorProps({ onOpenLibrary, onRequestClose })}
        presentation="capture"
      />,
    );

    const textarea = view.container.querySelector('.note-composer-textarea');
    const expandButton = view.container.querySelector('.note-capture-expand');
    const closeButton = view.container.querySelector('.note-composer-header-actions .notes-button');

    expect(textarea).toBeVisible();
    expect(view.container.querySelector('.note-composer-title-input')).toBeVisible();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(expandButton).toBeVisible();
    expect(closeButton).toBeVisible();

    fireEvent.click(expandButton);
    fireEvent.click(closeButton);
    expect(onOpenLibrary).toHaveBeenCalledOnce();
    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it('offers full save recovery in capture and omits discard from compact library status', () => {
    const onRetry = vi.fn();
    const onCopy = vi.fn();
    const onDiscard = vi.fn();
    const recoveryView = renderLocalized(
      <NoteSaveStatus
        saveStatus="error"
        saveErrorCode="storage_write_failed"
        onRetry={onRetry}
        onCopy={onCopy}
        onDiscard={onDiscard}
      />,
    );
    const recoveryActions = within(
      recoveryView.container.querySelector('.notes-recovery-actions'),
    ).getAllByRole('button');

    expect(recoveryActions).toHaveLength(3);
    recoveryActions.forEach((button) => fireEvent.click(button));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onCopy).toHaveBeenCalledOnce();
    expect(onDiscard).toHaveBeenCalledOnce();

    recoveryView.unmount();
    const libraryView = renderLocalized(
      <NoteEditor
        {...createEditorProps({
          onCopy,
          onDiscard,
          onRetrySave: onRetry,
          presentation: 'library',
          saveErrorCode: 'storage_write_failed',
          saveStatus: 'error',
        })}
      />,
    );
    const compactStatus = libraryView.container.querySelector('.note-save-status--compact');

    expect(within(compactStatus).getAllByRole('button')).toHaveLength(2);
    expect(compactStatus.querySelector('.notes-button--danger')).not.toBeInTheDocument();
  });

  it('shows pin, archive, copy, and delete as four direct editor actions', () => {
    const onTogglePin = vi.fn();
    const onToggleArchive = vi.fn();
    const onCopy = vi.fn();
    const onRequestDelete = vi.fn();
    renderLocalized(
      <NoteEditor
        {...createEditorProps({
          onCopy,
          onRequestDelete,
          onToggleArchive,
          onTogglePin,
          presentation: 'library',
        })}
      />,
    );
    const actions = screen.getByRole('group', { name: 'Note actions' });
    const buttons = within(actions).getAllByRole('button');

    expect(buttons).toHaveLength(4);
    expect(within(actions).getByRole('button', { name: 'Pin note' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(within(actions).queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();

    fireEvent.click(within(actions).getByRole('button', { name: 'Pin note' }));
    fireEvent.click(within(actions).getByRole('button', { name: 'Archive note' }));
    fireEvent.click(within(actions).getByRole('button', { name: 'Copy note text' }));
    fireEvent.click(within(actions).getByRole('button', { name: 'Delete note' }));
    expect(onTogglePin).toHaveBeenCalledOnce();
    expect(onToggleArchive).toHaveBeenCalledOnce();
    expect(onCopy).toHaveBeenCalledOnce();
    expect(onRequestDelete).toHaveBeenCalledOnce();
  });

  it('places the title above the note and keeps details always visible below it', () => {
    const view = renderLocalized(
      <NoteEditor
        {...createEditorProps({
          activeNote: createNote({
            content: '- Bullet item\n\n1. Numbered item\n\n- [ ] Task item',
          }),
          noteNotebooks: [{ id: 'work', name: 'Work' }],
          noteTags: [{ id: 'urgent', name: 'Urgent', colorToken: 'red' }],
          presentation: 'library',
        })}
      />,
    );
    const body = view.container.querySelector('.note-composer-body');
    const title = within(body).getByRole('textbox', { name: 'Note title' });
    const textarea = view.container.querySelector('.note-composer-textarea');
    const details = screen.getByRole('group', { name: 'Details' });
    const detailsRow = view.container.querySelector('.note-composer-details-row');
    const previewButton = within(details).getByRole('button', { name: 'Show preview' });

    expect(title).toBeVisible();
    expect(title.compareDocumentPosition(textarea) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      textarea.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(detailsRow).toBeVisible();
    expect(details.querySelector('summary')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Details' })).not.toBeInTheDocument();
    expect(within(details).queryByRole('textbox', { name: 'Note title' })).not.toBeInTheDocument();
    expect(details.querySelectorAll('.note-composer-details-group')).toHaveLength(2);
    expect(previewButton.textContent).toBe('');
    expect(previewButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(previewButton);
    const activePreviewButton = within(details).getByRole('button', {
      name: 'Return to editing',
    });
    const preview = view.container.querySelector('.note-composer-preview');
    expect(activePreviewButton.textContent).toBe('');
    expect(activePreviewButton).toHaveAttribute('aria-pressed', 'true');
    expect(preview.querySelector('ul:not(.contains-task-list)')).toBeInTheDocument();
    expect(preview.querySelector('ol')).toBeInTheDocument();
    expect(preview.querySelector('.contains-task-list')).toBeInTheDocument();
  });
});

/**
 * 2. Library presentation
 */

describe('notes library experience', () => {
  it('renders compact pinned and recent rows with only title, notebook, and time', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const notes = [
      createNote({
        id: 'pinned-note',
        content: '# Derived roadmap\nFirst detail line.\nSecond detail line.',
        tagIds: ['work', 'research'],
        notebookId: 'projects',
        isPinned: true,
        updatedAt: fiveMinutesAgo,
      }),
      createNote({
        id: 'recent-note',
        title: 'Explicit title',
        content: 'Recent note body.',
        updatedAt: tenMinutesAgo,
      }),
    ];
    const view = renderLocalized(
      <NoteListPane
        activeNoteId="pinned-note"
        emptyActionLabel="Create"
        emptyMessage="Empty"
        groups={groupNotesForLibrary(notes)}
        noteNotebooks={[{ id: 'projects', name: 'Projects' }]}
        onCreate={vi.fn()}
        onOpenNote={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Pinned' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recently updated' })).toBeInTheDocument();
    expect(screen.getByText('Derived roadmap')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('No notebook')).toBeInTheDocument();
    expect(screen.queryByText('First detail line. Second detail line.')).not.toBeInTheDocument();
    expect(screen.queryByText('Work +1')).not.toBeInTheDocument();
    expect(view.container.querySelector('.notes-list-item-excerpt')).not.toBeInTheDocument();
    expect(view.container.querySelector('.notes-list-item-actions')).not.toBeInTheDocument();
    expect(view.container.querySelectorAll('time')).toHaveLength(2);
    expect(view.container.querySelector('time')).not.toBeEmptyDOMElement();
  });

  it('limits filters, separates sorting, and keeps only management in more actions', () => {
    const onSelectScope = vi.fn();
    const onSelectNotebook = vi.fn();
    const onManageNotebooks = vi.fn();
    const onManageTags = vi.fn();
    const filterView = renderLocalized(
      <NoteFilterContent
        hasFilters={false}
        noteScope="all"
        noteNotebooks={[{ id: 'projects', name: 'Projects' }]}
        onClear={vi.fn()}
        onSelectNotebook={onSelectNotebook}
        onSelectScope={onSelectScope}
        selectedNotebookId={null}
      />,
    );

    expect(within(filterView.container).getAllByRole('button')).toHaveLength(3);
    expect(within(filterView.container).getByRole('combobox')).toBeInTheDocument();
    expect(within(filterView.container).queryByText('Date range')).not.toBeInTheDocument();
    expect(within(filterView.container).queryByText('Tags')).not.toBeInTheDocument();
    fireEvent.click(within(filterView.container).getByRole('button', { name: 'Pinned' }));
    expect(onSelectScope).toHaveBeenCalledWith('pinned');
    fireEvent.change(within(filterView.container).getByRole('combobox'), {
      target: { value: 'projects' },
    });
    expect(onSelectNotebook).toHaveBeenCalledWith('projects');

    filterView.unmount();
    const onChangeSort = vi.fn();
    const sortView = renderLocalized(
      <NoteSortContent onChangeSort={onChangeSort} sortBy="updated-desc" />,
    );
    expect(
      within(sortView.container).getByRole('button', { name: 'Recently updated' }),
    ).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(sortView.container).getByRole('button', { name: 'Recently created' }));
    expect(onChangeSort).toHaveBeenCalledWith('created-desc');

    sortView.unmount();
    const moreView = renderLocalized(
      <NoteMoreContent onManageNotebooks={onManageNotebooks} onManageTags={onManageTags} />,
    );
    expect(within(moreView.container).queryByText('Sort notes')).not.toBeInTheDocument();
    expect(within(moreView.container).queryByText('Recently created')).not.toBeInTheDocument();
    fireEvent.click(within(moreView.container).getByRole('button', { name: 'Manage notebooks' }));
    fireEvent.click(within(moreView.container).getByRole('button', { name: 'Manage tags' }));
    expect(onManageNotebooks).toHaveBeenCalledOnce();
    expect(onManageTags).toHaveBeenCalledOnce();
  });

  it('renders separate new, more, and close controls without list filters or search', () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();
    const view = renderLocalized(
      <NoteLibraryHeader
        onCreate={onCreate}
        onClose={onClose}
        moreContent={<button type="button">More option</button>}
      />,
    );
    const menuTriggers = view.container.querySelectorAll('.notes-library-actions summary');
    const directActions = view.container.querySelectorAll('.notes-library-actions > button');

    expect(menuTriggers).toHaveLength(1);
    expect(directActions).toHaveLength(2);
    expect(screen.queryByRole('searchbox', { name: 'Search notes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Note filter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sort notes' })).not.toBeInTheDocument();

    fireEvent.click(menuTriggers[0]);
    expect(screen.getByRole('button', { name: 'More option' })).toBeVisible();
    expect(menuTriggers[0].closest('details')).toHaveAttribute('open');
    fireEvent.pointerDown(directActions[0]);
    expect(menuTriggers[0].closest('details')).not.toHaveAttribute('open');

    fireEvent.click(directActions[0]);
    fireEvent.click(directActions[1]);
    expect(onCreate).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps search immediately below the filter and sort controls', () => {
    const onSearchChange = vi.fn();
    const view = renderLocalized(
      <NoteListToolbar
        filterContent={<button type="button">Filter option</button>}
        hasFilters
        onSearchChange={onSearchChange}
        searchQuery=""
        sortContent={<button type="button">Sort option</button>}
      />,
    );
    const toolbar = screen.getByRole('group', { name: 'Note list' });
    const searchInput = screen.getByRole('searchbox', { name: 'Search notes' });
    const filterButton = within(toolbar).getByRole('button', { name: 'Note filter' });
    const sortButton = within(toolbar).getByRole('button', { name: 'Sort notes' });
    const filterMenu = filterButton.closest('details');
    const sortMenu = sortButton.closest('details');

    expect(view.container.querySelectorAll('.notes-list-toolbar summary')).toHaveLength(2);
    expect(filterMenu).toHaveAttribute('data-active', 'true');
    expect(toolbar.compareDocumentPosition(searchInput) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    fireEvent.change(searchInput, { target: { value: 'roadmap' } });
    expect(onSearchChange).toHaveBeenCalledWith('roadmap');

    fireEvent.click(filterButton);
    expect(filterMenu).toHaveAttribute('open');
    fireEvent.pointerDown(searchInput);
    expect(filterMenu).not.toHaveAttribute('open');

    fireEvent.click(sortButton);
    expect(sortMenu).toHaveAttribute('open');
    within(sortMenu).getByRole('button', { name: 'Sort option' }).focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(sortMenu).not.toHaveAttribute('open');
    expect(sortButton).toHaveFocus();
  });
});
