import React, { useState, useEffect, useRef } from 'react';
import { 
  ActiveTab, 
  Activity, 
  ProductivityGoal, 
  Habit, 
  DayPlan, 
  UserPreferences,
  ActivityCategory 
} from './types';
import { 
  Storage, 
  getTodayDateString, 
  addMinutesToTime 
} from './utils/storage';
import { 
  playSuccessChime, 
  playTimerCompleteChime 
} from './utils/audio';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { TimelineView } from './components/TimelineView';
import { GoalsView } from './components/GoalsView';
import { AnalyticsView } from './components/AnalyticsView';
import { FocusTimerModal } from './components/FocusTimerModal';
import { ActivityModal } from './components/ActivityModal';
import { GoalModal } from './components/GoalModal';
import { HabitModal } from './components/HabitModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Data states from Storage
  const [activities, setActivities] = useState<Activity[]>(() => Storage.getActivities());
  const [goals, setGoals] = useState<ProductivityGoal[]>(() => Storage.getGoals());
  const [habits, setHabits] = useState<Habit[]>(() => Storage.getHabits());
  const [preferences, setPreferences] = useState<UserPreferences>(() => Storage.getPreferences());
  const [dayPlan, setDayPlan] = useState<DayPlan>(() => Storage.getDayPlan(getTodayDateString()));

  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ProductivityGoal | null>(null);

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  // Focus Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(25 * 60);
  const [timerTargetMinutes, setTimerTargetMinutes] = useState(25);
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timerActivityTitle, setTimerActivityTitle] = useState('Deep Work Sprint');
  const [timerCategory, setTimerCategory] = useState<ActivityCategory>('Deep Work');

  // Sync day plan when selected date changes
  useEffect(() => {
    setDayPlan(Storage.getDayPlan(selectedDate));
  }, [selectedDate]);

  // Save changes to localStorage
  useEffect(() => {
    Storage.saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    Storage.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    Storage.saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    Storage.savePreferences(preferences);
  }, [preferences]);

  // Timer interval ticker
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          playTimerCompleteChime();

          if (timerMode === 'focus') {
            // Auto prompt logging
            setIsTimerModalOpen(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  // Timer actions
  const handleToggleTimer = () => {
    if (!isTimerRunning && timerSecondsRemaining === 0) {
      setTimerSecondsRemaining(timerTargetMinutes * 60);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSecondsRemaining(timerTargetMinutes * 60);
  };

  const handleSetTimerPreset = (minutes: number, modeName: 'focus' | 'short_break' | 'long_break') => {
    setIsTimerRunning(false);
    setTimerTargetMinutes(minutes);
    setTimerSecondsRemaining(minutes * 60);
    setTimerMode(modeName);
  };

  const handleStartTimerFromBanner = (minutes: number, title?: string, cat?: ActivityCategory) => {
    setTimerTargetMinutes(minutes);
    setTimerSecondsRemaining(minutes * 60);
    setTimerMode('focus');
    if (title) setTimerActivityTitle(title);
    if (cat) setTimerCategory(cat);
    setIsTimerRunning(true);
    setIsTimerModalOpen(true);
  };

  const handleLogCompletedSession = (durationMins: number, title: string, category: ActivityCategory) => {
    const now = new Date();
    const curH = String(now.getHours()).padStart(2, '0');
    const curM = String(now.getMinutes()).padStart(2, '0');
    const endTime = `${curH}:${curM}`;
    
    // Back-calculate start time
    const startMinsTotal = (now.getHours() * 60 + now.getMinutes()) - durationMins;
    const sH = Math.max(0, Math.floor(startMinsTotal / 60)) % 24;
    const sM = Math.max(0, startMinsTotal % 60);
    const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      title,
      category,
      date: getTodayDateString(),
      startTime,
      endTime,
      durationMinutes: durationMins,
      impact: durationMins >= 45 ? 'high' : 'medium',
      status: 'completed',
      notes: `Logged via Tempo Focus Session (${durationMins}m)`,
      tags: ['focus-timer', 'deep-work'],
    };

    setActivities((prev) => [newAct, ...prev]);
    playSuccessChime();
  };

  // Activity Handlers
  const handleOpenNewActivity = () => {
    setEditingActivity(null);
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (act: Activity) => {
    setEditingActivity(act);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = (data: Partial<Activity>) => {
    if (data.id) {
      // Edit
      setActivities((prev) =>
        prev.map((a) => (a.id === data.id ? ({ ...a, ...data } as Activity) : a))
      );
    } else {
      // Create
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        title: data.title || 'Untitled Activity',
        category: data.category || 'Deep Work',
        date: data.date || selectedDate,
        startTime: data.startTime || '09:00',
        endTime: data.endTime || '10:00',
        durationMinutes: data.durationMinutes || 60,
        impact: data.impact || 'medium',
        status: data.status || 'completed',
        notes: data.notes,
        tags: data.tags,
      };
      setActivities((prev) => [newAct, ...prev]);
      playSuccessChime();
    }
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDuplicateActivity = (act: Activity) => {
    const duplicated: Activity = {
      ...act,
      id: `act-${Date.now()}`,
      title: `${act.title} (Copy)`,
      date: selectedDate,
      status: 'scheduled',
    };
    setActivities((prev) => [duplicated, ...prev]);
    playSuccessChime();
  };

  const handleToggleActivityStatus = (id: string) => {
    playSuccessChime();
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'completed' ? 'scheduled' : 'completed';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  // Goals Handlers
  const handleOpenNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: ProductivityGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (data: Partial<ProductivityGoal>) => {
    if (data.id) {
      setGoals((prev) =>
        prev.map((g) => (g.id === data.id ? ({ ...g, ...data } as ProductivityGoal) : g))
      );
    } else {
      const newGoal: ProductivityGoal = {
        id: `goal-${Date.now()}`,
        title: data.title || 'Productivity Goal',
        description: data.description,
        category: data.category || 'Deep Work',
        cadence: data.cadence || 'weekly',
        current: data.current || 0,
        target: data.target || 10,
        unit: data.unit || 'hours',
        startDate: data.startDate || getTodayDateString(),
        endDate: data.endDate || getTodayDateString(),
        status: data.status || 'on_track',
      };
      setGoals((prev) => [...prev, newGoal]);
      playSuccessChime();
    }
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleIncrementGoal = (goalId: string, amount: number) => {
    playSuccessChime();
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = Math.max(0, Math.round((g.current + amount) * 10) / 10);
          const isDone = newCurrent >= g.target;
          return {
            ...g,
            current: newCurrent,
            status: isDone ? 'completed' : newCurrent / g.target >= 0.6 ? 'on_track' : 'at_risk',
          };
        }
        return g;
      })
    );
  };

  // Habit Handlers
  const handleOpenNewHabit = () => {
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  const handleEditHabit = (h: Habit) => {
    setEditingHabit(h);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = (data: Partial<Habit>) => {
    if (data.id) {
      setHabits((prev) =>
        prev.map((h) => (h.id === data.id ? ({ ...h, ...data } as Habit) : h))
      );
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        title: data.title || 'Daily Habit',
        category: data.category || 'Deep Work',
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        targetDaysPerWeek: data.targetDaysPerWeek || 5,
      };
      setHabits((prev) => [...prev, newHabit]);
      playSuccessChime();
    }
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleToggleHabit = (habitId: string) => {
    playSuccessChime();
    handleToggleHabitDay(habitId, selectedDate);
  };

  const handleToggleHabitDay = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const exists = h.completedDates.includes(dateStr);
          const nextDates = exists
            ? h.completedDates.filter((d) => d !== dateStr)
            : [...h.completedDates, dateStr];

          const nextStreak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;
          const best = Math.max(h.bestStreak, nextStreak);

          return {
            ...h,
            completedDates: nextDates,
            streak: nextStreak,
            bestStreak: best,
          };
        }
        return h;
      })
    );
  };

  // Day Plan
  const handleUpdateDayPlan = (newPlan: DayPlan) => {
    setDayPlan(newPlan);
    Storage.saveDayPlan(newPlan);
  };

  // Data management
  const handleExportBackup = () => {
    const json = Storage.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempo-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string): boolean => {
    const ok = Storage.importBackup(jsonStr);
    if (ok) {
      setActivities(Storage.getActivities());
      setGoals(Storage.getGoals());
      setHabits(Storage.getHabits());
      setPreferences(Storage.getPreferences());
      setDayPlan(Storage.getDayPlan(selectedDate));
    }
    return ok;
  };

  const handleResetToDemo = () => {
    Storage.resetAllData();
    setActivities(Storage.getActivities());
    setGoals(Storage.getGoals());
    setHabits(Storage.getHabits());
    setPreferences(Storage.getPreferences());
    setDayPlan(Storage.getDayPlan(selectedDate));
  };

  const handleClearAll = () => {
    setActivities([]);
    setGoals([]);
    setHabits([]);
    setDayPlan({
      date: selectedDate,
      topPriorities: [],
      quickNotes: '',
      focusRating: 3,
    });
    Storage.saveActivities([]);
    Storage.saveGoals([]);
    Storage.saveHabits([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar adheres to 3-zone Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewActivity={handleOpenNewActivity}
        onToggleTimer={() => setIsTimerModalOpen(true)}
        isTimerRunning={isTimerRunning}
        timerSecondsRemaining={timerSecondsRemaining}
        timerMode={timerMode}
        preferences={preferences}
        onOpenSettings={() => setIsProfileModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            activities={activities}
            goals={goals}
            habits={habits}
            dayPlan={dayPlan}
            preferences={preferences}
            onOpenNewActivity={handleOpenNewActivity}
            onEditActivity={handleEditActivity}
            onToggleActivityStatus={handleToggleActivityStatus}
            onToggleHabit={handleToggleHabit}
            onUpdateDayPlan={handleUpdateDayPlan}
            onIncrementGoal={handleIncrementGoal}
            onStartTimer={handleStartTimerFromBanner}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            activities={activities}
            onOpenNewActivity={handleOpenNewActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onDuplicateActivity={handleDuplicateActivity}
            onToggleActivityStatus={handleToggleActivityStatus}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            habits={habits}
            onOpenNewGoal={handleOpenNewGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onIncrementGoal={handleIncrementGoal}
            onOpenNewHabit={handleOpenNewHabit}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
            onToggleHabitDay={handleToggleHabitDay}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            activities={activities}
            habits={habits}
            goals={goals}
            preferences={preferences}
            onExportData={handleExportBackup}
          />
        )}
      </main>

      {/* Focus Timer Modal Chamber */}
      <FocusTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        isRunning={isTimerRunning}
        secondsRemaining={timerSecondsRemaining}
        mode={timerMode}
        targetMinutes={timerTargetMinutes}
        activityTitle={timerActivityTitle}
        category={timerCategory}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
        onSetPreset={handleSetTimerPreset}
        onChangeActivityTitle={setTimerActivityTitle}
        onChangeCategory={setTimerCategory}
        onLogCompletedSession={handleLogCompletedSession}
      />

      {/* Activity Creation / Edit Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={handleSaveActivity}
        initialActivity={editingActivity}
        defaultDate={selectedDate}
      />

      {/* Goal Creation / Edit Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
      />

      {/* Habit Creation / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        preferences={preferences}
        onSavePreferences={setPreferences}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetToDemo={handleResetToDemo}
        onClearAll={handleClearAll}
      />

      {/* Quiet Footer with unboxed copyright */}
      <footer className="border-t border-slate-200/80 py-4 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Tempo</span>
            <span aria-hidden="true">·</span>
            <span>Daily Activity & Flow State Tracker</span>
          </div>
          <div>
            <span>Local Offline-First Storage</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Export / Import Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
