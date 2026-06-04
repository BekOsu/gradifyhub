export type RealtimeSession = {
  id: string;
  client_secret: {
    value: string;
    expires_at: number;
  };
  model: string;
};

export async function createRealtimeSession(
  mode: string,
  scenarioContext: string,
  _plan?: string
): Promise<RealtimeSession> {
  const apiKey = process.env.AGENT_OPENAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const systemPrompt = buildSystemPrompt(mode, scenarioContext);

  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'alloy',
      instructions: systemPrompt,
      modalities: ['audio', 'text'],
      input_audio_transcription: { model: 'whisper-1' },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 800,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI Realtime session failed: ${err}`);
  }

  return (response.json() as Promise<RealtimeSession>);
}

export function buildSystemPrompt(mode: string, scenarioContext: string): string {
  const baseContext = `Context: ${scenarioContext}`;

  switch (mode) {
    case 'interview':
      return `You are a friendly but professional technical interviewer. Ask focused follow-up questions. Speak clearly at a moderate pace. Keep each turn under 3 sentences. ${baseContext}`;

    case 'standup':
      return `You are a team lead running a daily standup. Be brief, focused, and helpful. Keep each turn under 2 sentences. ${baseContext}`;

    case 'meeting':
      return `You are a colleague in a work meeting. Engage naturally, ask for opinions. Keep each turn under 3 sentences. ${baseContext}`;

    case 'casual':
    default:
      return `You are a friendly colleague having a casual conversation. Be warm and natural. Keep each turn under 2 sentences. ${baseContext}`;
  }
}
