'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import { endSessionAction, addSuggestedVocabAction } from '~/actions/english/speak';
import type { SessionSummary } from '~/lib/english/speaking-partner';

type VoiceModeProps = {
  mode: string;
  scenarioId: string;
  scenarioContext: string;
  scenarioTitle: string;
  onBack: () => void;
};

type ConnectionPhase = 'idle' | 'connecting' | 'connected' | 'ending' | 'done';

export function VoiceMode({
  mode,
  scenarioId,
  scenarioContext,
  scenarioTitle,
  onBack,
}: VoiceModeProps) {
  const [phase, setPhase] = useState<ConnectionPhase>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([]);
  const [currentAiText, setCurrentAiText] = useState('');
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [addedVocab, setAddedVocab] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState('');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, currentAiText]);

  const handleRealtimeEvent = useCallback(
    (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string);
        switch (event.type) {
          case 'response.audio_transcript.delta':
            setCurrentAiText((prev) => prev + (event.delta ?? ''));
            break;
          case 'response.audio_transcript.done':
            setTranscript((prev) => [...prev, { role: 'ai', text: event.transcript ?? currentAiText }]);
            setCurrentAiText('');
            break;
          case 'conversation.item.input_audio_transcription.completed':
            setTranscript((prev) => [...prev, { role: 'user', text: event.transcript ?? '' }]);
            break;
        }
      } catch {
        // Silent catch for JSON parse errors
      }
    },
    [currentAiText]
  );

  async function handleConnect() {
    setPhase('connecting');
    setErrorMsg('');
    try {
      // 1. Get session tokens from server
      const res = await fetch('/api/english/voice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, scenarioId, scenarioContext }),
      });
      if (!res.ok) throw new Error('Failed to create voice session');
      const { sessionId: sid, realtimeClientSecret, realtimeModel } = await res.json();
      setSessionId(sid);

      // 2. Get mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Create RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 4. Add mic tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 5. Handle AI audio output
      pc.ontrack = (e) => {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.srcObject = e.streams[0] as MediaStream;
        audioRef.current.play().catch(() => {});
      };

      // 6. DataChannel for events
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = handleRealtimeEvent;

      // 7. SDP negotiation
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch(
        `https://api.openai.com/v1/realtime?model=${realtimeModel}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${realtimeClientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      );
      if (!sdpRes.ok) throw new Error('WebRTC negotiation failed');
      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      setPhase('connected');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Connection failed'
      );
      setPhase('idle');
      cleanup();
    }
  }

  function handleMute() {
    if (!streamRef.current) return;
    const enabled = !isMuted;
    streamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !enabled;
    });
    setIsMuted(enabled);
  }

  function cleanup() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current = null;
    }
  }

  async function handleEnd() {
    if (!sessionId) return;
    setPhase('ending');
    cleanup();
    const res = await endSessionAction(sessionId);
    if (res.success) {
      setSummary(res.summary);
      setPhase('done');
    } else {
      setErrorMsg(res.error);
      setPhase('connected');
    }
  }

  async function handleAddVocab(
    phrase: string,
    meaning: string,
    example: string,
    category: string
  ) {
    const res = await addSuggestedVocabAction(
      phrase,
      meaning,
      example,
      category
    );
    if (res.success) setAddedVocab((prev) => new Set(prev).add(phrase));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-12 sm:px-0">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Phase: idle */}
      {phase === 'idle' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold text-foreground">
              {scenarioTitle}
            </h2>
          </div>
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 mx-auto">
              <Mic className="h-8 w-8 text-brand-green" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Ready to speak?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The AI will play the role in this scenario. Speak naturally — you&apos;ll
              get feedback at the end.
            </p>
            <button
              type="button"
              onClick={handleConnect}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              <Mic className="h-4 w-4" />
              Start voice session
            </button>
          </div>
        </div>
      )}

      {/* Phase: connecting */}
      {phase === 'connecting' && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
          <p className="text-sm text-muted-foreground">Connecting…</p>
        </div>
      )}

      {/* Phase: connected */}
      {phase === 'connected' && (
        <div
          className="flex flex-col"
          style={{
            height: 'calc(100vh - 220px)',
            minHeight: '400px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <p className="text-sm font-medium text-foreground">
                {scenarioTitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMute}
                className={`rounded-xl p-2.5 transition-all ${
                  isMuted
                    ? 'bg-red-100 text-red-600'
                    : 'border border-border hover:bg-muted'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleEnd}
                className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
              >
                <PhoneOff className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {transcript.length === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-8">
                Start speaking — your conversation will appear here
              </p>
            )}
            {transcript.map((turn, i) => (
              <div
                key={i}
                className={`flex ${
                  turn.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    turn.role === 'ai'
                      ? 'bg-muted text-foreground rounded-tl-sm'
                      : 'bg-brand-green text-white rounded-tr-sm'
                  }`}
                >
                  {turn.text}
                </div>
              </div>
            ))}
            {/* Streaming AI text */}
            {currentAiText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground opacity-70">
                  {currentAiText}
                  <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* AI speaking indicator */}
          {currentAiText && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Volume2 className="h-3 w-3" />
              AI is speaking…
            </div>
          )}
        </div>
      )}

      {/* Phase: ending */}
      {phase === 'ending' && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating your feedback…</p>
        </div>
      )}

      {/* Phase: done (summary) */}
      {phase === 'done' && summary && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Session complete
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {scenarioTitle} · Voice mode
            </p>
          </div>

          {/* Scores */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold">Your scores</h3>
            {[
              { label: 'Fluency', score: summary.fluency_score },
              { label: 'Grammar', score: summary.grammar_score },
              { label: 'Vocabulary', score: summary.vocab_score },
            ].map(({ label, score }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{label}</span>
                  <span
                    className={`font-semibold ${
                      score >= 70
                        ? 'text-green-600'
                        : score >= 40
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {score}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      score >= 70
                        ? 'bg-green-500'
                        : score >= 40
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Top 3 issues */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold">3 things to work on</h3>
            <div className="space-y-3">
              {summary.top_issues.map((issue, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {issue.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {issue.instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vocab suggestions */}
          {summary.vocab_suggestions.length > 0 && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold">
                Add to your vocabulary
              </h3>
              <div className="space-y-3">
                {summary.vocab_suggestions.map((v) => (
                  <div
                    key={v.phrase}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{v.phrase}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.meaning}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddVocab(
                          v.phrase,
                          v.meaning,
                          v.example,
                          v.category
                        )
                      }
                      disabled={addedVocab.has(v.phrase)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        addedVocab.has(v.phrase)
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-brand-green text-white hover:opacity-90'
                      }`}
                    >
                      {addedVocab.has(v.phrase) ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.overall_feedback && (
            <p className="text-sm text-muted-foreground text-center">
              {summary.overall_feedback}
            </p>
          )}

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              New session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
