"use server";

import { cookies } from "next/headers";

type FetchOptions<TBody = unknown> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  headers?: Record<string, string>;
};

export async function apiFetch<T, TBody = unknown>(
  endpoint: string,
  options: FetchOptions<TBody> = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const cookieStore = await cookies();

  // Forward all cookies as a single Cookie header string
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

  const isFormData = body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  // Only attach Cookie header if there are cookies to send
  if (cookieHeader) {
    requestHeaders["Cookie"] = cookieHeader;
  }

  const config: RequestInit = {
    method,
    cache: "no-store",
    headers: requestHeaders,
  };

  if (body) {
    config.body = isFormData ? (body as BodyInit) : JSON.stringify(body);
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const res = await fetch(`${baseUrl}${endpoint}`, config);

  const rawBody = await res.text();

  const parseJson = () => {
    if (!rawBody) return null;
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  };

  if (!res.ok) {
    const error = parseJson() as { message?: string } | null;
    throw new Error(
      error?.message || rawBody || `Request failed: ${res.status}`,
    );
  }

  const data = parseJson();
  if (data !== null) {
    return data as T;
  }

  return (rawBody as unknown as T) ?? ({} as T);
}