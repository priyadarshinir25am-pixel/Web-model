import { Activity, ProductivityGoal, Habit, DayPlan, UserPreferences } from '../types';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMinutesToHuman(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function calculateDurationFromTimes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const diff = endMins - startMins;
  return diff > 0 ? diff : 0;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutesToAdd;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Alex Rivera',
  role: 'Product Engineer',
  avatarUrl: '/src/assets/images/avatar_productivity_user_1791180903155.jpg',
  dailyFocusTargetMinutes: 360, // 6 hours
  dailyTasksTarget: 6,
  workStartHour: 8,
  workEndHour: 19,
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Morning Deep Work Block (90m)',
    category: 'Deep Work',
    streak: 9,
    bestStreak: 14,
    completedDates: getPastDates(10).slice(0, 9),
    targetDaysPerWeek: 5,
  },
  {
    id: 'habit-2',
    title: 'Daily Code Review & PR Triage',
    category: 'Admin',
    streak: 12,
    bestStreak: 21,
    completedDates: getPastDates(14),
    targetDaysPerWeek: 5,
  },
  {
    id: 'habit-3',
    title: 'Physical Activity & Mobility',
    category: 'Fitness',
    streak: 4,
    bestStreak: 8,
    completedDates: getPastDates(6).slice(1),
    targetDaysPerWeek: 5,
  },
  {
    id: 'habit-4',
    title: 'Technical Reading & Papers (30m)',
    category: 'Learning',
    streak: 6,
    bestStreak: 15,
    completedDates: getPastDates(7).slice(0, 6),
    targetDaysPerWeek: 4,
  },
  {
    id: 'habit-5',
    title: 'Zero Inbox & Next-Day Planning',
    category: 'Personal',
    streak: 11,
    bestStreak: 18,
    completedDates: getPastDates(12),
    targetDaysPerWeek: 5,
  },
];

export const INITIAL_GOALS: ProductivityGoal[] = [
  {
    id: 'goal-1',
    title: 'Deep Work Weekly Target',
    description: 'Protect high-leverage focus sessions without Slack interruptions',
    category: 'Deep Work',
    cadence: 'weekly',
    current: 21.5,
    target: 28,
    unit: 'hours',
    startDate: getPastDates(4)[0],
    endDate: getPastDates(4)[3],
    status: 'on_track',
  },
  {
    id: 'goal-2',
    title: 'Distributed Systems & Database Mastery',
    description: 'Work through database isolation levels and replication protocols',
    category: 'Learning',
    cadence: 'monthly',
    current: 8,
    target: 12,
    unit: 'sessions',
    startDate: getPastDates(14)[0],
    endDate: getPastDates(14)[13],
    status: 'ahead',
  },
  {
    id: 'goal-3',
    title: 'Endurance & Strength Training',
    description: 'Weekly cardio and weight training regime',
    category: 'Fitness',
    cadence: 'weekly',
    current: 3,
    target: 4,
    unit: 'sessions',
    startDate: getPastDates(4)[0],
    endDate: getPastDates(4)[3],
    status: 'on_track',
  },
  {
    id: 'goal-4',
    title: 'Architecture RFC Documentation',
    description: 'Finalize real-time streaming pipeline RFC and team sign-offs',
    category: 'Deep Work',
    cadence: 'weekly',
    current: 5,
    target: 6,
    unit: 'tasks',
    startDate: getPastDates(6)[0],
    endDate: getPastDates(6)[5],
    status: 'on_track',
  },
];

