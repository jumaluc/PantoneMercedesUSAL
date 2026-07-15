export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Proxy de miniaturas: redimensiona al vuelo imágenes de GCS, sin guardar nada nuevo en el bucket.
export function thumbUrl(originalUrl, width = 400) {
  if (!originalUrl) return originalUrl;
  return `${API_URL}/api/thumb?url=${encodeURIComponent(originalUrl)}&w=${width}`;
}
