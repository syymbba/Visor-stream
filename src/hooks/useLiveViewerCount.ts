import useSWR from 'swr';

/**
 * Real concurrent-viewer count for a creator's live stream, polled directly
 * from Mux's client-side stats endpoint using a short-lived signed JWT
 * fetched from our own `GET /api/streams/:creatorUid/viewer-token`.
 *
 * CONFIDENCE NOTE: the request URL below (`https://stats.mux.com/counts?
 * token={jwt}`) is confirmed from `@mux/mux-node`'s own README (see
 * node_modules/@mux/mux-node/README.md, the `signViewerCounts` example),
 * which documents it verbatim as the pairing for a token produced by
 * `mux.jwt.signViewerCounts()` - the same call our backend makes. What is
 * NOT independently verified here is the exact response JSON shape, since
 * this environment has no network access to pull Mux's live docs page
 * (https://docs.mux.com/guides/see-how-many-people-are-watching) and
 * confirm the field name precisely. Rather than fabricate one confident
 * shape, `extractViewerCount` below defensively checks several plausible
 * locations for the count (`data.total_count`, `data.count`, top-level
 * `total_count`/`count`). If Mux's actual response uses a different key
 * entirely, this will silently return `null` (safe degraded state, not a
 * crash) - verify against a live response once real Mux credentials are
 * configured and adjust `extractViewerCount` if needed.
 */

interface ViewerTokenResponse {
  token: string;
}

interface MuxViewerCountsResponse {
  data?: {
    total_count?: number;
    count?: number;
  };
  total_count?: number;
  count?: number;
}

function extractViewerCount(payload: MuxViewerCountsResponse): number | null {
  const candidates = [
    payload?.data?.total_count,
    payload?.data?.count,
    payload?.total_count,
    payload?.count,
  ];
  const found = candidates.find((v) => typeof v === 'number' && Number.isFinite(v));
  return typeof found === 'number' ? found : null;
}

async function fetchViewerCount(creatorUid: string): Promise<number | null> {
  // Step 1: get a short-lived signed viewer-count JWT from our own backend.
  // This endpoint is public (no auth header needed) and returns 503 when
  // MUX_SIGNING_KEY_ID/MUX_SIGNING_KEY_PRIVATE aren't configured - an
  // expected degraded state during local dev without full Mux credentials,
  // not an error worth surfacing loudly to the viewer.
  let tokenRes: Response;
  try {
    tokenRes = await fetch(`/api/streams/${encodeURIComponent(creatorUid)}/viewer-token`);
  } catch {
    return null;
  }
  if (!tokenRes.ok) {
    // 503 (signing not configured), 404 (no stream yet), or any other
    // failure - all degrade to "no count available" rather than throwing.
    return null;
  }
  let tokenJson: ViewerTokenResponse;
  try {
    tokenJson = await tokenRes.json();
  } catch {
    return null;
  }
  if (!tokenJson?.token) return null;

  // Step 2: poll Mux's public stats endpoint directly with that token.
  try {
    const statsRes = await fetch(`https://stats.mux.com/counts?token=${encodeURIComponent(tokenJson.token)}`);
    if (!statsRes.ok) return null;
    const statsJson: MuxViewerCountsResponse = await statsRes.json();
    return extractViewerCount(statsJson);
  } catch {
    return null;
  }
}

export interface UseLiveViewerCountResult {
  viewerCount: number | null;
  isLoading: boolean;
}

/**
 * Polls the real concurrent viewer count for `creatorUid`'s live stream.
 * Uses SWR's conditional-fetch idiom (`null` key when `creatorUid` is
 * undefined) matching `useWalletBalance.ts`, and the same ~15-20s cadence.
 */
export function useLiveViewerCount(creatorUid: string | undefined): UseLiveViewerCountResult {
  const { data, isLoading } = useSWR<number | null>(
    creatorUid ? ['live-viewer-count', creatorUid] : null,
    () => fetchViewerCount(creatorUid as string),
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
    }
  );

  if (!creatorUid) {
    return { viewerCount: null, isLoading: false };
  }

  return { viewerCount: data ?? null, isLoading };
}
