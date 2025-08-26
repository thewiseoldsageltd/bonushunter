import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use Replit backend in production, relative URLs in development
  const BACKEND_URL = import.meta.env.PROD 
    ? 'https://def70970-e455-49b3-94a8-84862a055de9-00-1os3u94dmcw5t.picard.replit.dev'
    : '';
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: import.meta.env.PROD ? "omit" : "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Use Replit backend in production, relative URLs in development
    const BACKEND_URL = import.meta.env.PROD 
      ? 'https://def70970-e455-49b3-94a8-84862a055de9-00-1os3u94dmcw5t.picard.replit.dev'
      : '';
    const url = queryKey.join("/") as string;
    const fullUrl = `${BACKEND_URL}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: import.meta.env.PROD ? "omit" : "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
