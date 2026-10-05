import React, { useState } from 'react';
import { 
  Activity, 
  ActivityCategory, 
  ActivityStatus 
} from '../types';
import { 
  formatMinutesToHuman, 
  getTodayDateString 
} from '../utils/storage';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Pencil, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface TimelineViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activities: Activity[];
  onOpenNewActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onDuplicateActivity: (activity: Activity) => void;
  onToggleActivityStatus: (id: string) => void;
}

const CATEGORIES: ('All' | ActivityCategory)[] = [
  'All',
  'Deep Work',
  'Meetings',
  'Learning',
  'Fitness',
  'Admin',
  'Personal',
];

export const TimelineView: React.FC<TimelineViewProps> = ({
  selectedDate,
  setSelectedDate,
  activities,
  onOpenNewActivity,
  onEditActivity,
  onDeleteActivity,
  onDuplicateActivity,
  onToggleActivityStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ActivityCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ActivityStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'hourly'>('list');

  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Filter activities for date
  const dayActivities = activities.filter((a) => a.date === selectedDate);

  // Apply filters
  const filteredActivities = dayActivities.filter((a) => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchNotes = a.notes?.toLowerCase().includes(q);
      const matchTags = a.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNotes && !matchTags) return false;
    }
    return true;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => a.startTime.localeCompare(b.startTime));

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

  // Calculate day totals
  const totalMins = sortedActivities.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const getCategoryStyles = (cat: ActivityCategory) => {
    switch (cat) {
      case 'Deep Work':
        return { border: 'border-l-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50/70', badge: 'bg-indigo-50 text-indigo-700' };
      case 'Meetings':
        return { border: 'border-l-amber-500', text: 'text-amber-700', bg: 'bg-amber-50/70', badge: 'bg-amber-50 text-amber-700' };
      case 'Learning':
        return { border: 'border-l-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50/70', badge: 'bg-emerald-50 text-emerald-700' };
      case 'Fitness':
        return { border: 'border-l-cyan-600', text: 'text-cyan-700', bg: 'bg-cyan-50/70', badge: 'bg-cyan-50 text-cyan-700' };
      case 'Admin':
        return { border: 'border-l-slate-500', text: 'text-slate-700', bg: 'bg-slate-100/70', badge: 'bg-slate-100 text-slate-700' };
      default:
        return { border: 'border-l-violet-600', text: 'text-violet-700', bg: 'bg-violet-50/70', badge: 'bg-violet-50 text-violet-700' };
    }
  };

  // Generate hourly blocks from 07:00 to 21:00
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Date Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Daily Schedule Log</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalMins > 0 ? formatMinutesToHuman(totalMins) : '0h'} scheduled</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {formattedDateHeadline}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white text-slate-800"
            />
            <button
              onClick={() => handleShiftDate(1)}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

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
            onClick={onOpenNewActivity}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Zero-Pill discipline: segmented buttons for filters) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities, tags, or notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* View Mode Toggle: List vs Hourly Grid */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('hourly')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'hourly'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Time Grid
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium text-xs mr-1 shrink-0">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: List or Hourly Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {sortedActivities.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No matching activities found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No entries match your current search or filter criteria for this date.
              </p>
              <button
                onClick={onOpenNewActivity}
                className="mt-4 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Activity</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedActivities.map((activity) => {
                const styles = getCategoryStyles(activity.category);
                const isCompleted = activity.status === 'completed';

                return (
                  <div
                    key={activity.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors border-l-4 ${styles.border}`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Status toggle */}
                      <button
                        onClick={() => onToggleActivityStatus(activity.id)}
                        className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`text-sm font-semibold ${
                              isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {activity.title}
                          </h4>

                          {activity.status === 'in_progress' && (
                            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              In Progress
                            </span>
                          )}
                        </div>

                        {/* Zero-Pill unboxed metadata */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span className={`font-medium ${styles.text}`}>
                            {activity.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums font-medium text-slate-700">
                            {activity.startTime} – {activity.endTime}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {activity.durationMinutes}m ({formatMinutesToHuman(activity.durationMinutes)})
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{activity.impact} impact</span>
                        </div>

                        {activity.notes && (
                          <p className="text-xs text-slate-600 pt-0.5 max-w-2xl">
                            {activity.notes}
                          </p>
                        )}

                        {activity.tags && activity.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                            {activity.tags.map((tag) => (
                              <span key={tag} className="hover:text-slate-600">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onDuplicateActivity(activity)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Duplicate to today"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Activity"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Hourly visual timeline grid */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Day Schedule Grid (07:00 - 22:00)
          </h3>
          <div className="space-y-2">
            {hours.map((hour) => {
              const hourStr = String(hour).padStart(2, '0');
              const nextHourStr = String(hour + 1).padStart(2, '0');
              const slotActivities = dayActivities.filter((a) => {
                const [startH] = a.startTime.split(':').map(Number);
                return startH === hour;
              });

              return (
                <div
                  key={hour}
                  className="flex items-start gap-4 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="w-14 text-xs font-mono font-medium text-slate-400 pt-0.5 shrink-0 tabular-nums">
                    {hourStr}:00
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    {slotActivities.length > 0 ? (
                      slotActivities.map((act) => {
                        const style = getCategoryStyles(act.category);
                        return (
                          <div
                            key={act.id}
                            onClick={() => onEditActivity(act)}
                            className={`p-2.5 rounded-lg border border-l-4 ${style.border} ${style.bg} cursor-pointer transition-transform hover:-translate-y-0.5`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-900 truncate">
                                {act.title}
                              </span>
                              <span className="font-mono tabular-nums text-slate-600 text-[11px] shrink-0 ml-2">
                                {act.startTime} - {act.endTime} ({act.durationMinutes}m)
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-300 italic py-1">
                        Open Focus Slot
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
