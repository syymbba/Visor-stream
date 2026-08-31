import { getAuthHeaders } from '../firebase';

export interface MuxDirectUploadResponse {
  uploadUrl: string;
  uploadId: string;
  assetId: string | null;
}

export async function createMuxDirectUpload(): Promise<MuxDirectUploadResponse> {
  const res = await fetch('/api/mux/direct-upload', {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || data?.error) {
    throw new Error(data?.error || 'Failed to create Mux upload');
  }
  return data as MuxDirectUploadResponse;
}
