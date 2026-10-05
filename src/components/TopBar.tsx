import React from 'react';
import { ActiveTab, UserPreferences } from '../types';
import { 
  LayoutDashboard, 
  Clock, 
  Target, 
  BarChart3, 
  Plus, 
  Play, 
  Pause,
  SlidersHorizontal
} from 'lucide-react';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewActivity: () => void;
  onToggleTimer: () => void;
  isTimerRunning: boolean;
  timerSecondsRemaining: number;
  timerMode: 'focus' | 'short_break' | 'long_break';
  preferences: UserPreferences;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewActivity,
  onToggleTimer,
  isTimerRunning,
  timerSecondsRemaining,
  preferences,
  onOpenSettings,
}) => {
  const formatTimerMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-6 shrink-0">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            title="Tempo Productivity Workspace"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <span className="font-bold text-base font-mono tracking-tighter">T</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Tempo
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-slate-100 text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'goals'
                ? 'bg-slate-100 text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Goals & Habits</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-100 text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Focus Timer toggle */}
          <button
            onClick={onToggleTimer}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all flex items-center gap-2 ${
              isTimerRunning
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Focus Timer"
          >
            {isTimerRunning ? (
              <Pause className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <Play className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className="tabular-nums font-semibold">
              {formatTimerMinSec(timerSecondsRemaining)}
            </span>
          </button>

          {/* Primary Action: Log Activity */}
          <button
            onClick={onOpenNewActivity}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Log Activity</span>
          </button>

          {/* Profile / Preferences */}
          <button
            onClick={onOpenSettings}
            className="p-1 rounded-full hover:ring-2 hover:ring-slate-300 transition-all focus:outline-none"
            title="Profile & Settings"
          >
            {preferences.avatarUrl ? (
              <img
                src={preferences.avatarUrl}
                alt={preferences.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                  if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`avatar-fallback ${preferences.avatarUrl ? 'hidden' : ''} w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold`}>
              {preferences.name.charAt(0)}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50/80">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 ${
            activeTab === 'timeline' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 ${
            activeTab === 'goals' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Goals
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 ${
            activeTab === 'analytics' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Analytics
        </button>
      </div>
    </header>
  );
};
