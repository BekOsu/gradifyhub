'use client';
import { useState, useRef, useEffect, useTransition } from 'react';
import { MessageSquare, Users, Calendar, Coffee, Send, X } from 'lucide-react';
import {
  startSessionAction, sendMessageAction, endSessionAction, addSuggestedVocabAction
} from '~/actions/english/speak';
import { getScenariosForMode } from '~/lib/english/scenarios';
import type { Scenario, ScenarioMode } from '~/lib/english/scenarios';
import type { PerTurnFeedback, SessionSummary } from '~/lib/english/speaking-partner';
import type { AccentAnalysis, AccentTrend } from '~/lib/english/fluency-analyzer';
import { VoiceMode } from './voice-mode';

type AppPhase = 'mode-select' | 'scenario-select' | 'chat' | 'summary' | 'voice';

interface SpeakingPartnerShellProps {
  sessions?: Array<{ id: string; mode: string; title: string; createdAt: Date }>;
}

export function SpeakingPartnerShell({ sessions: _sessions = [] }: SpeakingPartnerShellProps) {
  const [appPhase, setAppPhase] = useState<AppPhase>('mode-select');
  const [modality, setModality] = useState<'text' | 'voice'>('text');
  const [selectedMode, setSelectedMode] = useState<ScenarioMode | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'ai'|'user', content: string, feedback?: PerTurnFeedback }>>([]);
  const [input, setInput] = useState('');
  const [isSending, startSendTransition] = useTransition();
  const [isEnding, startEndTransition] = useTransition();
  const [latestFeedback, setLatestFeedback] = useState<PerTurnFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [accentAnalysis, setAccentAnalysis] = useState<AccentAnalysis | null>(null);
  const [accentTrend, setAccentTrend] = useState<AccentTrend | null>(null);
  const [addedVocab, setAddedVocab] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const MODES: Array<{ mode: ScenarioMode, label: string, Icon: React.FC<{className?: string}>, description: string, color: string }> = [
    { mode: 'interview', label: 'Interview', Icon: Users, description: 'Practice answering technical and behavioral questions', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { mode: 'standup', label: 'Standup', Icon: Calendar, description: 'Daily standups, sprint reviews, blockers', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { mode: 'meeting', label: 'Meeting', Icon: MessageSquare, description: 'Team meetings, proposals, 1-on-1s', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { mode: 'casual', label: 'Casual', Icon: Coffee, description: 'Water cooler chats, networking, Slack talk', color: 'bg-green-50 border-green-200 text-green-700' },
  ];

  function handleSelectMode(mode: ScenarioMode) {
    setSelectedMode(mode);
    setAppPhase('scenario-select');
  }

  function handleSelectScenario(scenario: Scenario) {
    setErrorMsg('');
    setSelectedScenario(scenario);

    if (modality === 'voice') {
      setAppPhase('voice');
      return;
    }

    startSendTransition(async () => {
      const res = await startSessionAction(scenario.mode, scenario.id);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to start session');
        return;
      }
      setSessionId(res.sessionId);
      setMessages([{ role: 'ai', content: res.firstMessage }]);
      setAppPhase('chat');
    });
  }

  function handleSend() {
    if (!input.trim() || !sessionId || isSending) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    startSendTransition(async () => {
      const res = await sendMessageAction(sessionId, userMsg);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to send message');
        setMessages(prev => prev.slice(0, -1));
        setInput(userMsg);
        return;
      }
      setMessages(prev => [...prev, { role: 'ai', content: res.aiResponse, feedback: res.feedback }]);
      setLatestFeedback(res.feedback);
    });
  }

  function handleEnd() {
    if (!sessionId) return;
    startEndTransition(async () => {
      const res = await endSessionAction(sessionId);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to end session');
        return;
      }
      setSummary(res.summary);
      setAccentAnalysis(res.accentAnalysis ?? null);
      setAccentTrend(res.accentTrend ?? null);
      setAppPhase('summary');
    });
  }

  function handleAddVocab(phrase: string, meaning: string, example: string, category: string) {
    startSendTransition(async () => {
      const res = await addSuggestedVocabAction(phrase, meaning, example, category);
      if (res.success) {
        setAddedVocab(prev => new Set(prev).add(phrase));
      }
    });
  }

  function handleRestart() {
    setAppPhase('mode-select');
    setSelectedMode(null);
    setSelectedScenario(null);
    setSessionId(null);
    setMessages([]);
    setInput('');
    setLatestFeedback(null);
    setSummary(null);
    setAccentAnalysis(null);
    setAccentTrend(null);
    setAddedVocab(new Set());
    setErrorMsg('');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-12 sm:px-0">
      {/* Error message */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start justify-between gap-2">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Phase: mode-select */}
      {appPhase === 'mode-select' && (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Speaking Partner</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose a conversation mode to practice</p>
          </div>

          {/* Modality toggle */}
          <div className="flex items-center gap-1 self-start rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setModality('text')}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                modality === 'text'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setModality('voice')}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                modality === 'voice'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Voice
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {MODES.map(({ mode, label, Icon, description, color }) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleSelectMode(mode)}
                className={`rounded-2xl border p-6 text-left transition-all hover:shadow-md ${color}`}
              >
                <Icon className="h-6 w-6 mb-3" />
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-xs opacity-80">{description}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Phase: scenario-select */}
      {appPhase === 'scenario-select' && selectedMode && (
        <>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAppPhase('mode-select')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold">
              {MODES.find(m => m.mode === selectedMode)?.label} — Choose a scenario
            </h2>
          </div>
          <div className="space-y-3">
            {getScenariosForMode(selectedMode).map(scenario => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleSelectScenario(scenario)}
                disabled={isSending}
                className="w-full rounded-2xl border bg-card p-5 text-left transition-all hover:shadow-sm hover:border-border/80 disabled:opacity-50"
              >
                <p className="font-semibold text-foreground">{scenario.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{scenario.context}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {scenario.stack_tags.map(tag => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          {isSending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
              Starting conversation…
            </div>
          )}
        </>
      )}

      {/* Phase: chat */}
      {appPhase === 'chat' && selectedScenario && (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          {/* Chat header */}
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <p className="font-semibold text-foreground">{selectedScenario.title}</p>
              <p className="text-xs text-muted-foreground">{selectedScenario.context}</p>
            </div>
            <button
              type="button"
              onClick={handleEnd}
              disabled={isEnding}
              className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-40"
            >
              {isEnding ? 'Ending…' : 'End session'}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'ai'
                    ? 'bg-muted text-foreground rounded-tl-sm'
                    : 'bg-brand-green text-white rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Feedback panel */}
          {latestFeedback && (
            <div className="mt-3 rounded-xl border bg-amber-50/60 border-amber-200/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-amber-800">Feedback on your last message</p>
                <button type="button" onClick={() => setShowFeedback(v => !v)} className="text-xs text-amber-600 hover:text-amber-800">
                  {showFeedback ? 'Hide' : 'Show'}
                </button>
              </div>
              {showFeedback && (
                <div className="space-y-2 text-xs">
                  {latestFeedback.grammar_issues && latestFeedback.grammar_issues.length > 0 && (
                    <div>
                      <p className="font-medium text-amber-900 mb-1">Grammar</p>
                      {latestFeedback.grammar_issues.map((g, i) => (
                        <p key={i} className="text-amber-800">
                          <span className="line-through text-red-500">{g.original}</span>{' → '}
                          <span className="text-green-700 font-medium">{g.corrected}</span>
                          {' — '}{g.explanation}
                        </p>
                      ))}
                    </div>
                  )}
                  {latestFeedback.vocab_suggestions && latestFeedback.vocab_suggestions.length > 0 && (
                    <div>
                      <p className="font-medium text-amber-900 mb-1">Better vocabulary</p>
                      {latestFeedback.vocab_suggestions.map((v, i) => (
                        <p key={i} className="text-amber-800">
                          Instead of &ldquo;<span className="italic">{v.instead_of}</span>&rdquo;, try &ldquo;<span className="font-medium text-green-700">{v.use}</span>&rdquo; — {v.reason}
                        </p>
                      ))}
                    </div>
                  )}
                  {latestFeedback.better_phrasing && (
                    <div>
                      <p className="font-medium text-amber-900 mb-1">More natural phrasing</p>
                      <p className="italic text-amber-800">&ldquo;{latestFeedback.better_phrasing}&rdquo;</p>
                    </div>
                  )}
                  {latestFeedback.fluency_notes && (
                    <p className="text-amber-700">{latestFeedback.fluency_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Input bar */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your message…"
              disabled={isSending}
              className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/30 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className="rounded-xl bg-brand-green px-4 py-2.5 text-white transition-all hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Phase: summary */}
      {appPhase === 'summary' && summary && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Session complete</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selectedScenario?.title}</p>
          </div>

          {/* Score bars */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Your scores</h3>
            {[
              { label: 'Fluency', score: summary.fluency_score },
              { label: 'Grammar', score: summary.grammar_score },
              { label: 'Vocabulary', score: summary.vocab_score },
            ].map(({ label, score }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className={`font-semibold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full transition-all duration-500 ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top 3 issues */}
          {summary.top_issues && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">3 things to work on</h3>
              <div className="space-y-3">
                {summary.top_issues.map((issue, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">{issue.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accent & fluency */}
          {accentAnalysis && (
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Accent & fluency</h3>
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
                    <div className={`h-2 rounded-full transition-all duration-500 ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
              {accentAnalysis.filler_word_count > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Filler words: <span className="text-amber-600">{accentAnalysis.filler_word_count} detected</span></p>
                  <div className="flex flex-wrap gap-1">
                    {accentAnalysis.filler_words_found.map((w) => (
                      <span key={w} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{w}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Recurring patterns</p>
                {accentAnalysis.weak_patterns.map((p, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs font-medium text-foreground">{p.pattern} <span className="text-muted-foreground font-normal">({p.frequency})</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Practice: &ldquo;{p.drill_phrase}&rdquo;</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">{accentAnalysis.improvement_tip}</p>
            </div>
          )}

          {/* Trend section */}
          {accentTrend && (
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Your progress trend</h3>
              <div className="flex gap-4">
                {[
                  { label: 'Connected speech', trend: accentTrend.connected_speech_trend },
                  { label: 'Rhythm', trend: accentTrend.rhythm_trend },
                ].map(({ label, trend }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`text-sm ${trend === 'improving' ? 'text-green-600' : trend === 'declining' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→'}
                    </span>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              {accentTrend.recurring_fillers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Recurring fillers: {accentTrend.recurring_fillers.join(', ')}
                </p>
              )}
              <p className="text-xs text-muted-foreground italic">{accentTrend.summary}</p>
            </div>
          )}

          {/* Vocab suggestions with Add to Vocab */}
          {summary.vocab_suggestions && summary.vocab_suggestions.length > 0 && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Add to your vocabulary</h3>
              <div className="space-y-3">
                {summary.vocab_suggestions.map((v) => (
                  <div key={v.phrase} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{v.phrase}</p>
                      <p className="text-xs text-muted-foreground">{v.meaning}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddVocab(v.phrase, v.meaning, v.example, v.category)}
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

          {/* Overall feedback */}
          {summary.overall_feedback && <p className="text-sm text-muted-foreground text-center">{summary.overall_feedback}</p>}

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <a href="/english/speak" className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted">
              New session
            </a>
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-xl bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              Practice again
            </button>
          </div>
        </div>
      )}

      {/* Phase: voice */}
      {appPhase === 'voice' && selectedScenario && (
        <VoiceMode
          mode={selectedScenario.mode}
          scenarioId={selectedScenario.id}
          scenarioContext={selectedScenario.context}
          scenarioTitle={selectedScenario.title}
          onBack={() => {
            setAppPhase('scenario-select');
            setSelectedScenario(null);
          }}
        />
      )}
    </div>
  );
}
