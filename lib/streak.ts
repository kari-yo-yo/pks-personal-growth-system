import { getAllSummaries } from './db';
import { getAllInsights } from './insights';
import { getAllNodes, getAllNotes } from './db';

export interface DayActivity {
  date: string;
  count: number;
  hasSummary: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  weeklyActivity: DayActivity[];
}

function getDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function getStreakInfo(): StreakInfo {
  // Collect all activity dates
  const activityCounts = new Map<string, number>();
  const summaryDates = new Set<string>();

  for (const s of getAllSummaries()) {
    const d = s.date;
    activityCounts.set(d, (activityCounts.get(d) || 0) + 1);
    summaryDates.add(d);
  }
  for (const i of getAllInsights()) {
    const d = getDateStr(new Date(i.createdAt));
    activityCounts.set(d, (activityCounts.get(d) || 0) + 1);
  }
  for (const n of getAllNodes()) {
    const d = getDateStr(new Date(n.createdAt));
    activityCounts.set(d, (activityCounts.get(d) || 0) + 1);
  }
  for (const n of getAllNotes()) {
    const d = getDateStr(new Date(n.createdAt));
    activityCounts.set(d, (activityCounts.get(d) || 0) + 1);
  }

  const dates = Array.from(activityCounts.keys()).sort();
  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
      weeklyActivity: [],
    };
  }

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = getDateStr(new Date());
  const yesterday = getDateStr(new Date(Date.now() - 86400000));

  // Check if streak is active (today or yesterday has activity)
  const lastDate = dates[dates.length - 1];
  const streakActive = lastDate === today || lastDate === yesterday;

  // Calculate current streak
  if (streakActive) {
    const checkDate = lastDate === today ? new Date() : new Date(Date.now() - 86400000);
    const dateSet = new Set(dates);
    while (true) {
      const d = getDateStr(checkDate);
      if (dateSet.has(d)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Weekly activity (last 7 days)
  const weeklyActivity: DayActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getDateStr(d);
    weeklyActivity.push({
      date: dateStr,
      count: activityCounts.get(dateStr) || 0,
      hasSummary: summaryDates.has(dateStr),
    });
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: dates.length,
    lastActiveDate: lastDate,
    weeklyActivity,
  };
}

export function getContributionGrid(weeks = 20): { date: string; level: number }[][] {
  const activityCounts = new Map<string, number>();

  for (const s of getAllSummaries()) {
    activityCounts.set(s.date, (activityCounts.get(s.date) || 0) + 1);
  }
  for (const i of getAllInsights()) {
    const d = getDateStr(new Date(i.createdAt));
    activityCounts.set(d, (activityCounts.get(d) || 0) + 1);
  }
  for (const n of getAllNodes()) {
    const d = getDateStr(new Date(n.createdAt));
    activityCounts.set(d, (activityCounts.get(d) || 0) + 1);
  }
  for (const n of getAllNotes()) {
    const d = getDateStr(new Date(n.createdAt));
    activityCounts.set(d, (activityCounts.get(d) || 0) + 1);
  }

  const grid: { date: string; level: number }[][] = [];
  const today = new Date();
  const maxCount = Math.max(...Array.from(activityCounts.values()), 1);

  for (let w = weeks - 1; w >= 0; w--) {
    const week: { date: string; level: number }[] = [];
    for (let day = 6; day >= 0; day--) {
      const d = new Date(today);
      d.setDate(d.getDate() - (w * 7 + day));
      const dateStr = getDateStr(d);
      const count = activityCounts.get(dateStr) || 0;
      let level = 0;
      if (count > 0) level = Math.min(Math.ceil((count / maxCount) * 4), 4);
      week.push({ date: dateStr, level });
    }
    grid.push(week);
  }

  return grid;
}
