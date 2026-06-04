import { type NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { presignR2Put, presignR2Get } from '~/lib/english/r2-sign';

async function fetchWithRetry(
  fn: () => Promise<Response>,
  retries = 3
): Promise<Response> {
  let last: Response | undefined;
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fn();
    if (res.ok || res.status < 500) return res;
    last = res;
    if (attempt < retries - 1) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1_000));
    }
  }
  return last!;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const text = req.nextUrl.searchParams.get('text');

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: 'text parameter is required' }, { status: 400 });
    }

    const sanitizedText = text.trim().slice(0, 500);
    const textHash = createHash('sha256')
      .update(sanitizedText)
      .digest('hex')
      .slice(0, 16);
    const r2Key = `audio/reference/${textHash}.mp3`;

    const elKey = process.env.ELEVENLABS_API_KEY;
    if (!elKey) {
      return NextResponse.json({ error: 'TTS not configured' }, { status: 404 });
    }

    // Check if cached in R2
    const getUrl = presignR2Get(r2Key, 60);
    const headRes = await fetch(getUrl, { method: 'HEAD' });
    if (headRes.ok) {
      const freshUrl = presignR2Get(r2Key, 3600);
      return NextResponse.redirect(freshUrl);
    }

    // Generate TTS via ElevenLabs (retries on 5xx)
    const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
    const ttsRes = await fetchWithRetry(() =>
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: sanitizedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      })
    );

    if (!ttsRes.ok) {
      return NextResponse.json(
        { error: 'TTS generation failed. Please try again.' },
        { status: 502 }
      );
    }

    // Upload to R2 (retries on 5xx)
    const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
    const putUrl = presignR2Put(r2Key, 'audio/mpeg', 300);
    const uploadRes = await fetchWithRetry(() =>
      fetch(putUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'audio/mpeg' },
        body: audioBuffer,
      })
    );

    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: 'Audio storage failed. Please try again.' },
        { status: 500 }
      );
    }

    // Return presigned GET URL
    const finalUrl = presignR2Get(r2Key, 3600);
    return NextResponse.redirect(finalUrl);
  } catch (error) {
    console.error('Reference audio generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
