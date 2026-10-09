import { api } from './axios.js';

export interface Category {
  id: string;
  name: string;
  type: 'crafts' | 'customization' | 'commissions';
  isFeatured: boolean;
  isGoodForGift: boolean;
  description?: string;
  createdAt: string;
  totalSubCategories?: number;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
}

export const categoryApi = {
  getAll: () => api.get<{ data: Category[] }>('/category'),
  getOne: (id: string) => api.get<{ data: Category }>(`/category/${id}`),
  create: (data: { name: string; type: string; description?: string }) =>
    api.post('/category', data),
  delete: (id: string) => api.delete(`/category/${id}`),
  createSubCategory: (data: {
    categoryId: string;
    name: string;
    description?: string;
  }) => api.post('/category/subcategory', data),
  deleteSubCategory: (id: string) => api.delete(`/category/subcategory/${id}`),
  toggleFeatured: (id: string) => api.post(`/category/featured/${id}`),
  toggleGoodForGift: (id: string) => api.post(`/category/good-for-gift/${id}`),
};
