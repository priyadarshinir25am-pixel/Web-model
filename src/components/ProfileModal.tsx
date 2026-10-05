import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, Check, AlertTriangle, User } from 'lucide-react';
import { UserPreferences } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onResetToDemo: () => void;
  onClearAll: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onExportBackup,
  onImportBackup,
  onResetToDemo,
  onClearAll,
}) => {
  const [name, setName] = useState(preferences.name);
  const [role, setRole] = useState(preferences.role);
  const [focusTargetHours, setFocusTargetHours] = useState(preferences.dailyFocusTargetMinutes / 60);
  const [tasksTarget, setTasksTarget] = useState(preferences.dailyTasksTarget);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      ...preferences,
      name: name.trim() || 'Productivity User',
      role: role.trim() || 'Builder',
      dailyFocusTargetMinutes: Math.round(Number(focusTargetHours) * 60),
      dailyTasksTarget: Number(tasksTarget),
    });
    onClose();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        setImportStatus('success');
        setTimeout(() => {
          setImportStatus('idle');
          onClose();
        }, 1200);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-base">Workspace & User Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Profile & Targets
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Title / Profession</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Daily Focus Target (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={focusTargetHours}
                  onChange={(e) => setFocusTargetHours(parseFloat(e.target.value) || 6)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Target Activities / Day</label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={tasksTarget}
                  onChange={(e) => setTasksTarget(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </form>

          {/* Data Portability */}
          <div className="pt-4 border-t border-slate-200/80 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Data Management & Portability
            </h4>
            <p className="text-xs text-slate-500">
              All your activity logs, goals, and habits are stored locally in your browser with zero tracking.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onExportBackup}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export JSON Backup</span>
              </button>

              <label className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus === 'success' && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Backup imported successfully!
              </div>
            )}
            {importStatus === 'error' && (
              <div className="p-2.5 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Invalid JSON backup file.
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onResetToDemo}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Sample Demo Dataset</span>
              </button>

              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Data</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-semibold">Are you sure?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded font-medium hover:bg-red-700"
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
