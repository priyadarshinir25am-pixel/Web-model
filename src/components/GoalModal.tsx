import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, AlertCircle } from 'lucide-react';
import { ProductivityGoal, ActivityCategory, GoalCadence, GoalUnit } from '../types';
import { getTodayDateString, getPastDates } from '../utils/storage';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Partial<ProductivityGoal>) => void;
  initialGoal?: ProductivityGoal | null;
}

const CATEGORIES: (ActivityCategory | 'General')[] = [
  'Deep Work',
  'Learning',
  'Fitness',
  'Admin',
  'Personal',
  'General',
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory | 'General'>('Deep Work');
  const [cadence, setCadence] = useState<GoalCadence>('weekly');
  const [current, setCurrent] = useState<number>(0);
  const [target, setTarget] = useState<number>(10);
  const [unit, setUnit] = useState<GoalUnit>('hours');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getPastDates(-7)[0] || getTodayDateString());
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      setCategory(initialGoal.category);
      setCadence(initialGoal.cadence);
      setCurrent(initialGoal.current);
      setTarget(initialGoal.target);
      setUnit(initialGoal.unit);
      setStartDate(initialGoal.startDate);
      setEndDate(initialGoal.endDate);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Deep Work');
      setCadence('weekly');
      setCurrent(0);
      setTarget(15);
      setUnit('hours');
      setStartDate(getTodayDateString());
      
      const future = new Date();
      future.setDate(future.getDate() + 7);
      const fy = future.getFullYear();
      const fm = String(future.getMonth() + 1).padStart(2, '0');
      const fd = String(future.getDate()).padStart(2, '0');
      setEndDate(`${fy}-${fm}-${fd}`);
    }
    setError('');
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }
    if (target <= 0) {
      setError('Target value must be greater than 0.');
      return;
    }

    const calculatedStatus = current >= target ? 'completed' : current / target > 0.6 ? 'on_track' : 'at_risk';

    onSave({
      id: initialGoal ? initialGoal.id : undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      cadence,
      current: Number(current),
      target: Number(target),
      unit,
      startDate,
      endDate,
      status: calculatedStatus,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-base">
              {initialGoal ? 'Edit Productivity Goal' : 'Create Productivity Goal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Goal Objective <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Log 30 Hours of Deep Work, Finish Distributed Systems Book"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Why this matters
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Block interruptions, build momentum towards Q4 release"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory | 'General')}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
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
                Cadence
              </label>
              <select
                value={cadence}
                onChange={(e) => setCadence(e.target.value as GoalCadence)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value="daily">Daily Target</option>
                <option value="weekly">Weekly Target</option>
                <option value="monthly">Monthly Milestone</option>
              </select>
            </div>
          </div>

          {/* Metric Targets */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Target Quantification
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Current</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={current}
                  onChange={(e) => setCurrent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Target</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={target}
                  onChange={(e) => setTarget(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as GoalUnit)}
                  className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                >
                  <option value="hours">hours</option>
                  <option value="sessions">sessions</option>
                  <option value="tasks">tasks</option>
                  <option value="days">days</option>
                  <option value="pages">pages</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-800"
              />
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
              {initialGoal ? 'Save Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
