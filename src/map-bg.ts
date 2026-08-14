const CACHE_PREFIX = 'clm_map_bg_';
const SAMPLE_MAX_SIZE = 160;
const BORDER_WIDTH = 2;
const QUANTIZE_STEP = 8;
const ALPHA_THRESHOLD = 16;
const RGB_PATTERN = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;

export const THEME_BACKGROUND = 'var(--card-background-color)';

export type EdgeColorResult = { type: 'color'; value: string } | { type: 'transparent' } | { type: 'unknown' };

export const buildImageUrl = (entityId: string, entityPicture?: string): string => {
  if (entityPicture) {
    return entityPicture;
  }
  const domain = entityId.split('.')[0];
  return domain === 'camera' ? `/api/camera_proxy/${entityId}` : `/api/image_proxy/${entityId}`;
};

export const readCachedMapBackground = (entityId: string): string | null => {
  try {
    const stored = localStorage.getItem(`${CACHE_PREFIX}${entityId}`);
    return stored && RGB_PATTERN.test(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const cacheMapBackground = (entityId: string, color: string): void => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${entityId}`, color);
  } catch {}
};

const findOpaqueBounds = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): { left: number; top: number; right: number; bottom: number } | null => {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < ALPHA_THRESHOLD) {
        continue;
      }
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  return right < left || bottom < top ? null : { left, top, right, bottom };
};

export const detectEdgeColor = (img: HTMLImageElement): EdgeColorResult => {
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  if (!naturalWidth || !naturalHeight) {
    return { type: 'unknown' };
  }

  const scale = Math.min(1, SAMPLE_MAX_SIZE / Math.max(naturalWidth, naturalHeight));
  const minSize = BORDER_WIDTH * 2 + 1;
  const width = Math.max(minSize, Math.round(naturalWidth * scale));
  const height = Math.max(minSize, Math.round(naturalHeight * scale));

  let data: Uint8ClampedArray;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return { type: 'unknown' };
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, width, height);
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return { type: 'unknown' };
  }

  const bounds = findOpaqueBounds(data, width, height);

  if (!bounds) {
    return { type: 'transparent' };
  }

  const { left, top, right, bottom } = bounds;
  const innerWidth = right - left + 1;
  const innerHeight = bottom - top + 1;
  const borderX = Math.min(BORDER_WIDTH, Math.ceil(innerWidth / 2));
  const borderY = Math.min(BORDER_WIDTH, Math.ceil(innerHeight / 2));

  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
  let opaque = 0;
  let transparent = 0;

  for (let y = top; y <= bottom; y++) {
    const onHorizontalBorder = y < top + borderY || y > bottom - borderY;

    for (let x = left; x <= right; x++) {
      if (!onHorizontalBorder && x >= left + borderX && x <= right - borderX) {
        continue;
      }

      const index = (y * width + x) * 4;

      if (data[index + 3] < ALPHA_THRESHOLD) {
        transparent++;
        continue;
      }

      opaque++;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const key = ((r / QUANTIZE_STEP) | 0) * 65536 + ((g / QUANTIZE_STEP) | 0) * 256 + ((b / QUANTIZE_STEP) | 0);
      const bucket = buckets.get(key);

      if (bucket) {
        bucket.count++;
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
      } else {
        buckets.set(key, { count: 1, r, g, b });
      }
    }
  }

  if (transparent > opaque) {
    return { type: 'transparent' };
  }

  if (!opaque) {
    return { type: 'unknown' };
  }

  let best: { count: number; r: number; g: number; b: number } | undefined;

  for (const bucket of buckets.values()) {
    if (!best || bucket.count > best.count) {
      best = bucket;
    }
  }

  if (!best) {
    return { type: 'unknown' };
  }

  const r = Math.round(best.r / best.count);
  const g = Math.round(best.g / best.count);
  const b = Math.round(best.b / best.count);

  return { type: 'color', value: `rgb(${r}, ${g}, ${b})` };
};

export const detectEdgeColorFromUrl = (url: string): Promise<EdgeColorResult> =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(detectEdgeColor(img));
    img.onerror = () => resolve({ type: 'unknown' });
    img.src = url;
  });
