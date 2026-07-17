import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContextMenu from './ContextMenu.jsx';
import I18nProvider from './I18nProvider.jsx';

describe('ContextMenu', () => {
  it('uses native controls for keyboard reorder and folder movement', async () => {
    const onMoveToFolder = vi.fn();
    const onClose = vi.fn();
    render(
      <I18nProvider>
        <ContextMenu
          x={10}
          y={10}
          can_move_left={false}
          can_move_right
          move_folders={[{ id: 'folder-1', name: 'Work' }]}
          on_edit={vi.fn()}
          on_delete={vi.fn()}
          on_move_left={vi.fn()}
          on_move_right={vi.fn()}
          on_move_to_folder={onMoveToFolder}
          on_close={onClose}
        />
      </I18nProvider>,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move left' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Move to folder' }));
    expect(onMoveToFolder).toHaveBeenCalledWith('folder-1');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes with Escape', () => {
    const onClose = vi.fn();
    render(
      <I18nProvider>
        <ContextMenu
          x={10}
          y={10}
          can_move_left={false}
          can_move_right={false}
          on_edit={vi.fn()}
          on_delete={vi.fn()}
          on_close={onClose}
        />
      </I18nProvider>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
