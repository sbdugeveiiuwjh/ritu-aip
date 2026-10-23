import React from 'react';
import {
  Menu,
  Plus,
  Sparkles,
  BookOpen,
  PenTool,
  Code2,
  Globe,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { AssistantMode, LanguageMode } from '../types';

interface HeaderProps {
  currentMode: AssistantMode;
  onSelectMode: (mode: AssistantMode) => void;
  currentLanguage: LanguageMode;
  onChangeLanguage: (lang: LanguageMode) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const MODES: { id: AssistantMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'general', label: 'AI Chat', icon: Sparkles },
  { id: 'writer', label: 'Writing', icon: PenTool },
  { id: 'image', label: 'AI Image', icon: ImageIcon },
  { id: 'edit', label: 'Photo Edit', icon: Wand2 },
  { id: 'study', label: 'Study Hub', icon: BookOpen },
  { id: 'coding', label: 'Coding', icon: Code2 },
];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  currentLanguage,
  onChangeLanguage,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  onOpenPrivacy,
  theme,
  onToggleTheme,
}) => {
  const getLanguageLabel = (lang: LanguageMode) => {
    switch (lang) {
      case 'hi':
        return 'हिन्दी';
      case 'hinglish':
        return 'Hinglish';
      case 'en':
        return 'English';
      default:
        return 'Auto';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      {/* Top Navbar Row */}
      <div className="flex h-14 items-center justify-between px-3 md:px-5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation drawer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* RITU AI Brand Logo & Name matching template */}
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => onSelectMode('general')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-sm shadow-purple-500/25">
              <span className="text-base font-extrabold tracking-tight">R</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base md:text-lg">
                  RITU<span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> AI</span>
                </span>
                <span className="hidden sm:inline-block rounded-full bg-purple-100 dark:bg-purple-950/70 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 tracking-wide uppercase">
                  All-In-One
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Language Quick Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
              title="Select Response Language"
            >
              <Globe className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>{getLanguageLabel(currentLanguage)}</span>
            </button>
            <div className="invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-150 absolute right-0 mt-1 w-36 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Language
              </div>
              {(['auto', 'en', 'hi', 'hinglish'] as LanguageMode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onChangeLanguage(lang)}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                    currentLanguage === lang
                      ? 'bg-purple-50 text-purple-700 font-bold dark:bg-purple-950/60 dark:text-purple-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{getLanguageLabel(lang)}</span>
                  {lang === 'hi' && <span className="text-[10px] text-slate-400 font-normal">Hindi</span>}
                </button>
              ))}
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all"
            title="Start fresh conversation"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">New Chat</span>
          </button>

          {/* Quick Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Privacy & Settings */}
          <button
            onClick={onOpenPrivacy}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Privacy & Data Management"
            aria-label="Privacy settings"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </button>
          <button
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Settings"
            aria-label="Application settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Sub-nav: Scrollable Pill Navigation for mobile & desktop */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/60 no-scrollbar">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/30 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
