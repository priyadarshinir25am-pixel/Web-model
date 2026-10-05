import React, { useState } from 'react';
import { Activity, Habit, ProductivityGoal, ActivityCategory, UserPreferences } from '../types';
import { getPastDates, formatMinutesToHuman } from '../utils/storage';
import { 
  BarChart3, 
  PieChart, 
  Calendar, 
  TrendingUp, 
  Download, 
  Clock, 
  Zap, 
  Flame,
  CheckCircle2
} from 'lucide-react';

interface AnalyticsViewProps {
  activities: Activity[];
  habits: Habit[];
  goals: ProductivityGoal[];
  preferences: UserPreferences;
  onExportData: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  activities,
  habits,
  goals,
  preferences,
  onExportData,
}) => {
  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(7);
  const dateList = getPastDates(daysRange);

  // Filter activities within range
  const rangeActivities = activities.filter((a) => dateList.includes(a.date));

  // Category breakdown calculation
  const categoryTotals: Record<ActivityCategory, number> = {
    'Deep Work': 0,
    'Meetings': 0,
    'Learning': 0,
    'Fitness': 0,
    'Admin': 0,
    'Personal': 0,
  };

  rangeActivities.forEach((act) => {
    if (categoryTotals[act.category] !== undefined) {
      categoryTotals[act.category] += act.durationMinutes;
    }
  });

  const totalRangeMinutes = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Daily focus minutes map
  const dailyFocusMap: Record<string, number> = {};
  dateList.forEach((d) => {
    dailyFocusMap[d] = 0;
  });

  rangeActivities.forEach((act) => {
    if (act.status !== 'scheduled' && dailyFocusMap[act.date] !== undefined) {
      dailyFocusMap[act.date] += act.durationMinutes;
    }
  });

  // Time of day breakdown (Morning, Afternoon, Evening)
  let morningMins = 0; // 06:00 - 12:00
  let afternoonMins = 0; // 12:00 - 17:00
  let eveningMins = 0; // 17:00 - 24:00

  rangeActivities.forEach((act) => {
    const [h] = act.startTime.split(':').map(Number);
    if (h < 12) morningMins += act.durationMinutes;
    else if (h < 17) afternoonMins += act.durationMinutes;
    else eveningMins += act.durationMinutes;
  });

  const timeOfDayTotal = morningMins + afternoonMins + eveningMins || 1;

  // Averages & KPIs
  const dailyAverageMins = Math.round(totalRangeMinutes / daysRange);
  const targetDailyMins = preferences.dailyFocusTargetMinutes || 360;
  const highImpactMins = rangeActivities
    .filter((a) => a.impact === 'high' && a.status !== 'scheduled')
    .reduce((sum, a) => sum + a.durationMinutes, 0);
  const highImpactRatio = totalRangeMinutes > 0 ? Math.round((highImpactMins / totalRangeMinutes) * 100) : 0;

  // Habit adherence
  const totalHabitOpportunities = habits.length * daysRange;
  let totalHabitsCompletedInRange = 0;
  habits.forEach((h) => {
    h.completedDates.forEach((d) => {
      if (dateList.includes(d)) totalHabitsCompletedInRange++;
    });
  });
  const habitAdherencePercent = totalHabitOpportunities > 0 
    ? Math.round((totalHabitsCompletedInRange / totalHabitOpportunities) * 100)
    : 0;

  // Bar chart scaling
  const maxDayMinutes = Math.max(...Object.values(dailyFocusMap), targetDailyMins, 120);

  const categoryColorMap: Record<ActivityCategory, { bar: string; text: string }> = {
    'Deep Work': { bar: 'bg-indigo-600', text: 'text-indigo-700' },
    'Meetings': { bar: 'bg-amber-500', text: 'text-amber-700' },
    'Learning': { bar: 'bg-emerald-600', text: 'text-emerald-700' },
    'Fitness': { bar: 'bg-cyan-600', text: 'text-cyan-700' },
    'Admin': { bar: 'bg-slate-500', text: 'text-slate-700' },
    'Personal': { bar: 'bg-violet-600', text: 'text-violet-700' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Date range switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Productivity Metrics</span>
            <span aria-hidden="true">·</span>
            <span>Historical Trends</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Performance & Time Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDaysRange(7)}
              className={`px-3 py-1 rounded-md transition-colors ${
                daysRange === 7
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDaysRange(14)}
              className={`px-3 py-1 rounded-md transition-colors ${
                daysRange === 14
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setDaysRange(30)}
              className={`px-3 py-1 rounded-md transition-colors ${
                daysRange === 30
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={onExportData}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Export all data"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Tracked Time</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
            {formatMinutesToHuman(totalRangeMinutes)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Across {rangeActivities.length} logged sessions
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Daily Focus Average</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
            {formatMinutesToHuman(dailyAverageMins)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Target: {formatMinutesToHuman(targetDailyMins)}/day
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Deep Work Ratio</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
            {highImpactRatio}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatMinutesToHuman(highImpactMins)} high-focus time
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Habit Continuity Rate</span>
            <Flame className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
            {habitAdherencePercent}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {totalHabitsCompletedInRange} check-offs completed
          </p>
        </div>
      </div>

      {/* Daily Focus Trend Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              Daily Focus Hours Trend
            </h3>
            <p className="text-xs text-slate-500">
              Logged time vs your {formatMinutesToHuman(targetDailyMins)} daily objective
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
              <span>Logged Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 border-t-2 border-dashed border-slate-400" />
              <span>Target Line</span>
            </div>
          </div>
        </div>

        {/* Column Chart Container */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end gap-2 sm:gap-3 w-full border-b border-slate-200 pb-1 relative">
            {/* Target line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-slate-300 z-0 pointer-events-none"
              style={{
                bottom: `${(targetDailyMins / maxDayMinutes) * 100}%`,
              }}
            >
              <span className="absolute -top-4 right-0 text-[10px] font-mono text-slate-400">
                Target ({formatMinutesToHuman(targetDailyMins)})
              </span>
            </div>

            {dateList.map((dStr) => {
              const mins = dailyFocusMap[dStr] || 0;
              const heightPercent = Math.max(3, (mins / maxDayMinutes) * 100);
              const dateObj = new Date(dStr + 'T00:00:00');
              const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
              const dayNum = dateObj.getDate();
              const isMet = mins >= targetDailyMins;

              return (
                <div
                  key={dStr}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative z-10"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                    {dStr}: {formatMinutesToHuman(mins)}
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isMet ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400/80 hover:bg-indigo-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-mono block text-slate-500 group-hover:text-slate-900">
                      {dayLabel} {dayNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Allocation & Time-of-Day Distribution (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Allocation Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              Time Distribution by Category
            </h3>
            <p className="text-xs text-slate-500">
              Proportion of logged activities across domain categories
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(categoryTotals) as ActivityCategory[]).map((cat) => {
              const mins = categoryTotals[cat];
              const pct = totalRangeMinutes > 0 ? Math.round((mins / totalRangeMinutes) * 100) : 0;
              const color = categoryColorMap[cat];

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${color.text}`}>{cat}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {formatMinutesToHuman(mins)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${color.bar} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time of Day Focus Spectrum */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              Peak Chronotype & Focus Distribution
            </h3>
            <p className="text-xs text-slate-500">
              When during the day you invest the highest volume of focus hours
            </p>
          </div>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Morning Session (06:00 – 12:00)</span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {formatMinutesToHuman(morningMins)} ({Math.round((morningMins / timeOfDayTotal) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${(morningMins / timeOfDayTotal) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Afternoon Session (12:00 – 17:00)</span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {formatMinutesToHuman(afternoonMins)} ({Math.round((afternoonMins / timeOfDayTotal) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(afternoonMins / timeOfDayTotal) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Evening Session (17:00 – 23:00)</span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {formatMinutesToHuman(eveningMins)} ({Math.round((eveningMins / timeOfDayTotal) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-cyan-600 transition-all duration-500"
                  style={{ width: `${(eveningMins / timeOfDayTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Insight:</span> Most of your deep work occurs during the{' '}
            {morningMins >= afternoonMins && morningMins >= eveningMins
              ? 'morning block (06:00 - 12:00)'
              : afternoonMins >= eveningMins
              ? 'afternoon block (12:00 - 17:00)'
              : 'evening block (17:00 - 23:00)'}
            . Keep this block free of syncs and administrative churn.
          </div>
        </div>
      </div>
    </div>
  );
};
