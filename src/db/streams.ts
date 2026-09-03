import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { streams } from './schema.ts';

export async function getCreatorStreamByUid(creatorUid: string) {
  const rows = await db
    .select()
    .from(streams)
    .where(eq(streams.creatorUid, creatorUid))
    .limit(1);
  return rows[0];
}

export async function createCreatorStream(
  creatorUid: string,
  data: { muxLiveStreamId: string; muxStreamKey: string; muxPlaybackId: string | null },
) {
  const rows = await db
    .insert(streams)
    .values({
      creatorUid,
      muxLiveStreamId: data.muxLiveStreamId,
      muxStreamKey: data.muxStreamKey,
      muxPlaybackId: data.muxPlaybackId,
    })
    .returning();
  return rows[0];
}

// Called by the Mux webhook handler, which identifies the stream by Mux's
// own live stream ID rather than our creator uid.
export async function updateStreamStatus(
  muxLiveStreamId: string,
  status: 'idle' | 'active' | 'disabled',
) {
  const rows = await db
    .update(streams)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === 'active' ? { lastLiveAt: new Date() } : {}),
    })
    .where(eq(streams.muxLiveStreamId, muxLiveStreamId))
    .returning();
  return rows[0];
}

export async function updateStreamKey(creatorUid: string, muxStreamKey: string) {
  const rows = await db
    .update(streams)
    .set({ muxStreamKey, updatedAt: new Date() })
    .where(eq(streams.creatorUid, creatorUid))
    .returning();
  return rows[0];
}

export async function updateStreamMeta(
  creatorUid: string,
  data: { title?: string; game?: string; latencyMode?: 'low' | 'reduced' | 'standard' },
) {
  const rows = await db
    .update(streams)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(streams.creatorUid, creatorUid))
    .returning();
  return rows[0];
}
