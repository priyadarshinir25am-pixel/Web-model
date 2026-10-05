import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  X, 
  CheckCircle2, 
  Zap, 
  Clock,
  Sparkles
} from 'lucide-react';
import { ActivityCategory } from '../types';
import { toggleAmbientSound, playTimerCompleteChime } from '../utils/audio';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  secondsRemaining: number;
  mode: 'focus' | 'short_break' | 'long_break';
  targetMinutes: number;
  activityTitle: string;
  category: ActivityCategory;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetPreset: (minutes: number, modeName: 'focus' | 'short_break' | 'long_break') => void;
  onChangeActivityTitle: (title: string) => void;
  onChangeCategory: (cat: ActivityCategory) => void;
  onLogCompletedSession: (durationMins: number, title: string, category: ActivityCategory) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  isRunning,
  secondsRemaining,
  mode,
  targetMinutes,
  activityTitle,
  category,
  onToggleTimer,
  onResetTimer,
  onSetPreset,
  onChangeActivityTitle,
  onChangeCategory,
  onLogCompletedSession,
}) => {
  const [ambientActive, setAmbientActive] = useState(false);

  useEffect(() => {
    // If timer stopped, disable ambient audio
    if (!isRunning && ambientActive) {
      toggleAmbientSound(false);
      setAmbientActive(false);
    }
  }, [isRunning, ambientActive]);

  const handleToggleAmbient = () => {
    const next = !ambientActive;
    toggleAmbientSound(next);
    setAmbientActive(next);
  };

  if (!isOpen) return null;

  const totalSeconds = targetMinutes * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  const handleFinishAndLog = () => {
    const loggedMins = Math.max(5, Math.round((totalSeconds - secondsRemaining) / 60));
    onLogCompletedSession(
      loggedMins > 0 ? loggedMins : targetMinutes,
      activityTitle.trim() || 'Focused Work Session',
      category
    );
    if (ambientActive) {
      toggleAmbientSound(false);
      setAmbientActive(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <h3 className="font-semibold text-slate-900 text-sm">Focus Session Chamber</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center">
          {/* Mode presets */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg w-full mb-6 text-xs font-medium">
            <button
              onClick={() => onSetPreset(25, 'focus')}
              className={`py-1.5 rounded-md transition-all ${
                targetMinutes === 25 && mode === 'focus'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => onSetPreset(50, 'focus')}
              className={`py-1.5 rounded-md transition-all ${
                targetMinutes === 50 && mode === 'focus'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              50m Deep
            </button>
            <button
              onClick={() => onSetPreset(5, 'short_break')}
              className={`py-1.5 rounded-md transition-all ${
                targetMinutes === 5 && mode === 'short_break'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5m Break
            </button>
            <button
              onClick={() => onSetPreset(15, 'long_break')}
              className={`py-1.5 rounded-md transition-all ${
                targetMinutes === 15 && mode === 'long_break'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15m Rest
            </button>
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                strokeWidth="6"
                className="stroke-slate-100"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                className="stroke-indigo-600 transition-all duration-300"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-500 mt-1 capitalize font-medium">
                {mode.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Activity title & category input */}
          <div className="w-full mt-4 space-y-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                What are you focusing on?
              </label>
              <input
                type="text"
                value={activityTitle}
                onChange={(e) => onChangeActivityTitle(e.target.value)}
                placeholder="e.g. Implement Cache Layer, Study Paper..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => onChangeCategory(e.target.value as ActivityCategory)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
              >
                <option value="Deep Work">Deep Work</option>
                <option value="Learning">Learning</option>
                <option value="Admin">Admin</option>
                <option value="Fitness">Fitness</option>
                <option value="Personal">Personal</option>
              </select>

              {/* Ambient Rain / White Noise Sound */}
              <button
                type="button"
                onClick={handleToggleAmbient}
                className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors ${
                  ambientActive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Toggle gentle rainfall white noise"
              >
                {ambientActive ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rain On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Rain Off</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full mt-6">
            <button
              onClick={onResetTimer}
              className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleTimer}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Focus Session</span>
                </>
              )}
            </button>

            <button
              onClick={handleFinishAndLog}
              className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              title="Log session to Timeline"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
