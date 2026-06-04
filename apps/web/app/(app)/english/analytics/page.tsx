import { requireAuth } from '~/lib/auth/session';
import {
  getEnglishStats,
  getVocabProgress,
  getVocabGrowthTrend,
  getSpeakingTrend,
  getWeeklyActivity,
  getWeakVocab,
  getWeeklySpeakingMinutes,
} from '@repo/db/queries/english-stats';
import { AnalyticsDashboard } from './analytics-dashboard';

export default async function EnglishAnalyticsPage() {
  const user = await requireAuth();

  const [stats, vocabProgress, vocabGrowthTrend, speakingTrend, weeklyActivity, weakVocab, weeklySpeakingMinutes] =
    await Promise.all([
      getEnglishStats(user.id),
      getVocabProgress(user.id),
      getVocabGrowthTrend(user.id, 30),
      getSpeakingTrend(user.id, 30),
      getWeeklyActivity(user.id),
      getWeakVocab(user.id, 10),
      getWeeklySpeakingMinutes(user.id),
    ]);

  return (
    <AnalyticsDashboard
      stats={stats}
      vocabProgress={vocabProgress}
      vocabGrowthTrend={vocabGrowthTrend}
      speakingTrend={speakingTrend}
      weeklyActivity={weeklyActivity}
      weakVocab={weakVocab}
      weeklySpeakingMinutes={weeklySpeakingMinutes}
    />
  );
}
