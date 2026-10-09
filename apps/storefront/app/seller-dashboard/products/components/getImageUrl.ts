

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";

export const getImageUrl = (url: string): string => {
  if (!url) return "/placeholders/product-placeholder.png";

  // Blob or already full URL — return as-is
  if (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http")) {
    return url;
  }

  // Raw key from server (e.g. "1774914...png" or "images/1774914...png")
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;

  return `${MEDIA_URL}/${cleanPath}`;
};