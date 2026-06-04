'use client';

import Link from 'next/link';
import { useMemo } from 'react';

type EnglishStats = {
  wordsLearned: number;
  wordsDue: number;
  currentStreak: number;
  longestStreak: number;
  totalSpeakingSeconds: number;
  shadowingSessionsDone: number;
  speakingSessionsDone: number;
  lastActivityAt: Date | null;
};

type VocabProgress = {
  total: number;
  solidlyLearned: number;
  due: number;
  byCategory: Record<string, { total: number; learned: number }>;
};

type WeakVocabItem = {
  userVocabId: string;
  phrase: string;
  meaning: string;
  category: string;
  reps: number;
  state: string;
  stability: number;
  nextReviewAt: Date;
};

type Props = {
  stats: EnglishStats;
  vocabProgress: VocabProgress;
  vocabGrowthTrend: Array<{ date: string; newCount: number }>;
  speakingTrend: Array<{ date: string; avgScore: number }>;
  weeklyActivity: Array<{ date: string; count: number }>;
  weakVocab: WeakVocabItem[];
  weeklySpeakingMinutes: number;
};

export function AnalyticsDashboard({
  stats,
  vocabProgress,
  vocabGrowthTrend,
  speakingTrend,
  weeklyActivity,
  weakVocab,
  weeklySpeakingMinutes,
}: Props) {
  const vocabularyCumulativeData = useMemo(() => {
    const cumulative = vocabGrowthTrend.reduce<number[]>((acc, d, i) => {
      acc.push((acc[i - 1] ?? 0) + d.newCount);
      return acc;
    }, []);
    const totalAdded = cumulative[cumulative.length - 1] ?? 0;
    const maxCumulative = Math.max(totalAdded, 1);
    return { cumulative, maxCumulative, totalAdded };
  }, [vocabGrowthTrend]);

  const hasAnySpeakingData = speakingTrend.some((d) => d.avgScore > 0);

  const categoryKeys = Object.keys(vocabProgress.byCategory).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">English Progress</h1>

      {/* Section 1: Hero Metric */}
      <div className="text-center rounded-lg border bg-card p-8">
        <div className="text-5xl font-bold text-green-600">{stats.wordsLearned}</div>
        <div className="text-lg text-muted-foreground mt-2">words solidly learned</div>
        <div className="text-sm text-muted-foreground mt-1">
          {vocabProgress.total} total in vault · {vocabProgress.due} due today
        </div>
      </div>

      {/* Section 2: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Vocab Vault */}
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vocab Vault</div>
          <div className="text-2xl font-bold mt-2">{vocabProgress.total}</div>
          <div className="text-xs text-muted-foreground mt-1">{vocabProgress.solidlyLearned} mastered</div>
        </div>

        {/* Streak */}
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Streak</div>
          <div className="text-2xl font-bold mt-2">
            {stats.currentStreak > 0 ? '🔥 ' : ''}{stats.currentStreak} days
          </div>
          <div className="text-xs text-muted-foreground mt-1">Longest: {stats.longestStreak}</div>
        </div>

        {/* Speaking (week) */}
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Speaking (week)</div>
          <div className="text-2xl font-bold mt-2">{weeklySpeakingMinutes} min</div>
          <div className="text-xs text-muted-foreground mt-1">{stats.speakingSessionsDone} sessions total</div>
        </div>

        {/* Sessions done */}
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sessions done</div>
          <div className="text-2xl font-bold mt-2">{stats.shadowingSessionsDone + stats.speakingSessionsDone}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.shadowingSessionsDone} shadow · {stats.speakingSessionsDone} speak
          </div>
        </div>
      </div>

      {/* Section 3: Vocabulary by Category */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Vocabulary by category</h2>
        {categoryKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add vocabulary to see category breakdown</p>
        ) : (
          <div className="space-y-4">
            {categoryKeys.map((category) => {
              const { total, learned } = vocabProgress.byCategory[category]!;
              const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">
                      {learned}/{total}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4: Vocabulary Growth Trend */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Vocabulary growth (last 30 days)</h2>
        {vocabularyCumulativeData.totalAdded === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Start adding vocabulary to see your growth trend.</p>
        ) : (
          <div className="relative">
            <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="w-full h-20">
              <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={vocabularyCumulativeData.cumulative
                  .map((val, i) => {
                    const x =
                      vocabularyCumulativeData.cumulative.length > 1
                        ? (i / (vocabularyCumulativeData.cumulative.length - 1)) * 300
                        : 150;
                    const y = 70 - (val / vocabularyCumulativeData.maxCumulative) * 60;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{vocabGrowthTrend[0]?.date ?? ''}</span>
              <span>{vocabGrowthTrend[vocabGrowthTrend.length - 1]?.date ?? ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Speaking Fluency Trend */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Speaking fluency (last 30 days)</h2>
        {!hasAnySpeakingData ? (
          <p className="text-sm text-muted-foreground py-4">Complete speaking sessions to see your fluency trend.</p>
        ) : (
          <div className="relative">
            <div className="absolute right-0 top-0 text-xs text-muted-foreground">100</div>
            <div className="absolute right-0 bottom-6 text-xs text-muted-foreground">0</div>
            <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="w-full h-20">
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={speakingTrend
                  .map((d, i) => {
                    const x = speakingTrend.length > 1 ? (i / (speakingTrend.length - 1)) * 300 : 150;
                    const y = 70 - (d.avgScore / 100) * 60;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{speakingTrend[0]?.date ?? ''}</span>
              <span>{speakingTrend[speakingTrend.length - 1]?.date ?? ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Weekly Activity Heatmap */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Activity this week</h2>
        <div className="flex gap-3 flex-wrap">
          {weeklyActivity.map(({ date, count }) => {
            const intensity =
              count === 0
                ? 'bg-muted'
                : count < 3
                  ? 'bg-green-200 dark:bg-green-900'
                  : count < 8
                    ? 'bg-green-400 dark:bg-green-600'
                    : 'bg-green-600 dark:bg-green-400';
            const dayLabel = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
              weekday: 'short',
              timeZone: 'UTC',
            });
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-md ${intensity} transition-colors`}
                  title={`${count} ${count === 1 ? 'activity' : 'activities'} on ${date}`}
                />
                <span className="text-xs text-muted-foreground">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 7: Weak Vocabulary List */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Words to review</h2>
        <p className="text-sm text-muted-foreground mt-1">Items with lowest retention — prioritize these in your next review session</p>

        {weakVocab.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">All your vocabulary is in great shape! Check back after more reviews.</p>
        ) : (
          <div className="mt-4 divide-y">
            {weakVocab.map((item) => (
              <div key={item.userVocabId} className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.phrase}</span>
                    <span className="text-xs bg-muted rounded px-1.5 py-0.5 shrink-0">{item.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.meaning}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min((item.stability / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.reps} reviews</span>
                  </div>
                </div>
                <Link
                  href="/english/vocab/review"
                  className="ml-4 text-xs font-medium text-primary hover:underline shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
