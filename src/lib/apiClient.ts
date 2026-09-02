import { getAuthHeaders } from '../firebase';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Shared fetcher for authenticated GET requests, meant to be used as the SWR
 * fetcher. Using one shared fetcher/cache key scheme means multiple
 * components requesting the same resource (e.g. two places on screen both
 * showing wallet balance) share a single in-flight request and cache entry
 * instead of firing independent, staggered polling requests against the
 * database.
 */
export async function authedGetFetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { headers: await getAuthHeaders() });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError(`Unexpected non-JSON response (${res.status})`, res.status);
  }
  const data = await res.json();
  if (!res.ok || data?.error) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

/**
 * Shared fetcher for public GET requests that need no auth header (e.g.
 * `GET /api/streams/live`) - same error-handling conventions as
 * `authedGetFetcher` above, just without attaching a Firebase auth header.
 */
export async function plainGetFetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError(`Unexpected non-JSON response (${res.status})`, res.status);
  }
  const data = await res.json();
  if (!res.ok || data?.error) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}
