import { api } from './axios.js';

export interface RestoreBackupResponse {
  message: string;
  restored?: Record<string, number>;
}

interface ApiSuccessResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

type RestoreBackupApiResponse =
  | RestoreBackupResponse
  | ApiSuccessResponse<RestoreBackupResponse>;

const getFilenameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return null;

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || null;
};

export const backupApi = {
  download: async () => {
    const response = await api.get<Blob>('/backup', {
      responseType: 'blob',
    });

    return {
      blob: response.data,
      filename:
        getFilenameFromDisposition(response.headers['content-disposition']) ||
        `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`,
    };
  },

  restore: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<RestoreBackupApiResponse>(
      '/backup/restore',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return 'data' in response.data ? response.data.data : response.data;
  },
};
