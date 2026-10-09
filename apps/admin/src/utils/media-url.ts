export const resolveMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;

  const mediaBase = (
    (import.meta.env.VITE_MEDIA_URL as string | undefined) || ''
  )
    .trim()
    .replace(/\/+$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  if (!mediaBase) {
    return normalizedPath;
  }

  return `${mediaBase}${normalizedPath}`;
};
