/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';

// Helper function to parse filter values and preserve types
function parseFilterValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  // For non-primitive objects/arrays, return directly without stringification to avoid double-serialization
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  // Safe string conversion for primitive types: string, number, boolean, symbol, bigint
  const str = String(value as string | number | boolean | symbol | bigint);

  // Try to parse as boolean
  if (str === 'true') return true;
  if (str === 'false') return false;

  // Try to parse as number
  const num = Number(str);
  if (!Number.isNaN(num) && str !== '') return num;

  // Try to parse as JSON (for objects/arrays)
  if (str.startsWith('{') || str.startsWith('[')) {
    try {
      return JSON.parse(str);
    } catch {
      // Fall back to string
    }
  }

  // Return as string
  return str;
}

export interface IncludeOptions {
  select?: Record<string, any>;
  include?: Record<string, any>;
  where?: Record<string, any>;
  orderBy?: Record<string, any>;
  take?: number;
  skip?: number;
}

// Extract relation fields from a model
export type RelationFields<T> = {
  [K in keyof T]: T[K] extends object | null | undefined ? K : never;
}[keyof T];

export interface QueryBuilderOptions<TModel extends Record<string, any> = any> {
  searchFields?: (keyof TModel)[];
  enumFields?: (keyof TModel)[];
  booleanFields?: (keyof TModel)[];
  defaultSort?: { field: keyof TModel; order: 'asc' | 'desc' };
  defaultLimit?: number;
  maxLimit?: number;
  select?: Partial<Record<keyof TModel, boolean>>;
  include?: Partial<Record<RelationFields<TModel>, boolean | IncludeOptions>> &
    Record<string, boolean | IncludeOptions>;
  additionalFilters?: Partial<Record<keyof TModel, unknown>>;
}

export interface QueryParams extends Record<string, unknown> {
  q?: string;
  sort?: string;
  page?: string | number;
  limit?: string | number;
  include?: string;
}

export interface PaginatedResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: T[];
}

export interface ParsedQuery {
  where: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  skip?: number;
  take?: number;
  select?: Record<string, any>;
  include?: Record<string, boolean | IncludeOptions>;
}

