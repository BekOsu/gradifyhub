import { AccessToken } from 'livekit-server-sdk';

export async function createVoiceRoomToken(
  userId: string,
  sessionId: string,
  roomName: string
): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured');
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: `user-${userId}`,
    ttl: 3600,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return token.toJwt();
}

export function generateRoomName(sessionId: string): string {
  return `voice-${sessionId}`;
}
