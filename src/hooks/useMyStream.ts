import useSWR from 'swr';
import { authedGetFetcher, ApiError } from '../lib/apiClient';
import { getAuthHeaders } from '../firebase';

export interface MyStreamData {
  muxLiveStreamId: string;
  muxStreamKey: string;
  muxPlaybackId: string | null;
  status: 'idle' | 'active' | 'disabled';
  rtmpUrl: string;
  title: string | null;
  game: string | null;
  /** Real Mux per-live-stream latency setting (LiveStreamUpdateParams `latency_mode`). */
  latencyMode: 'low' | 'reduced' | 'standard' | null;
}

export interface UseMyStreamOptions {
  /** When false, does not fetch. Defaults to true. */
  enabled?: boolean;
}

/**
 * The signed-in creator's own persistent Mux Live Stream record - RTMP URL,
 * secret stream key, current status, and title/game - backed by
 * `GET /api/streams/me` (which get-or-creates the stream server-side on
 * first call, scoped to the caller's own uid; never accepts an id param).
 *
 * This is the one shared fetch/cache/mutate path for that resource, used by
 * GoLiveModal, CreatorStudioView and SettingsView's Streaming Ingest tab -
 * previously each of those three surfaces had (or would have had) its own
 * copy of this fetch + a client-side `Math.random()` fake key generator.
 */
export function useMyStream(options?: UseMyStreamOptions) {
  const enabled = options?.enabled !== false;

  const { data, error, isLoading, mutate } = useSWR<MyStreamData>(
    enabled ? '/api/streams/me' : null,
    authedGetFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 4000,
    }
  );

  const regenerateKey = async (): Promise<string> => {
    const res = await fetch('/api/streams/me/regenerate-key', {
      method: 'POST',
      headers: await getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.error) {
      throw new ApiError(json?.error || `Failed to regenerate stream key (${res.status})`, res.status);
    }
    await mutate(
      (current) => (current ? { ...current, muxStreamKey: json.muxStreamKey } : current),
      { revalidate: false }
    );
    return json.muxStreamKey as string;
  };

  const updateMeta = async (meta: { title?: string; game?: string; latencyMode?: 'low' | 'reduced' | 'standard' }): Promise<void> => {
    const res = await fetch('/api/streams/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
      body: JSON.stringify(meta),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.error) {
      throw new ApiError(json?.error || `Failed to update stream (${res.status})`, res.status);
    }
    await mutate((current) => (current ? { ...current, ...json } : current), { revalidate: false });
  };

  return {
    stream: data ?? null,
    isLoading,
    error: error instanceof ApiError ? error.message : error ? 'Failed to load stream' : null,
    regenerateKey,
    updateMeta,
    refresh: () => mutate(),
  };
}