export const QueryBuilder = createParamDecorator(
  <TModel extends Record<string, any> = any>(
    options: QueryBuilderOptions<TModel> = {},
    ctx: ExecutionContext,
  ) => {
    try {
      const request = ctx.switchToHttp().getRequest<Request>();
      const query = request.query as Record<string, any>;

      const where: Record<string, any> = {};

      // List of reserved query parameters to skip
      const reservedParams = [
        'q',
        'sort',
        'order',
        'page',
        'limit',
        'include',
        'fields',
        '_start',
        '_end',
        '_sort',
        '_order',
        'view',
      ];

      // Handle all query parameters
      for (const [key, value] of Object.entries(query)) {
        // Skip reserved parameters
        if (reservedParams.includes(key)) continue;

        // Match filter[fieldName] or filter[nested.field] pattern
        const filterMatch = key.match(/^filter\[(.+)\]$/);

        if (filterMatch) {
          const fieldPath = String(filterMatch[1]);
          const parts = fieldPath.split('.');

          // Build nested where clause for dotted notation (e.g., user.id)
          if (parts.length > 1) {
            let currentWhere: Record<string, any> = where;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!currentWhere[parts[i]]) {
                currentWhere[parts[i]] = {};
              }
              currentWhere = currentWhere[parts[i]];
            }
            currentWhere[parts[parts.length - 1]] = parseFilterValue(value);
          } else {
            const fieldName = parts[0];
            // Handle enum fields
            if (options.enumFields?.includes(fieldName as keyof TModel)) {
              where[fieldName] = String(value);
            }
            // Handle boolean fields
            else if (
              options.booleanFields?.includes(fieldName as keyof TModel)
            ) {
              where[fieldName] = value === 'true' || value === true;
            }
            // Handle regular fields
            else {
              where[fieldName] = {
                contains: String(value),
                mode: 'insensitive',
              };
            }
          }
        }
        // Direct field query: fieldName=value
        else {
          // Handle enum fields
          const field = String(key);
          if (options.enumFields?.includes(field as keyof TModel)) {
            where[field] = String(value);
          }
          // Handle boolean fields
          else if (options.booleanFields?.includes(field as keyof TModel)) {
            where[field] = value === 'true' || value === true;
          }
          // Handle regular string fields with contains
          else {
            where[field] = {
              contains: String(value),
              mode: 'insensitive',
            };
          }
        }
      }

      // Parse search term
      if (query.q && typeof query.q === 'string') {
        const searchTerm = String(query.q);
        if (options.searchFields && options.searchFields.length > 0) {
          where.OR = options.searchFields.map((field) => ({
            [String(field)]: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          }));
        }
      }

      // Parse sorting - support both _sort/_order and sort formats
      const orderBy: Record<string, unknown> = {};
      const sortField = query._sort || query.sort;
      const sortOrder = query._order || query.order;

      if (sortField && typeof sortField === 'string') {
        const order = (sortOrder?.toString() || 'ASC').toLowerCase();
        orderBy[sortField] = order === 'desc' ? 'desc' : 'asc';
      } else if (options.defaultSort) {
        orderBy[String(options.defaultSort.field)] = options.defaultSort.order;
      }

      // Parse pagination - support both _start/_end (Refine) and page/limit formats
      let skip = 0;
      let take = options.defaultLimit || 10;

      if (query._start !== undefined && query._end !== undefined) {
        // Refine format: _start (offset) and _end (offset + limit)
        const start = Math.max(0, parseInt(String(query._start), 10) || 0);
        const end = Math.max(0, parseInt(String(query._end), 10) || 0);

        // Validate that end >= start
        if (end < start) {
          throw new BadRequestException(
            'Invalid pagination: end must be greater than or equal to start',
          );
        }

        skip = start;
        take = Math.max(1, end - start);
      } else {
        // Traditional format: page and limit
        const pageNum = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
        const limitNum = Math.min(
          parseInt(String(query.limit || options.defaultLimit || 10), 10) || 10,
          options.maxLimit || 100,
        );

        if (pageNum < 1 || limitNum < 1) {
          throw new BadRequestException(
            'Page and limit must be positive numbers',
          );
        }

        skip = (pageNum - 1) * limitNum;
        take = limitNum;
      }

      // Ensure take doesn't exceed maxLimit
      if (options.maxLimit && take > options.maxLimit) {
        take = options.maxLimit;
      }

      // Add additional filters
      if (options.additionalFilters) {
        Object.assign(where, options.additionalFilters);
      }

      // Convert options.select to string-keyed record
      const fromOptionsSelect: Record<string, any> | undefined = options.select
        ? Object.fromEntries(
            Object.entries(options.select).map(([k, v]) => [String(k), v]),
          )
        : undefined;

      // Build select from fields query param (supports nested relations like seller.fullName)
      const buildSelectFromFields = (fieldsStr: string) => {
        const out: Record<string, any> = {};
        const setNested = (obj: Record<string, any>, parts: string[]) => {
          const key = parts[0];
          if (parts.length === 1) {
            obj[key] = true;
            return;
          }
          // ensure obj[key] is an object (not boolean)
          if (!obj[key] || typeof obj[key] !== 'object') obj[key] = {};
          if (!obj[key].select) obj[key].select = {};
          setNested(obj[key].select as Record<string, any>, parts.slice(1));
        };
        for (const f of fieldsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)) {
          setNested(out, f.split('.'));
        }
        return out;
      };

      const fieldsParam =
        typeof query.fields === 'string' ? query.fields : undefined;
      const fromFieldsSelect = fieldsParam
        ? buildSelectFromFields(fieldsParam)
        : undefined;

      // helper to check plain objects
      const isObject = (x: unknown): x is Record<string, any> =>
        x !== null && typeof x === 'object' && !Array.isArray(x);

      // helper to extract nested select object (or undefined) from a value that might be boolean/object
      const extractSelectObject = (
        val: unknown,
      ): Record<string, any> | undefined => {
        if (val === undefined) return undefined;
        if (typeof val === 'boolean') return undefined;
        if (isObject(val)) {
          const obj = val;
          if (isObject(obj.select)) return obj.select;
          // if object doesn't have .select, but is itself a select-like object, return it
          return obj;
        }
        return undefined;
      };

      const mergeSelect = (
        a?: Record<string, any>,
        b?: Record<string, any>,
      ): Record<string, any> | undefined => {
        if (!a) return b ? { ...b } : undefined;
        if (!b) return { ...a };
        const res: Record<string, any> = { ...a };
        for (const [k, v] of Object.entries(b)) {
          const leftVal: unknown = res[k];
          const rightVal: unknown = v;

          // if both sides are plain objects -> merge recursively
          if (isObject(leftVal) && isObject(rightVal)) {
            const leftSelectObj = extractSelectObject(leftVal);
            const rightSelectObj = extractSelectObject(rightVal);

            const mergedNestedSelect = mergeSelect(
              leftSelectObj,
              rightSelectObj,
            );

            // build final nested representation: preserve include/select shape if present, else use mergedSelect
            if (isObject(leftVal) && isObject(leftVal.select)) {
              res[k] = {
                ...leftVal,
                select: mergedNestedSelect ?? leftVal.select,
              };
            } else if (isObject(rightVal) && isObject(rightVal.select)) {
              res[k] = {
                ...rightVal,
                select: mergedNestedSelect ?? rightVal.select,
              };
            } else {
              res[k] = mergedNestedSelect ?? leftVal ?? rightVal;
            }
          } else {
            // otherwise prefer right side (fields param overrides option)
            res[k] = rightVal;
          }
        }
        return res;
      };

      const select = mergeSelect(fromOptionsSelect, fromFieldsSelect);

      // Prisma does not allow `select` and `include` together. Prefer `select` when provided
      const finalInclude = select ? undefined : options.include;

      // Calculate page/limit for backwards compatibility
      // Protect against division-by-zero: use default page of 1 when take is 0
      const pageNum = take > 0 ? Math.max(1, Math.floor(skip / take) + 1) : 1;
      const limitNum = take;

      const parsedQuery = {
        where,
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
        skip,
        take,
        page: pageNum,
        limit: limitNum,
        ...(select && { select }),
        ...(finalInclude && { include: finalInclude }),
      } as ParsedQuery & { page: number; limit: number };

      return parsedQuery;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Invalid query parameters: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
);

/**
 * Execute query with pagination metadata
 */
export async function executeQuery<T>(
  model: {
    findMany: (params: any) => Promise<T[]>;
    count: (params: any) => Promise<number>;
  },
  parsedQuery: ParsedQuery & { page: number; limit: number },
): Promise<PaginatedResponse<T>> {
  try {
    const { page, limit, where, orderBy, skip, take, select, include } =
      parsedQuery;

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        ...(orderBy && Object.keys(orderBy).length > 0 && { orderBy }),
        skip,
        take,
        ...(select && { select }),
        ...(include && { include }),
      }),
      model.count({ where }),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage,
      },
      data,
    };
  } catch (error) {
    throw new Error(
      `Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
