const MAX_BYTES = 10 * 1024 * 1024;

/** Simulates multipart upload latency until a real API exists. */
export async function simulateFileUpload(file: File): Promise<void> {
  if (file.size > MAX_BYTES) {
    throw new Error('File exceeds 10 MB limit.');
  }
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 600 + Math.min(900, Math.floor(file.size / 120_000)));
  });
}

export const MESSAGE_MAX_FILE_BYTES = MAX_BYTES;
