import React from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Globe,
  Sun,
  Moon,
  X,
  Trash2,
} from 'lucide-react';
import { AppSettings, LanguageMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenPrivacy?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenPrivacy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                RITU AI Settings
              </h2>
              <p className="text-xs text-slate-500">Preferences & app controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clean, Direct User Controls */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Theme Mode */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white block">Theme</span>
              <span className="text-[11px] text-slate-500">Light or dark visual mode</span>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  settings.theme === 'light' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  settings.theme === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Preferred Language */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
            <label className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Response Language</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'auto', label: 'Auto' },
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिन्दी' },
                { id: 'hinglish', label: 'Hinglish' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => onUpdateSettings({ defaultLanguage: l.id as LanguageMode })}
                  className={`rounded-xl p-2 text-center font-semibold border transition-all ${
                    settings.defaultLanguage === l.id
                      ? 'border-purple-500 bg-purple-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Creativity / Temperature Slider */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Creativity (Temperature)</span>
              </label>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Precise (0.1)</span>
              <span>Balanced (0.7)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {/* Privacy & Clear Data link */}
          {onOpenPrivacy && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Chat Data & Privacy</span>
                <span className="text-[11px] text-slate-500">History is stored locally on this device</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenPrivacy();
                }}
                className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Manage</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
