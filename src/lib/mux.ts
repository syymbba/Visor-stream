const MUX_CDN = 'https://stream.mux.com';

export function getMuxPlaybackUrl(playbackId?: string | null) {
  if (!playbackId) return null;
  return `${MUX_CDN}/${playbackId}.m3u8`;
}

export function getMuxPosterUrl(playbackId?: string | null) {
  if (!playbackId) return null;
  return `https://image.mux.com/${playbackId}/thumbnail.jpg`;
}

export function getMuxStreamUrl(playbackId?: string | null) {
  return getMuxPlaybackUrl(playbackId) ?? '';
}
