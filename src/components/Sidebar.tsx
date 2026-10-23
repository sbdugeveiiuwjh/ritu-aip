import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  BookOpen,
  PenTool,
  Code2,
  Trash2,
  Search,
  Settings,
  Shield,
  X,
  Sparkles,
  Edit2,
  Check,
  Sun,
  Moon,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { AssistantMode, ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: (mode?: AssistantMode) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  currentMode: AssistantMode;
  onSelectMode: (mode: AssistantMode) => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  currentMode,
  onSelectMode,
  onOpenSettings,
  onOpenPrivacy,
  theme,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 ease-in-out lg:static ${
          isOpen
            ? 'translate-x-0 lg:w-72 shadow-2xl lg:shadow-none'
            : '-translate-x-full lg:w-0 lg:border-none lg:overflow-hidden'
        }`}
      >
        {/* Header / Brand in Sidebar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white font-bold text-sm shadow-xs">
              R
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">RITU AI</span>
              <span className="ml-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Web App</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat(currentMode);
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Start New Chat</span>
          </button>
        </div>

        {/* Specialized AI Studios Shortcuts */}
        <div className="px-3 py-1">
          <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            AI Studios & Modes
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectMode('general');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                currentMode === 'general'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>General AI Chat</span>
            </button>
            <button
              onClick={() => {
                onSelectMode('writer');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                currentMode === 'writer'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <PenTool className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>AI Writing Studio</span>
            </button>
            <button
              onClick={() => {
                onSelectMode('image');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                currentMode === 'image'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="h-4 w-4 text-pink-500 shrink-0" />
              <span>AI Image Generation</span>
            </button>
            <button
              onClick={() => {
                onSelectMode('edit');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                currentMode === 'edit'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Wand2 className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>AI Photo Editor</span>
            </button>
            <button
              onClick={() => {
                onSelectMode('study');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                currentMode === 'study'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Study & Homework Solver</span>
            </button>
            <button
              onClick={() => {
                onSelectMode('coding');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                currentMode === 'coding'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Coding Assistant & Debugger</span>
            </button>
          </div>
        </div>

        {/* Chat History Section */}
        <div className="flex flex-1 flex-col overflow-hidden px-3 pt-3">
          <div className="flex items-center justify-between px-2 pb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recent History ({sessions.length})
            </span>
          </div>

          {/* Search Bar */}
          {sessions.length > 2 && (
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          )}

          {/* History Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {sessions.length === 0 ? 'No conversations yet' : 'No matching chats'}
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isActive = s.id === activeSessionId;
                const isEditing = editingId === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectSession(s.id);
                        if (window.innerWidth < 1024) onClose();
                      }
                    }}
                    className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-purple-50/80 text-purple-900 font-semibold dark:bg-purple-950/70 dark:text-purple-200'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1 pr-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            autoFocus
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveRename(s.id)}
                            className="w-full rounded border border-purple-400 bg-white px-1.5 py-0.5 text-xs text-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                          <button
                            onClick={(e) => saveRename(s.id, e)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="truncate">{s.title}</span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startRename(s, e)}
                          title="Rename chat"
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(s.id);
                          }}
                          title="Delete chat"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info & Controls matching template slogan */}
        <div className="border-t border-slate-200 p-3 space-y-2 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300 text-center">
            Your Ideas + RITU AI = Endless Possibilities 💜
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Dark</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                onOpenPrivacy();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>Privacy</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-purple-500" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
