import { describe, expect, it } from 'vitest';
import { BackgroundImageError, MAX_FILE_SIZE, prepareBackgroundImage } from './backgroundImage.js';

describe('background image validation', () => {
  it('rejects unsupported image types before reading the file', async () => {
    await expect(
      prepareBackgroundImage({ type: 'image/svg+xml', size: 100 }),
    ).rejects.toMatchObject(new BackgroundImageError('unsupported_type'));
  });

  it('rejects images above the storage budget before decoding', async () => {
    await expect(
      prepareBackgroundImage({ type: 'image/webp', size: MAX_FILE_SIZE + 1 }),
    ).rejects.toMatchObject(new BackgroundImageError('file_too_large'));
  });
});
