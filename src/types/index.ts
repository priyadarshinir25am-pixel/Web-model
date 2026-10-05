export type ActivityCategory = 
  | 'Deep Work'
  | 'Meetings'
  | 'Learning'
  | 'Fitness'
  | 'Personal'
  | 'Admin';

export type ActivityImpact = 'high' | 'medium' | 'low';
export type ActivityStatus = 'completed' | 'in_progress' | 'scheduled';

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  impact: ActivityImpact;
  status: ActivityStatus;
  notes?: string;
  tags?: string[];
}

export type GoalCadence = 'daily' | 'weekly' | 'monthly';
export type GoalUnit = 'hours' | 'sessions' | 'tasks' | 'days' | 'pages';
export type GoalStatus = 'on_track' | 'ahead' | 'at_risk' | 'completed';

export interface ProductivityGoal {
  id: string;
  title: string;
  description?: string;
  category: ActivityCategory | 'General';
  cadence: GoalCadence;
  current: number;
  target: number;
  unit: GoalUnit;
  startDate: string;
  endDate: string;
  status: GoalStatus;
}

export interface Habit {
  id: string;
  title: string;
  category: ActivityCategory;
  streak: number;
  bestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  targetDaysPerWeek: number;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  topPriorities: { id: string; text: string; done: boolean }[];
  quickNotes: string;
  focusRating: number; // 1-5
}

export interface UserPreferences {
  name: string;
  role: string;
  avatarUrl: string;
  dailyFocusTargetMinutes: number; // e.g., 360 (6 hours)
  dailyTasksTarget: number; // e.g. 5
  workStartHour: number; // e.g. 8 (8:00 AM)
  workEndHour: number; // e.g. 19 (7:00 PM)
}

export type ActiveTab = 'dashboard' | 'timeline' | 'goals' | 'analytics';
