'use client';

export type RecordingResult = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
};

export async function startRecording(): Promise<{
  stop: () => Promise<RecordingResult>;
}> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const mimeType =
    [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ].find((t) => MediaRecorder.isTypeSupported(t)) ?? '';

  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : {}
  );

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const startTime = Date.now();
  recorder.start(100);

  return {
    stop: async () => {
      return new Promise((resolve, reject) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve({
            blob: new Blob(chunks, {
              type: mimeType || 'audio/webm',
            }),
            mimeType: mimeType || 'audio/webm',
            durationMs: Date.now() - startTime,
          });
        };

        recorder.onerror = (event) => {
          stream.getTracks().forEach((t) => t.stop());
          reject(new Error(`Recording error: ${event.error}`));
        };

        recorder.stop();
      });
    },
  };
}

export async function uploadAudioToR2(
  blob: Blob,
  mimeType: string
): Promise<string> {
  let ext = 'webm';
  if (mimeType === 'audio/mp4') ext = 'mp4';
  else if (mimeType === 'audio/ogg' || mimeType === 'audio/ogg;codecs=opus')
    ext = 'ogg';
  else if (mimeType === 'audio/mpeg') ext = 'mp3';
  else if (mimeType === 'audio/wav') ext = 'wav';
  else if (mimeType === 'audio/m4a') ext = 'm4a';

  const filename = `recording.${ext}`;

  const uploadUrlRes = await fetch('/api/english/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType: mimeType }),
  });

  if (!uploadUrlRes.ok) {
    throw new Error('Failed to get upload URL');
  }

  const { uploadUrl, r2Key } = (await uploadUrlRes.json()) as {
    uploadUrl: string;
    r2Key: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: blob,
  });

  if (!putRes.ok) {
    throw new Error('Failed to upload audio to R2');
  }

  return r2Key;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]!);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
