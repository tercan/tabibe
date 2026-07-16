const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_WIDTH = 2560;
const MAX_HEIGHT = 1440;
const OUTPUT_QUALITY = 0.86;
const SUPPORTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif']);

class BackgroundImageError extends Error {
  constructor(code) {
    super(code);
    this.name = 'BackgroundImageError';
    this.code = code;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new BackgroundImageError('read_failed'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new BackgroundImageError('decode_failed'));
    image.src = dataUrl;
  });
}

function getTargetSize(width, height) {
  const scale = Math.min(1, MAX_WIDTH / width, MAX_HEIGHT / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function prepareBackgroundImage(file) {
  if (!file || !SUPPORTED_TYPES.has(file.type)) {
    throw new BackgroundImageError('unsupported_type');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new BackgroundImageError('file_too_large');
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const target = getTargetSize(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;
  const context = canvas.getContext('2d');
  if (!context) throw new BackgroundImageError('processing_failed');

  context.drawImage(image, 0, 0, target.width, target.height);
  const optimizedDataUrl = canvas.toDataURL('image/webp', OUTPUT_QUALITY);
  if (!optimizedDataUrl.startsWith('data:image/webp;base64,')) {
    throw new BackgroundImageError('processing_failed');
  }

  return optimizedDataUrl;
}

export { BackgroundImageError, MAX_FILE_SIZE, prepareBackgroundImage };
