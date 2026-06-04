import OpenAI from 'openai';

// This file intentionally calls openai directly — aiGenerateObject does not support audio input.
// Whisper is the only audio transcription API we use.

export async function aiTranscribe(audioBuffer: Buffer, mimeType: string = 'audio/webm'): Promise<string> {
  const apiKey = process.env.AGENT_OPENAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const openai = new OpenAI({ apiKey });

  // Determine file extension from mimeType
  let ext = 'webm';
  if (mimeType === 'audio/mp4') ext = 'mp4';
  else if (mimeType === 'audio/ogg') ext = 'ogg';
  else if (mimeType === 'audio/mpeg') ext = 'mp3';
  else if (mimeType === 'audio/wav') ext = 'wav';
  else if (mimeType === 'audio/m4a') ext = 'm4a';

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: new File([new Uint8Array(audioBuffer)], `audio.${ext}`, { type: mimeType }),
    response_format: 'text',
  });

  return response as unknown as string;
}
