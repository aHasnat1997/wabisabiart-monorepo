/* eslint-disable */
import axios from 'axios';
import queryString from 'query-string';
const { stringify } = queryString;
import type { DataProvider } from '@refinedev/core';

// @ts-ignore
const axiosInstance = axios.create({ withCredentials: true });

// @ts-ignore
axiosInstance.interceptors.response.use(
  // @ts-ignore
  (response) => {
    return response.data;
  },
  // @ts-ignore
  (error) => {
    // @ts-ignore
    const axiosError = error;
    const errorObj = {
      message: axiosError.response?.data?.message || error.message,
      statusCode: axiosError.response?.status,
    };

    // @ts-ignore
    const response = axiosError.response;

    if (response?.status === 409) {
      // @ts-ignore
      return Promise.reject({
        ...errorObj,
        // @ts-ignore
        message: response?.data?.message || 'Conflict',
      });
    }

    // @ts-ignore
    return Promise.reject(errorObj);
  },
);

export const customDataProvider = (apiUrl: string): DataProvider => ({
  getApiUrl: () => apiUrl,

  getList: async (params: any) => {
    let { resource, pagination, filters, sorters } = params;
    let url = `${apiUrl}/${resource}`;

    // Route admin orders requests to /orders/admin endpoint
    if (resource === 'orders') {
      url = `${apiUrl}/orders/admin`;
    }

    const { current = 1, pageSize = 10 } = pagination || {};

    const query: Record<string, string | number> = {
      _start: (current - 1) * pageSize,
      _end: current * pageSize,
    };

    if (sorters && sorters.length > 0) {
      query._sort = sorters[0].field;
      query._order = sorters[0].order?.toUpperCase() || 'ASC';
    }

    // Add filters in filter[fieldName]=value format for QueryBuilder compatibility
    if (filters && filters.length > 0) {
      filters.forEach((filter: any) => {
        if ('field' in filter && 'value' in filter && filter.value) {
          query[`filter[${filter.field}]`] = filter.value;
        }
      });
    }

    // @ts-ignore
    const { data } = await axiosInstance.get(`${url}?${stringify(query)}`);

    // Handle wrapped response format from NestJS API
    const responseData = data.data ? data.data : data;

    return {
      data: responseData.data || responseData,
      total: responseData.total || 0,
    };
  },

  getOne: async (params: any) => {
    let { resource, id } = params;
    let url = `${apiUrl}/${resource}/${id}`;

    // Route admin orders requests to /orders/admin endpoint
    if (resource === 'orders') {
      url = `${apiUrl}/orders/admin/${id}`;
    }

    // @ts-ignore
    const { data } = await axiosInstance.get(url);

    // Handle wrapped response format
    return {
      data: data.data || data,
    };
  },

  update: async (params: any) => {
    const { resource, id, values } = params;
    const url = `${apiUrl}/${resource}/${id}`;

    // @ts-ignore
    const { data } = await axiosInstance.patch(url, values);

    return {
      data: data.data || data,
    };
  },

  create: async (params: any) => {
    const { resource, values } = params;
    const url = `${apiUrl}/${resource}`;

    // @ts-ignore
    const { data } = await axiosInstance.post(url, values);

    return {
      data: data.data || data,
    };
  },

  deleteOne: async (params: any) => {
    const { resource, id } = params;
    const url = `${apiUrl}/${resource}/${id}`;

    // @ts-ignore
    const { data } = await axiosInstance.delete(url);

    return {
      data: data.data || data,
    };
  },

  getMany: async (params: any) => {
    const { resource, ids } = params;
    // @ts-ignore
    const { data } = await axiosInstance.get(
      `${apiUrl}/${resource}?${stringify({ id: ids })}`,
    );

    return {
      data: data.data || data,
    };
  },

  deleteMany: async (params: any) => {
    const { resource, ids } = params;
    // @ts-ignore
    const { data } = await axiosInstance.delete(
      `${apiUrl}/${resource}?${stringify({ id: ids })}`,
    );

    return {
      data: data.data || data,
    };
  },

  updateMany: async (params: any) => {
    const { resource, ids, values } = params;
    // @ts-ignore
    const response = await Promise.all(
      ids.map((id: string) =>
        // @ts-ignore
        axiosInstance.patch(`${apiUrl}/${resource}/${id}`, values),
      ),
    );

    return {
      data: response.map((res: any) => res.data.data || res.data),
    };
  },

  custom: async (config: any) => {
    const { url, method, filters, sorters, payload, query, headers } = config;

    // Build query parameters using proper query builder
    const params: Record<string, any> = {};

    if (sorters && sorters.length > 0) {
      const { field, order } = sorters[0];
      params._sort = field;
      params._order = order;
    }

    if (filters) {
      filters.forEach((filter: any) => {
        if ('field' in filter && 'value' in filter) {
          params[filter.field] = filter.value;
        }
      });
    }

    if (query) {
      Object.assign(params, query);
    }

    // Build URL with query parameters only if params exist
    const requestUrl =
      Object.keys(params).length > 0 ? `${url}?${stringify(params)}` : url;

    let axiosResponse;
    const requestConfig = headers ? { headers } : {};
    switch (method) {
      case 'put':
        // @ts-ignore
        axiosResponse = await axiosInstance.put(
          requestUrl,
          payload,
          requestConfig,
        );
        break;
      case 'post':
        // @ts-ignore
        axiosResponse = await axiosInstance.post(
          requestUrl,
          payload,
          requestConfig,
        );
        break;
      case 'patch':
        // @ts-ignore
        axiosResponse = await axiosInstance.patch(
          requestUrl,
          payload,
          requestConfig,
        );
        break;
      case 'delete':
        // @ts-ignore
        axiosResponse = await axiosInstance.delete(requestUrl, requestConfig);
        break;
      default:
        // @ts-ignore
        axiosResponse = await axiosInstance.get(requestUrl);
    }

    return axiosResponse;
  },
});
