import { simulateFileUpload } from '@/src/lib/messages/simulate-upload';

export interface UploadedAttachmentMeta {
  id: string;
  /** Public or signed URL returned by your storage/CDN after upload. */
  url: string;
}

/**
 * Upload a message attachment for the chat composer.
 *
 * **Integration point:** Replace the implementation with your backend, e.g.:
 * ```ts
 * const form = new FormData();
 * form.append('file', file);
 * const res = await fetch('/api/messages/attachments', { method: 'POST', body: form });
 * if (!res.ok) throw new Error(await res.text());
 * const { id, url } = await res.json();
 * return { id, url };
 * ```
 *
 * Until then, this simulates latency and returns a local object URL for preview/download in-session.
 */
export async function uploadMessageFile(file: File): Promise<UploadedAttachmentMeta> {
  await simulateFileUpload(file);
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `att_${Date.now()}`;
  return { id, url: URL.createObjectURL(file) };
}
