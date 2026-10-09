import { api } from './axios.js';

export type TLegalPageType = 'TERMS_OF_USE' | 'PRIVACY_POLICY' | 'COOKIE_POLICY';

export type TLegalPage = {
  id: string;
  type: TLegalPageType;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type TFaqQuestion = {
  id: string;
  question: string;
  answer: string;
  order: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type TFaqCategory = {
  id: string;
  name: string;
  order: number;
  questions: TFaqQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type TFaqCategoryPayload = {
  name: string;
  order: number;
};

export type TFaqQuestionPayload = {
  question: string;
  answer: string;
  order: number;
  categoryId: string;
};

export const LegalsApi = {
  getAll: () => api.get<{ data: TLegalPage[] }>('/legals'),
  getByType: (type: TLegalPageType) =>
    api.get<{ data: TLegalPage }>(`/legals/${type}`),
  upsert: (payload: { type: TLegalPageType; content: string }) =>
    api.post<{ data: TLegalPage }>('/legals', payload),
};

export const FaqApi = {
  getAll: () => api.get<{ data: TFaqCategory[] | null }>('/faq'),
  createCategory: (payload: TFaqCategoryPayload) =>
    api.post<{ data: TFaqCategory }>('/faq/categories', payload),
  updateCategory: (id: string, payload: Partial<TFaqCategoryPayload>) =>
    api.patch<{ data: TFaqCategory }>(`/faq/categories/${id}`, payload),
  deleteCategory: (id: string) => api.delete(`/faq/categories/${id}`),
  createQuestion: (payload: TFaqQuestionPayload) =>
    api.post<{ data: TFaqQuestion }>('/faq/questions', payload),
  updateQuestion: (id: string, payload: Partial<TFaqQuestionPayload>) =>
    api.patch<{ data: TFaqQuestion }>(`/faq/questions/${id}`, payload),
  deleteQuestion: (id: string) => api.delete(`/faq/questions/${id}`),
};
