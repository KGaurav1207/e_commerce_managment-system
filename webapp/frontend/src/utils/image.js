import { API_BASE } from './api';

const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;

const getApiOrigin = () => {
  if (!ABSOLUTE_URL_PATTERN.test(API_BASE)) return '';

  try {
    return new URL(API_BASE).origin;
  } catch {
    return '';
  }
};

const getImagesBase = () => {
  const normalizedApiBase = (API_BASE || '/api').replace(/\/+$/, '');

  if (ABSOLUTE_URL_PATTERN.test(normalizedApiBase)) {
    try {
      const parsed = new URL(normalizedApiBase);
      const apiPath = parsed.pathname.replace(/\/+$/, '');
      const imagePath = apiPath.endsWith('/api') ? `${apiPath}/images` : '/api/images';
      return `${parsed.origin}${imagePath}`;
    } catch {
      return '/api/images';
    }
  }

  if (!normalizedApiBase) return '/api/images';
  return normalizedApiBase.endsWith('/api') ? `${normalizedApiBase}/images` : `${normalizedApiBase}/images`;
};

const IMAGE_BASE = getImagesBase();
const API_ORIGIN = getApiOrigin();

const encodeFilePath = (filePath) =>
  filePath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const parseSize = (size = '300x300') => {
  const [w, h] = String(size).split('x').map((v) => Number(v) || 300);
  return { width: w, height: h };
};

const getPlaceholderUrl = (size = '300x300', label = 'Product') => {
  const { width, height } = parseSize(size);
  const safeLabel = (label || 'Product').slice(0, 16);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff8a3d"/>
          <stop offset="100%" stop-color="#ff6b00"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="${Math.max(14, Math.floor(width / 9))}" font-family="Arial, sans-serif">${safeLabel}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getFallbackLabel = (name, fallbackLabel) =>
  name ? String(name).substring(0, 10) : fallbackLabel;

export const resolveImageUrl = ({ imageUrl, name, size = '300x300', fallbackLabel = 'Product' }) => {
  const rawValue = (imageUrl || '').trim();

  if (!rawValue) {
    const label = getFallbackLabel(name, fallbackLabel);
    return getPlaceholderUrl(size, label || fallbackLabel);
  }

  if (/^(data:|blob:)/i.test(rawValue) || ABSOLUTE_URL_PATTERN.test(rawValue)) {
    return rawValue;
  }

  if (rawValue.startsWith('/api/images/')) {
    return API_ORIGIN ? `${API_ORIGIN}${rawValue}` : rawValue;
  }

  if (rawValue.startsWith('api/images/')) {
    const value = `/${rawValue}`;
    return API_ORIGIN ? `${API_ORIGIN}${value}` : value;
  }

  if (rawValue.startsWith('/images/')) {
    const value = `/api${rawValue}`;
    return API_ORIGIN ? `${API_ORIGIN}${value}` : value;
  }

  if (rawValue.startsWith('images/')) {
    const value = `/api/${rawValue}`;
    return API_ORIGIN ? `${API_ORIGIN}${value}` : value;
  }

  if (rawValue.startsWith('/')) {
    return API_ORIGIN ? `${API_ORIGIN}${rawValue}` : rawValue;
  }

  return `${IMAGE_BASE}/${encodeFilePath(rawValue)}`;
};

export const handleImageError = (event, { name, size = '300x300', fallbackLabel = 'Product' } = {}) => {
  const fallbackSrc = getPlaceholderUrl(size, getFallbackLabel(name, fallbackLabel));
  if (event?.currentTarget && event.currentTarget.src !== fallbackSrc) {
    event.currentTarget.src = fallbackSrc;
  }
};
