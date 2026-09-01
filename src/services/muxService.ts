import { getAuthHeaders } from '../firebase';

export interface MuxDirectUploadResponse {
  uploadUrl: string;
  uploadId: string;
  assetId: string | null;
}

export interface MuxDirectUploadRequest {
  contentType: string;
  fileSize: number;
}

export async function createMuxDirectUpload(
  payload: MuxDirectUploadRequest
): Promise<MuxDirectUploadResponse> {
  const res = await fetch('/api/mux/direct-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data?.error) {
    throw new Error(data?.error || 'Failed to create Mux upload');
  }
  return data as MuxDirectUploadResponse;
}
