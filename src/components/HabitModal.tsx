import React, { useState, useEffect } from 'react';
import { X, Flame, AlertCircle } from 'lucide-react';
import { Habit, ActivityCategory } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  initialHabit?: Habit | null;
}

const CATEGORIES: ActivityCategory[] = [
  'Deep Work',
  'Learning',
  'Fitness',
  'Admin',
  'Personal',
  'Meetings',
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Deep Work');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setCategory(initialHabit.category);
      setTargetDaysPerWeek(initialHabit.targetDaysPerWeek);
    } else {
      setTitle('');
      setCategory('Deep Work');
      setTargetDaysPerWeek(5);
    }
    setError('');
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a habit title.');
      return;
    }

    onSave({
      id: initialHabit ? initialHabit.id : undefined,
      title: title.trim(),
      category,
      targetDaysPerWeek: Number(targetDaysPerWeek),
      streak: initialHabit ? initialHabit.streak : 0,
      bestStreak: initialHabit ? initialHabit.bestStreak : 0,
      completedDates: initialHabit ? initialHabit.completedDates : [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 text-base">
              {initialHabit ? 'Edit Daily Habit' : 'Track New Daily Habit'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Habit Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 15-min Stretch, Code Review, 2L Water"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Frequency
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="7"
                value={targetDaysPerWeek}
                onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-xs font-mono font-bold text-slate-900 w-16 text-right">
                {targetDaysPerWeek} {targetDaysPerWeek === 1 ? 'day' : 'days'}/wk
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              {initialHabit ? 'Save Changes' : 'Start Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
