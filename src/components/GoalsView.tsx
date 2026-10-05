import React, { useState } from 'react';
import { ProductivityGoal, Habit, GoalCadence } from '../types';
import { getPastDates, getTodayDateString } from '../utils/storage';
import { playSuccessChime } from '../utils/audio';
import { 
  Target, 
  Flame, 
  Plus, 
  Check, 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface GoalsViewProps {
  goals: ProductivityGoal[];
  habits: Habit[];
  onOpenNewGoal: () => void;
  onEditGoal: (goal: ProductivityGoal) => void;
  onDeleteGoal: (id: string) => void;
  onIncrementGoal: (id: string, amount: number) => void;
  onOpenNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  habits,
  onOpenNewGoal,
  onEditGoal,
  onDeleteGoal,
  onIncrementGoal,
  onOpenNewHabit,
  onEditHabit,
  onDeleteHabit,
  onToggleHabitDay,
}) => {
  const [cadenceFilter, setCadenceFilter] = useState<'all' | GoalCadence>('all');
  const past7Days = getPastDates(7);
  const today = getTodayDateString();

  const filteredGoals = goals.filter((g) => {
    if (cadenceFilter !== 'all' && g.cadence !== cadenceFilter) return false;
    return true;
  });

  const getStatusBadge = (status: ProductivityGoal['status']) => {
    switch (status) {
      case 'completed':
        return <span className="text-emerald-700 font-medium">Completed</span>;
      case 'ahead':
        return <span className="text-indigo-700 font-medium">Ahead of schedule</span>;
      case 'on_track':
        return <span className="text-slate-600 font-medium">On track</span>;
      case 'at_risk':
        return <span className="text-amber-700 font-medium">Needs attention</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Productivity & Habit Framework</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{goals.length} goals</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{habits.length} daily habits</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Goals & Habit Consistency
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewHabit}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
          <button
            onClick={onOpenNewGoal}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Productivity Goals */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Active Productivity Goals
            </h2>
            <p className="text-xs text-slate-500">
              Measurable targets across weekly deep work, technical mastery, and fitness
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setCadenceFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                cadenceFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Cadences
            </button>
            <button
              onClick={() => setCadenceFilter('weekly')}
              className={`px-3 py-1 rounded-md transition-colors ${
                cadenceFilter === 'weekly'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setCadenceFilter('monthly')}
              className={`px-3 py-1 rounded-md transition-colors ${
                cadenceFilter === 'monthly'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">No goals found for this filter</p>
            <button
              onClick={onOpenNewGoal}
              className="mt-3 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg"
            >
              Create New Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
              const isFinished = goal.current >= goal.target;

              return (
                <div
                  key={goal.id}
                  className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* Unboxed category and cadence */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700">{goal.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{goal.cadence}</span>
                          <span aria-hidden="true">·</span>
                          {getStatusBadge(goal.status)}
                        </div>

                        <h3 className="font-semibold text-slate-900 text-base">
                          {goal.title}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onEditGoal(goal)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-slate-600">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Progress section */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-base font-bold text-slate-900">
                          {goal.current}
                        </span>
                        <span className="text-slate-400 font-normal">/</span>
                        <span className="text-slate-600">
                          {goal.target} {goal.unit}
                        </span>
                        <span className="text-slate-400 ml-1">({percent}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isFinished ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Quick increment buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Quick Log:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onIncrementGoal(goal.id, goal.unit === 'hours' ? 0.5 : 1)}
                          className="px-2 py-1 text-xs font-mono font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          +{goal.unit === 'hours' ? '0.5h' : '1'}
                        </button>
                        <button
                          onClick={() => onIncrementGoal(goal.id, goal.unit === 'hours' ? 1 : 2)}
                          className="px-2 py-1 text-xs font-mono font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          +{goal.unit === 'hours' ? '1.0h' : '2'}
                        </button>
                        <button
                          onClick={() => onIncrementGoal(goal.id, goal.unit === 'hours' ? 2 : 5)}
                          className="px-2 py-1 text-xs font-mono font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          +{goal.unit === 'hours' ? '2.0h' : '5'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Daily Habit Consistency Matrix */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>7-Day Habit Consistency Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">
              Click any date box to toggle completion and reinforce your streak
            </p>
          </div>

          <button
            onClick={onOpenNewHabit}
            className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Daily Habit</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 pr-4">Habit Name</th>
                <th className="py-2.5 px-3">Streak</th>
                {past7Days.map((dateStr) => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const dayNum = d.getDate();
                  const isCurToday = dateStr === today;

                  return (
                    <th key={dateStr} className="py-2.5 px-2 text-center">
                      <div className={`font-mono ${isCurToday ? 'text-indigo-600 font-bold' : ''}`}>
                        <div>{dayName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{dayNum}</div>
                      </div>
                    </th>
                  );
                })}
                <th className="py-2.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {habits.map((habit) => (
                <tr key={habit.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-xs text-slate-900">
                      {habit.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {habit.category} · Target: {habit.targetDaysPerWeek}d/wk
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-600 tabular-nums">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{habit.streak}d</span>
                    </div>
                  </td>

                  {past7Days.map((dateStr) => {
                    const isDone = habit.completedDates.includes(dateStr);
                    const isCurToday = dateStr === today;

                    return (
                      <td key={dateStr} className="py-3 px-2 text-center">
                        <button
                          onClick={() => {
                            playSuccessChime();
                            onToggleHabitDay(habit.id, dateStr);
                          }}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : isCurToday
                              ? 'bg-slate-100 border border-slate-300 hover:border-amber-400 text-slate-300'
                              : 'bg-slate-50 border border-slate-200/70 hover:bg-slate-100 text-slate-200'
                          }`}
                          title={`Toggle ${habit.title} on ${dateStr}`}
                        >
                          {isDone ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-mono">·</span>
                          )}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3 pl-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditHabit(habit)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title="Edit Habit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
