import React, { useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  Download,
  AlertCircle,
  X,
  Lock,
  HardDrive,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { exportChatHistory } from '../utils/storage';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
  totalConversations: number;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onClearAllData,
  totalConversations,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAll = () => {
    onClearAllData();
    setConfirmDelete(false);
    setDeletedSuccess(true);
    setTimeout(() => {
      setDeletedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                Privacy & Data Controls
              </h2>
              <p className="text-xs text-slate-500">Your privacy is fundamental to DigiMind AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Privacy Principles */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <HardDrive className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">
                100% Client-Side Local Storage
              </h4>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All your chat history and custom titles remain saved exclusively in your browser's private local storage. No conversation history is recorded in external databases.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <Lock className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Stateless & Secure Backend
              </h4>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our server acts as a secure, ephemeral proxy to Google Gemini API. Your API keys are kept strictly on the server and never exposed to the browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <EyeOff className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">
                No Trackers or Behavioral Profiling
              </h4>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We do not sell personal data, display third-party advertisements, or inject third-party marketing cookies.
              </p>
            </div>
          </div>
        </div>

        {/* Data Management Actions */}
        <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                Stored Conversations
              </h4>
              <p className="text-xs text-slate-500">
                Currently holding {totalConversations} conversation{totalConversations === 1 ? '' : 's'} on this device.
              </p>
            </div>
            <button
              onClick={exportChatHistory}
              disabled={totalConversations === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Delete All Data Trigger */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {deletedSuccess ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>All chat history successfully deleted!</span>
              </div>
            ) : !confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={totalConversations === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Saved Chat History</span>
              </button>
            ) : (
              <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-3 text-xs dark:border-rose-900 dark:bg-rose-950/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Are you sure you want to permanently delete all chats?</span>
                </div>
                <p className="text-rose-700 dark:text-rose-300 text-[11px]">
                  This action cannot be undone. All conversation records stored in your browser will be immediately erased.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDeleteAll}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition-colors"
          >
            Close Privacy Center
          </button>
        </div>
      </div>
    </div>
  );
};
