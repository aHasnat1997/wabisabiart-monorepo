import type { AuthProvider } from '@refinedev/core';
import axios, { isAxiosError, type AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

interface ErrorResponse {
  message?: string;
}

export const authProvider: AuthProvider = {
  login: async ({
    email,
    password,
    remember,
  }: {
    email: string;
    password: string;
    remember?: boolean;
  }) => {
    try {
      const response: AxiosResponse<ApiResponse> = await axiosInstance.post(
        '/auth/login',
        {
          email,
          password,
          stayLoggedIn: remember ?? false,
        },
      );

      if (response.data.success) {
        return {
          success: true,
          redirectTo: '/',
          successNotification: {
            message: response.data.message,
            description: 'Welcome back!',
          },
        };
      }

      return {
        success: false,
        error: {
          name: 'LoginError',
          message: response.data.message || 'Login failed',
        },
      };
    } catch (error) {
      const errorMessage = isAxiosError<ErrorResponse>(error)
        ? error.response?.data?.message || 'Login failed'
        : 'Login failed';
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: errorMessage,
        },
      };
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      return {
        success: true,
        redirectTo: '/login',
      };
    } catch {
      return {
        success: true,
        redirectTo: '/login',
      };
    }
  },

  check: async () => {
    try {
      await axiosInstance.get('/user/profile');
      return {
        authenticated: true,
      };
    } catch {
      return {
        authenticated: false,
        redirectTo: '/login',
      };
    }
  },

  onError: async (error) => {
    if (error?.response?.status === 401) {
      return Promise.resolve({
        logout: true,
      });
    }
    return Promise.resolve({});
  },

  getIdentity: async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>('/user/profile');
      return response.data.data;
    } catch {
      return null;
    }
  },

  getPermissions: async () => Promise.resolve(null),
};
