import { api } from './axios.js';

export type TBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  background: string;
  isActive: boolean;
  sortOrder: number;
};

export type TBrandSettings = {
  id: string;
  name: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

export type TFooterSettings = {
  id: string;
  text: string;
};

export const CmsApi = {
  getBanner: () => api.get<{ data: TBanner | null }>('/cms/banner'),
  upsertBanner: (payload: Omit<TBanner, 'id' | 'isActive' | 'sortOrder'>) =>
    api.post<{ data: TBanner }>('/cms/banner', payload),

  getBrandSettings: () => api.get<{ data: TBrandSettings | null }>('/cms/brand'),
  upsertBrandSettings: (payload: { name: string; logoUrl?: string | null; faviconUrl?: string | null }) =>
    api.post<{ data: TBrandSettings }>('/cms/brand', payload),

  getFooterSettings: () => api.get<{ data: TFooterSettings | null }>('/cms/footer'),
  upsertFooterSettings: (payload: { text: string }) =>
    api.post<{ data: TFooterSettings }>('/cms/footer', payload),
};
