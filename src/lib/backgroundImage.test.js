import { afterEach, describe, expect, it, vi } from 'vitest';
import { BackgroundImageError, MAX_FILE_SIZE, prepareBackgroundImage } from './backgroundImage.js';

function installFileReader({ error = false } = {}) {
  class MockFileReader {
    readAsDataURL() {
      if (error) {
        this.onerror();
        return;
      }

      this.result = 'data:image/png;base64,AAAA';
      this.onload();
    }
  }

  vi.stubGlobal('FileReader', MockFileReader);
}

function installImage({ error = false, width = 5000, height = 2500 } = {}) {
  class MockImage {
    constructor() {
      this.naturalWidth = width;
      this.naturalHeight = height;
    }

    set src(_value) {
      if (error) this.onerror();
      else this.onload();
    }
  }

  vi.stubGlobal('Image', MockImage);
}

function installCanvas({ context = true, output = 'data:image/webp;base64,BBBB' } = {}) {
  const drawImage = vi.fn();
  const canvas = {
    height: 0,
    width: 0,
    getContext: vi.fn(() => (context ? { drawImage } : null)),
    toDataURL: vi.fn(() => output),
  };
  const createElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tagName, options) =>
    tagName === 'canvas' ? canvas : createElement(tagName, options),
  );
  return { canvas, drawImage };
}

describe('background image validation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

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

  it('reads, scales, and converts a supported image to WebP', async () => {
    installFileReader();
    installImage();
    const { canvas, drawImage } = installCanvas();

    await expect(prepareBackgroundImage({ type: 'image/png', size: 1024 })).resolves.toBe(
      'data:image/webp;base64,BBBB',
    );
    expect(canvas.width).toBe(2560);
    expect(canvas.height).toBe(1280);
    expect(drawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, 2560, 1280);
  });

  it('reports file read and image decode failures', async () => {
    installFileReader({ error: true });
    await expect(prepareBackgroundImage({ type: 'image/png', size: 1024 })).rejects.toMatchObject(
      new BackgroundImageError('read_failed'),
    );

    vi.unstubAllGlobals();
    installFileReader();
    installImage({ error: true });
    await expect(prepareBackgroundImage({ type: 'image/png', size: 1024 })).rejects.toMatchObject(
      new BackgroundImageError('decode_failed'),
    );
  });

  it('reports unavailable canvas processing', async () => {
    installFileReader();
    installImage({ width: 800, height: 600 });
    installCanvas({ context: false });

    await expect(prepareBackgroundImage({ type: 'image/jpeg', size: 1024 })).rejects.toMatchObject(
      new BackgroundImageError('processing_failed'),
    );
  });

  it('rejects an invalid canvas output', async () => {
    installFileReader();
    installImage({ width: 800, height: 600 });
    installCanvas({ output: 'data:image/png;base64,AAAA' });

    await expect(prepareBackgroundImage({ type: 'image/avif', size: 1024 })).rejects.toMatchObject(
      new BackgroundImageError('processing_failed'),
    );
  });
});
