import React, { useState } from 'react';
import { 
  Activity, 
  ProductivityGoal, 
  Habit, 
  DayPlan, 
  UserPreferences,
  ActivityCategory 
} from '../types';
import { 
  formatMinutesToHuman, 
  getTodayDateString 
} from '../utils/storage';
import { playSuccessChime } from '../utils/audio';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flame, 
  TrendingUp, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Play, 
  Check, 
  Sparkles,
  ArrowRight,
  MoreVertical,
  Pencil
} from 'lucide-react';

interface DashboardViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activities: Activity[];
  goals: ProductivityGoal[];
  habits: Habit[];
  dayPlan: DayPlan;
  preferences: UserPreferences;
  onOpenNewActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onToggleActivityStatus: (id: string) => void;
  onToggleHabit: (habitId: string) => void;
  onUpdateDayPlan: (plan: DayPlan) => void;
  onIncrementGoal: (goalId: string, amount: number) => void;
  onStartTimer: (minutes: number, title?: string, cat?: ActivityCategory) => void;
  onNavigateToTab: (tab: 'timeline' | 'goals' | 'analytics') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedDate,
  setSelectedDate,
  activities,
  goals,
  habits,
  dayPlan,
  preferences,
  onOpenNewActivity,
  onEditActivity,
  onToggleActivityStatus,
  onToggleHabit,
  onUpdateDayPlan,
  onIncrementGoal,
  onStartTimer,
  onNavigateToTab,
}) => {
  const [newPriorityText, setNewPriorityText] = useState('');
  const [notesDraft, setNotesDraft] = useState(dayPlan.quickNotes);

  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Filter activities for selected date
  const dayActivities = activities.filter((a) => a.date === selectedDate);
  const sortedActivities = [...dayActivities].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Calculations
  const totalLoggedMinutes = dayActivities
    .filter((a) => a.status === 'completed' || a.status === 'in_progress')
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  const highImpactMinutes = dayActivities
    .filter((a) => a.impact === 'high' && a.status !== 'scheduled')
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  const targetMinutes = preferences.dailyFocusTargetMinutes || 360;
  const focusPercent = Math.min(100, Math.round((totalLoggedMinutes / targetMinutes) * 100));

  const totalActivitiesCount = dayActivities.length;
  const completedActivitiesCount = dayActivities.filter((a) => a.status === 'completed').length;
  const completionRate = totalActivitiesCount > 0 
    ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) 
    : 0;

  const habitsCompletedToday = habits.filter((h) => h.completedDates.includes(selectedDate)).length;
  const habitsTotal = habits.length;

  const highImpactPercent = totalLoggedMinutes > 0 
    ? Math.round((highImpactMinutes / totalLoggedMinutes) * 100) 
    : 0;

  // Date shifting
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const formattedDateHeadline = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Priorities handling
  const handleTogglePriority = (id: string) => {
    playSuccessChime();
    const updated = dayPlan.topPriorities.map((p) => 
      p.id === id ? { ...p, done: !p.done } : p
    );
    onUpdateDayPlan({ ...dayPlan, topPriorities: updated });
  };

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityText.trim()) return;
    const newItem = {
      id: `p-${Date.now()}`,
      text: newPriorityText.trim(),
      done: false,
    };
    onUpdateDayPlan({
      ...dayPlan,
      topPriorities: [...dayPlan.topPriorities, newItem],
    });
    setNewPriorityText('');
  };

  const handleDeletePriority = (id: string) => {
    const updated = dayPlan.topPriorities.filter((p) => p.id !== id);
    onUpdateDayPlan({ ...dayPlan, topPriorities: updated });
  };

  const handleBlurNotes = () => {
    if (notesDraft !== dayPlan.quickNotes) {
      onUpdateDayPlan({ ...dayPlan, quickNotes: notesDraft });
    }
  };

  // Category color accents
  const getCategoryTheme = (cat: ActivityCategory) => {
    switch (cat) {
      case 'Deep Work':
        return { border: 'border-l-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50' };
      case 'Meetings':
        return { border: 'border-l-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
      case 'Learning':
        return { border: 'border-l-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50' };
      case 'Fitness':
        return { border: 'border-l-cyan-600', text: 'text-cyan-700', bg: 'bg-cyan-50' };
      case 'Admin':
        return { border: 'border-l-slate-500', text: 'text-slate-700', bg: 'bg-slate-100' };
      default:
        return { border: 'border-l-violet-600', text: 'text-violet-700', bg: 'bg-violet-50' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Date Header & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Productivity Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>{isToday ? 'Today' : 'Historical View'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {formattedDateHeadline}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isToday 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards (60-30-10 palette, tabular-nums, zero-pill discipline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Focus Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Focus Time Logged</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatMinutesToHuman(totalLoggedMinutes)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Target: {formatMinutesToHuman(targetMinutes)}</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">
                {focusPercent}%
              </span>
            </div>
            {/* Visual hairline progress */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${focusPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Activities Completed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Activity Completion</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {completedActivitiesCount}
              <span className="text-sm font-normal text-slate-500 ml-1.5">
                / {totalActivitiesCount} logged
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Completion rate</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">
                {completionRate}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Daily Habits Streak */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Habit Rituals</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {habitsCompletedToday}
              <span className="text-sm font-normal text-slate-500 ml-1.5">
                / {habitsTotal} checked
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Active habit streak</span>
              <span className="font-mono tabular-nums font-semibold text-amber-600">
                {Math.max(...habits.map((h) => h.streak), 0)} days
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${habitsTotal > 0 ? (habitsCompletedToday / habitsTotal) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: High-Impact Focus Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>High-Impact Depth</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {highImpactPercent}%
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Deep focus hours</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">
                {formatMinutesToHuman(highImpactMinutes)}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${highImpactPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Timer Launch Banner */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-200 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Deep Work Sessions</span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Ready to enter flow state?
          </h2>
          <p className="text-xs text-slate-300 max-w-lg">
            Launch a 25-minute Pomodoro or 50-minute deep sprint. Time logged will automatically synchronize with your daily schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onStartTimer(25, 'Deep Work Focus Block', 'Deep Work')}
            className="px-4 py-2 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>25m Focus Sprint</span>
          </button>
          <button
            onClick={() => onStartTimer(50, 'Deep Architecture & Coding', 'Deep Work')}
            className="px-4 py-2 text-xs font-semibold bg-indigo-800 hover:bg-indigo-700 text-white rounded-lg transition-colors border border-indigo-700/60 whitespace-nowrap"
          >
            <span>50m Deep Block</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule & Priorities (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day Activities / Schedule Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">
                  Day Schedule & Logged Activities
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dayActivities.length} activities scheduled for this date
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('timeline')}
                  className="text-xs text-slate-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1"
                >
                  <span>Full Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenNewActivity}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              </div>
            </div>

            {/* List */}
            {sortedActivities.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-slate-800">No activities logged for this day</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Start tracking your time blocks, meetings, or deep work sessions to see your daily breakdown.
                </p>
                <button
                  onClick={onOpenNewActivity}
                  className="mt-3.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log First Activity</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedActivities.map((activity) => {
                  const theme = getCategoryTheme(activity.category);
                  const isDone = activity.status === 'completed';

                  return (
                    <div
                      key={activity.id}
                      className={`p-3.5 rounded-lg border border-slate-200/80 border-l-4 ${theme.border} bg-white hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 group`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox toggle */}
                        <button
                          onClick={() => onToggleActivityStatus(activity.id)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0 focus:outline-none"
                          title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-medium truncate ${
                                isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                              }`}
                            >
                              {activity.title}
                            </h4>
                          </div>

                          {/* Unboxed metadata separated by dot (Zero-Pill discipline) */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className={`font-medium ${theme.text}`}>
                              {activity.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {activity.startTime} - {activity.endTime}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {activity.durationMinutes}m
                            </span>
                            {activity.impact === 'high' && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-indigo-600 font-medium">High Impact</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onEditActivity(activity)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-70 group-hover:opacity-100"
                          title="Edit Activity"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Priorities Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Top Daily Priorities</h3>
                <p className="text-xs text-slate-500">
                  Focus on 3 high-leverage outcomes that make today a victory
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
                {dayPlan.topPriorities.filter((p) => p.done).length} / {dayPlan.topPriorities.length} done
              </span>
            </div>

            <div className="space-y-2">
              {dayPlan.topPriorities.map((priority) => (
                <div
                  key={priority.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 group hover:border-slate-300 transition-colors"
                >
                  <button
                    onClick={() => handleTogglePriority(priority.id)}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        priority.done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {priority.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-sm ${
                        priority.done ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'
                      }`}
                    >
                      {priority.text}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeletePriority(priority.id)}
                    className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <span className="text-xs font-mono">×</span>
                  </button>
                </div>
              ))}

              {/* Add priority input */}
              <form onSubmit={handleAddPriority} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newPriorityText}
                  onChange={(e) => setNewPriorityText(e.target.value)}
                  placeholder="Add a key priority for today..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
                <button
                  type="submit"
                  disabled={!newPriorityText.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 disabled:opacity-40 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Habits & Goals & Notes */}
        <div className="space-y-6">
          {/* Daily Habit Checklist */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Daily Rituals & Habits</h3>
                <p className="text-xs text-slate-500">Tap to check off today's habits</p>
              </div>
              <button
                onClick={() => onNavigateToTab('goals')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {habits.map((habit) => {
                const isCompletedToday = habit.completedDates.includes(selectedDate);

                return (
                  <button
                    key={habit.id}
                    onClick={() => onToggleHabit(habit.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isCompletedToday
                        ? 'bg-amber-50/50 border-amber-200/80 text-slate-900'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isCompletedToday
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                      >
                        {isCompletedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className={`text-xs font-medium block truncate ${isCompletedToday ? 'text-slate-900 font-semibold' : ''}`}>
                          {habit.title}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {habit.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-xs font-mono tabular-nums text-amber-600 font-semibold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{habit.streak}d</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Goals Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Key Goals</h3>
                <p className="text-xs text-slate-500">Weekly & monthly progress</p>
              </div>
              <button
                onClick={() => onNavigateToTab('goals')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {goals.slice(0, 3).map((goal) => {
                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));

                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate mr-2">
                        {goal.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onIncrementGoal(goal.id, goal.unit === 'hours' ? 0.5 : 1)}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Add progress"
                        >
                          +{goal.unit === 'hours' ? '0.5' : '1'}
                        </button>
                        <span className="font-mono tabular-nums font-semibold text-slate-700">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          percent >= 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Scratchpad / Day Reflection */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-1">
              Daily Notes & Flow State Log
            </h3>
            <p className="text-xs text-slate-500 mb-2.5">
              Quick scratchpad for thoughts, breakthroughs, and reflections
            </p>
            <textarea
              rows={3}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={handleBlurNotes}
              placeholder="Record ideas or evening reflection notes..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
