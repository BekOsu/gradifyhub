import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '~/lib/auth/session';
import { createVoiceRoomToken, generateRoomName } from '~/lib/english/livekit';
import { createRealtimeSession } from '~/lib/english/realtime-voice';
import { db } from '@repo/db/client';
import * as schema from '@repo/db/schema';
import { getUserPlan } from '~/lib/billing/hasFeature';

const VALID_MODES = ['interview', 'standup', 'meeting', 'casual'] as const;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth();

    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1_048_576) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const body = await req.json();
    const { mode, scenarioId, scenarioContext } = body as {
      mode?: string;
      scenarioId?: string;
      scenarioContext?: string;
    };

    if (!mode || typeof mode !== 'string') {
      return NextResponse.json(
        { error: 'mode is required' },
        { status: 400 }
      );
    }

    if (!VALID_MODES.includes(mode as (typeof VALID_MODES)[number])) {
      return NextResponse.json(
        { error: `mode must be one of: ${VALID_MODES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!scenarioId || typeof scenarioId !== 'string') {
      return NextResponse.json(
        { error: 'scenarioId is required' },
        { status: 400 }
      );
    }

    if (!scenarioContext || typeof scenarioContext !== 'string') {
      return NextResponse.json(
        { error: 'scenarioContext is required' },
        { status: 400 }
      );
    }

    const plan = await getUserPlan(user.id);

    const [session] = await db
      .insert(schema.speakingSession)
      .values({
        userId: user.id,
        mode,
        scenarioId,
        modality: 'voice',
        status: 'active',
        transcriptJson: [],
      })
      .returning({ id: schema.speakingSession.id });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    const roomName = generateRoomName(session.id);

    const [livekitToken, realtimeSession] = await Promise.all([
      createVoiceRoomToken(user.id, session.id, roomName),
      createRealtimeSession(mode, scenarioContext, plan),
    ]);

    return NextResponse.json({
      sessionId: session.id,
      roomName,
      livekitUrl: process.env.LIVEKIT_URL!,
      livekitToken,
      realtimeClientSecret: realtimeSession.client_secret.value,
      realtimeModel: realtimeSession.model,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('redirect')) {
      throw error;
    }
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    );
  }
}
