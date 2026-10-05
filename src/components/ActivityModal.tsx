import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, Calendar, AlertCircle } from 'lucide-react';
import { Activity, ActivityCategory, ActivityImpact, ActivityStatus } from '../types';
import { calculateDurationFromTimes, addMinutesToTime, getTodayDateString } from '../utils/storage';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: Partial<Activity>) => void;
  initialActivity?: Activity | null;
  defaultDate?: string;
}

const CATEGORIES: ActivityCategory[] = [
  'Deep Work',
  'Meetings',
  'Learning',
  'Fitness',
  'Admin',
  'Personal',
];

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialActivity,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Deep Work');
  const [date, setDate] = useState(defaultDate || getTodayDateString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [impact, setImpact] = useState<ActivityImpact>('high');
  const [status, setStatus] = useState<ActivityStatus>('completed');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialActivity) {
      setTitle(initialActivity.title);
      setCategory(initialActivity.category);
      setDate(initialActivity.date);
      setStartTime(initialActivity.startTime);
      setEndTime(initialActivity.endTime);
      setDurationMinutes(initialActivity.durationMinutes);
      setImpact(initialActivity.impact);
      setStatus(initialActivity.status);
      setNotes(initialActivity.notes || '');
      setTagsInput(initialActivity.tags ? initialActivity.tags.join(', ') : '');
    } else {
      // Defaults for new activity
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = now.getMinutes() < 30 ? '00' : '30';
      const start = `${h}:${m}`;
      const end = addMinutesToTime(start, 60);

      setTitle('');
      setCategory('Deep Work');
      setDate(defaultDate || getTodayDateString());
      setStartTime(start);
      setEndTime(end);
      setDurationMinutes(60);
      setImpact('high');
      setStatus('completed');
      setNotes('');
      setTagsInput('');
    }
    setError('');
  }, [initialActivity, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const calculated = calculateDurationFromTimes(newStart, endTime);
    if (calculated > 0) {
      setDurationMinutes(calculated);
    } else {
      // Auto advance end time by current duration
      setEndTime(addMinutesToTime(newStart, durationMinutes));
    }
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    const calculated = calculateDurationFromTimes(startTime, newEnd);
    if (calculated > 0) {
      setDurationMinutes(calculated);
    }
  };

  const handleApplyPresetDuration = (mins: number) => {
    setDurationMinutes(mins);
    setEndTime(addMinutesToTime(startTime, mins));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an activity title.');
      return;
    }

    const calculatedDuration = calculateDurationFromTimes(startTime, endTime) || durationMinutes;
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: initialActivity ? initialActivity.id : undefined,
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      durationMinutes: calculatedDuration,
      impact,
      status,
      notes: notes.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              {initialActivity ? 'Edit Activity' : 'Log Day-to-Day Activity'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record daily tasks, focus blocks, and meetings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Activity Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Design API Schemas, Client Review, 5k Jog"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
              >
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Date & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Impact / Focus Level
              </label>
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                {(['high', 'medium', 'low'] as ActivityImpact[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setImpact(lvl)}
                    className={`flex-1 py-1 text-xs font-medium rounded capitalize transition-all ${
                      impact === lvl
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Time Allocation
              </span>
              <span className="text-xs font-mono font-semibold text-indigo-700 tabular-nums">
                {durationMinutes} min ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Quick Duration presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 shrink-0">Presets:</span>
              {[15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleApplyPresetDuration(mins)}
                  className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors ${
                    durationMinutes === mins
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes & Key Outcomes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was completed? Any blockers, key decisions, or links?"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. backend, meeting, sprint-24, deep-work"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          {/* Footer Buttons */}
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
              {initialActivity ? 'Save Changes' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
