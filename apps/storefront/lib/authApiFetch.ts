type FetchOptions<TBody = unknown> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  headers?: Record<string, string>;
};

export async function authApiFetch<T, TBody = unknown>(
  endpoint: string,
  options: FetchOptions<TBody> = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const isFormData = body instanceof FormData;

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  };

  if (body) {
    config.body = isFormData ? (body as BodyInit) : JSON.stringify(body);
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_AUTH_URL ?? "";
  const response = await fetch(`${baseUrl}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Request failed: ${response.status}`);
  }

  return response.json();
}