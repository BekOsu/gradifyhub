'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Mic,
  Square,
  Play,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { startRecording, blobToBase64 } from '~/lib/english/audio-upload';
import {
  startShadowingSessionAction,
  submitShadowingAction,
} from '~/actions/english/shadow';
import type { ShadowingEvaluation } from '~/lib/english/shadowing';
import type { AccentAnalysis } from '~/lib/english/fluency-analyzer';

type ShadowingPhrase = {
  userVocabId: string;
  phrase: string;
  meaning: string;
  example: string | null;
  category: string;
};

type Phase =
  | 'ready'
  | 'playing'
  | 'recording'
  | 'processing'
  | 'feedback'
  | 'done';

export function ShadowingCoach({
  phrases,
}: {
  phrases: ShadowingPhrase[];
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<ShadowingEvaluation | null>(null);
  const [accentAnalysis, setAccentAnalysis] = useState<AccentAnalysis | null>(null);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const stopRef = useRef<(() => Promise<{ blob: Blob; mimeType: string; durationMs: number }>) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentPhrase = phrases[phraseIndex]!;
  const isLastPhrase = phraseIndex === phrases.length - 1;

  const handlePlayBrowserTTS = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setPhase('ready');
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.85;
    utt.lang = 'en-US';
    utt.onend = () => setPhase('ready');
    window.speechSynthesis.speak(utt);
  }, []);

  async function handlePlay() {
    setPhase('playing');
    const encodedText = encodeURIComponent(currentPhrase.phrase);
    const audioUrl = `/api/english/shadow/reference-audio?text=${encodedText}`;

    // Try API route first (ElevenLabs)
    const res = await fetch(audioUrl, { method: 'HEAD' }).catch(() => null);

    if (res?.ok) {
      // Use audio element
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPhase('ready');
      audio.onerror = () => {
        // Fallback to browser TTS
        handlePlayBrowserTTS(currentPhrase.phrase);
      };
      audio.play().catch(() => handlePlayBrowserTTS(currentPhrase.phrase));
    } else {
      handlePlayBrowserTTS(currentPhrase.phrase);
    }
  }

  async function handleStartRecording() {
    setErrorMsg('');
    try {
      const recorder = await startRecording();
      stopRef.current = recorder.stop;
      setPhase('recording');
    } catch {
      setErrorMsg(
        'Could not access microphone. Please allow microphone permissions.'
      );
      setPhase('ready');
    }
  }

  async function handleStopAndSubmit() {
    if (!stopRef.current) return;
    setPhase('processing');

    try {
      // Start session if not already started
      let sid = sessionId;
      if (!sid) {
        const res = await startShadowingSessionAction(currentPhrase.phrase);
        if (!res.success) throw new Error(res.error);
        sid = res.sessionId;
        setSessionId(sid);
      }

      const { blob, mimeType } = await stopRef.current();
      stopRef.current = null;

      const audioBase64 = await blobToBase64(blob);
      const result = await submitShadowingAction(sid, audioBase64, mimeType);

      if (!result.success) throw new Error(result.error);

      setTranscript(result.transcript);
      setEvaluation(result.evaluation);
      setAccentAnalysis(result.accentAnalysis ?? null);
      setPhase('feedback');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong'
      );
      setPhase('ready');
    }
  }

  function handleNext() {
    if (isLastPhrase) {
      setPhase('done');
    } else {
      setPhraseIndex((i) => i + 1);
      setPhase('ready');
      setEvaluation(null);
      setAccentAnalysis(null);
      setTranscript('');
      setSessionId(null);
      setErrorMsg('');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-12 sm:px-0">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Phrase {phraseIndex + 1} of {phrases.length}
          </span>
          <span>
            {Math.round(((phraseIndex) / phrases.length) * 100)}% complete
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-brand-green transition-all duration-300"
            style={{
              width: `${(phraseIndex / phrases.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Phrase card */}
      {phase !== 'done' && (
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <p className="text-2xl font-semibold text-foreground">
            {currentPhrase.phrase}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {currentPhrase.meaning}
          </p>
          {currentPhrase.example && (
            <p className="mt-3 text-xs italic text-muted-foreground/70">
              &quot;{currentPhrase.example}&quot;
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Controls */}
      {phase !== 'done' && (
        <>
          {(phase === 'ready' ||
            phase === 'playing' ||
            phase === 'recording' ||
            phase === 'processing') && (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePlay}
                disabled={
                  phase === 'playing' ||
                  phase === 'recording' ||
                  phase === 'processing'
                }
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-all hover:bg-muted disabled:opacity-40"
              >
                <Play className="h-4 w-4" />
                {phase === 'playing' ? 'Playing…' : 'Play reference'}
              </button>

              {phase !== 'recording' ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={phase === 'playing' || phase === 'processing'}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                >
                  <Mic className="h-4 w-4" />
                  Record
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAndSubmit}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  <Square className="h-4 w-4" />
                  Stop & Submit
                </button>
              )}
            </div>
          )}

          {phase === 'processing' && (
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
              Transcribing and evaluating…
            </div>
          )}
        </>
      )}

      {/* Feedback card */}
      {phase === 'feedback' && evaluation && (
        <div className="space-y-5">
          {/* Score bars */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Your scores
            </h3>
            {[
              { label: 'Accuracy', score: evaluation.accuracy_score },
              { label: 'Pacing', score: evaluation.pacing_score },
              { label: 'Clarity', score: evaluation.clarity_score },
              { label: 'Naturalness', score: evaluation.naturalness_score },
            ].map(({ label, score }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
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

          {/* Word-level highlights */}
          {evaluation.word_scores.length > 0 && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Word by word
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Your transcript:{' '}
                <span className="text-foreground italic">&quot;{transcript}&quot;</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {evaluation.word_scores.map(({ word, matched }, i) => (
                  <span
                    key={i}
                    className={`rounded-md px-2 py-0.5 text-sm font-medium ${
                      matched
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3 named issues */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              3 things to work on
            </h3>
            <div className="space-y-3">
              {evaluation.issues.map((issue, i) => (
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

          {/* Accent & fluency */}
          {accentAnalysis && (
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Accent & fluency</h3>

              {/* Two score bars */}
              {[
                { label: 'Connected speech', score: accentAnalysis.connected_speech_score },
                { label: 'Rhythm', score: accentAnalysis.rhythm_score },
              ].map(({ label, score }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{label}</span>
                    <span className={`font-semibold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Filler words */}
              {accentAnalysis.filler_word_count > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">
                    Filler words: <span className="text-amber-600">{accentAnalysis.filler_word_count} detected</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {accentAnalysis.filler_words_found.map((w) => (
                      <span key={w} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3 weak patterns */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Recurring patterns</p>
                {accentAnalysis.weak_patterns.map((p, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs font-medium text-foreground">{p.pattern} <span className="text-muted-foreground font-normal">({p.frequency})</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Practice: &ldquo;{p.drill_phrase}&rdquo;</p>
                  </div>
                ))}
              </div>

              {/* Improvement tip */}
              <p className="text-xs text-muted-foreground italic">{accentAnalysis.improvement_tip}</p>
            </div>
          )}

          {/* Overall feedback */}
          <p className="text-sm text-muted-foreground text-center">
            {evaluation.overall_feedback}
          </p>

          {/* Next button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              {isLastPhrase ? 'Finish session' : 'Next phrase'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Done state */}
      {phase === 'done' && (
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10 mx-auto">
            <RotateCcw className="h-6 w-6 text-brand-green" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Session complete
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You practiced {phrases.length} phrase
            {phrases.length !== 1 ? 's' : ''}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/english/vocab"
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
            >
              Back to vocabulary
            </Link>
            <button
              type="button"
              onClick={() => {
                setPhraseIndex(0);
                setPhase('ready');
                setEvaluation(null);
                setTranscript('');
                setSessionId(null);
                setErrorMsg('');
              }}
              className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              Practice again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