export function getInitialActivities(): Activity[] {
  const today = getTodayDateString();
  const past = getPastDates(3);
  const yesterday = past[1];

  return [
    // Today's activities
    {
      id: 'act-1',
      title: 'Architecture Review: Cache Invalidation Strategy',
      category: 'Deep Work',
      date: today,
      startTime: '08:30',
      endTime: '10:00',
      durationMinutes: 90,
      impact: 'high',
      status: 'completed',
      notes: 'Reviewed distributed redis cluster failover semantics with infra team.',
      tags: ['architecture', 'deep-work'],
    },
    {
      id: 'act-2',
      title: 'Engineering Sync & Sprint Progress',
      category: 'Meetings',
      date: today,
      startTime: '10:15',
      endTime: '11:00',
      durationMinutes: 45,
      impact: 'medium',
      status: 'completed',
      notes: 'Unblocked frontend state machine refactor; scheduled QA review.',
      tags: ['sync', 'team'],
    },
    {
      id: 'act-3',
      title: 'Refactor Core Query Pipeline & Benchmarks',
      category: 'Deep Work',
      date: today,
      startTime: '11:15',
      endTime: '13:00',
      durationMinutes: 105,
      impact: 'high',
      status: 'completed',
      notes: 'Cut memory allocations by 28% in hot serialization loops.',
      tags: ['optimization', 'performance'],
    },
    {
      id: 'act-4',
      title: 'Lunch & 30-min Outdoor Walk',
      category: 'Fitness',
      date: today,
      startTime: '13:00',
      endTime: '13:45',
      durationMinutes: 45,
      impact: 'low',
      status: 'completed',
      notes: 'Unwind and recharge away from screens.',
      tags: ['wellness', 'recovery'],
    },
    {
      id: 'act-5',
      title: 'Customer Feedback Analysis & PR Reviews',
      category: 'Admin',
      date: today,
      startTime: '14:00',
      endTime: '15:15',
      durationMinutes: 75,
      impact: 'medium',
      status: 'completed',
      notes: 'Merged 3 community PRs and replied to 4 GitHub issue threads.',
      tags: ['reviews', 'admin'],
    },
    {
      id: 'act-6',
      title: 'Feature Implementation: Batch Data Export',
      category: 'Deep Work',
      date: today,
      startTime: '15:30',
      endTime: '17:30',
      durationMinutes: 120,
      impact: 'high',
      status: 'in_progress',
      notes: 'Wiring streaming JSON/CSV transformer with backpressure handling.',
      tags: ['feature', 'coding'],
    },
    {
      id: 'act-7',
      title: 'Technical Chapter Reading: Raft Consensus',
      category: 'Learning',
      date: today,
      startTime: '18:00',
      endTime: '18:45',
      durationMinutes: 45,
      impact: 'medium',
      status: 'scheduled',
      notes: 'Paper study on log compaction and snapshotting algorithms.',
      tags: ['study', 'raft'],
    },

    // Yesterday's activities for trend analysis
    {
      id: 'act-prev-1',
      title: 'Database Schema Migration Spec',
      category: 'Deep Work',
      date: yesterday,
      startTime: '09:00',
      endTime: '11:30',
      durationMinutes: 150,
      impact: 'high',
      status: 'completed',
      notes: 'Drafted zero-downtime column migration checklist.',
      tags: ['postgres', 'ddl'],
    },
    {
      id: 'act-prev-2',
      title: 'Product Roadmap Alignment',
      category: 'Meetings',
      date: yesterday,
      startTime: '11:30',
      endTime: '12:30',
      durationMinutes: 60,
      impact: 'medium',
      status: 'completed',
      notes: 'Quarterly review with PM and design lead.',
    },
    {
      id: 'act-prev-3',
      title: 'Mobility & Strength Gym Session',
      category: 'Fitness',
      date: yesterday,
      startTime: '16:30',
      endTime: '17:30',
      durationMinutes: 60,
      impact: 'medium',
      status: 'completed',
      notes: 'Squats, pullups, core conditioning.',
    },
  ];
}

export function getInitialDayPlan(date = getTodayDateString()): DayPlan {
  return {
    date,
    topPriorities: [
      { id: 'p-1', text: 'Ship batch data export streaming engine', done: false },
      { id: 'p-2', text: 'Complete architecture review with infra lead', done: true },
      { id: 'p-3', text: 'Review & merge open team pull requests', done: true },
    ],
    quickNotes: 'Key milestone: Keep deep work uninterrupted between 3:30 PM - 5:30 PM. Focus on pipeline memory profiling.',
    focusRating: 4,
  };
}

// Storage Manager
const STORAGE_KEYS = {
  ACTIVITIES: 'tempo_activities_v1',
  GOALS: 'tempo_goals_v1',
  HABITS: 'tempo_habits_v1',
  PREFERENCES: 'tempo_preferences_v1',
  DAY_PLANS: 'tempo_day_plans_v1',
};

export const Storage = {
  getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : getInitialActivities();
    } catch {
      return getInitialActivities();
    }
  },

  saveActivities(activities: Activity[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities:', e);
    }
  },

  getGoals(): ProductivityGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? JSON.parse(data) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  },

  saveGoals(goals: ProductivityGoal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals:', e);
    }
  },

  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : INITIAL_HABITS;
    } catch {
      return INITIAL_HABITS;
    }
  },

  saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits:', e);
    }
  },

  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }
  },

  getDayPlan(date: string): DayPlan {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAY_PLANS);
      const plans: Record<string, DayPlan> = data ? JSON.parse(data) : {};
      return plans[date] || getInitialDayPlan(date);
    } catch {
      return getInitialDayPlan(date);
    }
  },

  saveDayPlan(plan: DayPlan): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAY_PLANS);
      const plans: Record<string, DayPlan> = data ? JSON.parse(data) : {};
      plans[plan.date] = plan;
      localStorage.setItem(STORAGE_KEYS.DAY_PLANS, JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to save day plan:', e);
    }
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.DAY_PLANS);
  },

  exportFullBackup(): string {
    const backup = {
      activities: this.getActivities(),
      goals: this.getGoals(),
      habits: this.getHabits(),
      preferences: this.getPreferences(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.activities)) {
        this.saveActivities(parsed.activities);
      }
      if (Array.isArray(parsed.goals)) {
        this.saveGoals(parsed.goals);
      }
      if (Array.isArray(parsed.habits)) {
        this.saveHabits(parsed.habits);
      }
      if (parsed.preferences) {
        this.savePreferences(parsed.preferences);
      }
      return true;
    } catch {
      return false;
    }
  }
};
