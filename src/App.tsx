/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ChatInput } from './components/ChatInput';
import { WritingStudioView } from './components/WritingStudioView';
import { ImageGenerationView } from './components/ImageGenerationView';
import { ImageEditingView } from './components/ImageEditingView';
import { StudyStudioView } from './components/StudyStudioView';
import { CodingStudioView } from './components/CodingStudioView';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  AssistantMode,
  ChatMessage,
  ChatSession,
  LanguageMode,
  AppSettings,
  ImageAttachment,
} from './types';
import {
  loadSessions,
  saveSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  loadSettings,
  saveSettings,
  clearAllLocalData,
} from './utils/storage';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(loadActiveSessionId);
  const [currentMode, setCurrentMode] = useState<AssistantMode>('general');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageMode>(settings.defaultLanguage || 'auto');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Keep sessions persisted in localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Keep active session ID persisted
  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Find active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const currentMessages = activeSession ? activeSession.messages : [];

  // Start a new chat
  const handleNewChat = (mode?: AssistantMode) => {
    const targetMode = mode || currentMode;
    const newSessionId = 'chat_' + Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      mode: targetMode,
      language: currentLanguage,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setError(null);
    if (mode) setCurrentMode(mode);
    showToast('Started new conversation', 'info');
  };

  // Select session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const target = sessions.find((s) => s.id === id);
    if (target) {
      setCurrentMode(target.mode);
      setCurrentLanguage(target.language || 'auto');
    }
    setError(null);
  };

  // Delete individual session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
    showToast('Conversation deleted', 'info');
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
    showToast('Chat renamed', 'success');
  };

  // Clear all sessions (Privacy action)
  const handleClearAllSessions = () => {
    clearAllLocalData();
    setSessions([]);
    setActiveSessionId(null);
    setError(null);
    showToast('All chat history permanently deleted', 'success');
  };

  // Send message to Gemini API backend (supports text & multimodal image)
  const handleSendMessage = async (text: string, image?: ImageAttachment) => {
    if ((!text.trim() && !image) || isLoading) return;

    setError(null);
    const now = Date.now();

    // Generate or retrieve session
    let targetSessionId = activeSessionId;
    let currentSessionList = [...sessions];

    if (!targetSessionId || !currentSessionList.find((s) => s.id === targetSessionId)) {
      targetSessionId = 'chat_' + now.toString();
      const initialTitle = text.length > 35 ? text.substring(0, 35) + '...' : text || 'Photo analysis';
      const newSession: ChatSession = {
        id: targetSessionId,
        title: initialTitle,
        mode: currentMode,
        language: currentLanguage,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      currentSessionList = [newSession, ...currentSessionList];
      setActiveSessionId(targetSessionId);
    }

    const userMsg: ChatMessage = {
      id: 'msg_' + now.toString(),
      role: 'user',
      content: text,
      timestamp: now,
      mode: currentMode,
      language: currentLanguage,
      image,
    };

    // Update active session with user message optimistically
    const targetSession = currentSessionList.find((s) => s.id === targetSessionId)!;
    const isFirstUserMessage = targetSession.messages.filter((m) => m.role === 'user').length === 0;
    const updatedTitle = isFirstUserMessage
      ? text.length > 38
        ? text.substring(0, 38) + '...'
        : text || 'Photo Query'
      : targetSession.title;

    const updatedMessages = [...targetSession.messages, userMsg];

    setSessions(
      currentSessionList.map((s) =>
        s.id === targetSessionId
          ? {
              ...s,
              title: updatedTitle,
              messages: updatedMessages,
              updatedAt: now,
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      // Prepare request payload for /api/chat with image parts
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        image: m.image
          ? {
              mimeType: m.image.mimeType,
              data: m.image.data,
            }
          : undefined,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          mode: currentMode,
          language: currentLanguage,
          temperature: settings.temperature,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = data?.details ? `${data.error} (${data.details})` : data?.error || `Server returned error (${res.status})`;
        throw new Error(errorText);
      }

      // Add model response
      const assistantMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now().toString(),
        role: 'model',
        content: data.text,
        timestamp: Date.now(),
        mode: currentMode,
        language: currentLanguage,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                messages: [...s.messages, assistantMsg],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Chat error:', e);
      const friendlyError = e.message || 'Unable to communicate with RITU AI service.';
      setError(friendlyError);
      showToast('Error generating AI answer', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last prompt cleanly
  const handleRetry = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    const lastUserMsg = [...activeSession.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const textToRetry = lastUserMsg.content;
      const imageToRetry = lastUserMsg.image;
      // Remove trailing failed user message
      const filteredMessages = activeSession.messages.filter((m) => m.id !== lastUserMsg.id);
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, messages: filteredMessages } : s))
      );
      setError(null);
      handleSendMessage(textToRetry, imageToRetry);
    }
  };

  // Toggle theme mode (Light / Dark)
  const handleToggleTheme = () => {
    setSettings((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
      return { ...prev, theme: nextTheme };
    });
  };

  return (
    <div className="flex h-dvh min-h-dvh w-full max-w-full overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-purple-200 selection:text-purple-900">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Responsive Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        currentMode={currentMode}
        onSelectMode={(m) => {
          setCurrentMode(m);
          showToast(`Switched to ${m.toUpperCase()} assistant`, 'info');
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 max-w-full overflow-hidden relative">
        <Header
          currentMode={currentMode}
          onSelectMode={(m) => {
            setCurrentMode(m);
            showToast(`Switched to ${m.toUpperCase()} mode`, 'info');
          }}
          currentLanguage={currentLanguage}
          onChangeLanguage={(l) => {
            setCurrentLanguage(l);
            showToast(`Language set to ${l.toUpperCase()}`, 'info');
          }}
          onNewChat={() => handleNewChat()}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Mode-specific Studio Views */}
          {currentMode === 'writer' ? (
            <WritingStudioView
              currentLanguage={currentLanguage}
              onShowToast={showToast}
            />
          ) : currentMode === 'image' ? (
            <ImageGenerationView
              onShowToast={showToast}
            />
          ) : currentMode === 'edit' ? (
            <ImageEditingView
              onShowToast={showToast}
            />
          ) : currentMode === 'study' ? (
            <StudyStudioView
              currentLanguage={currentLanguage}
              onShowToast={showToast}
            />
          ) : currentMode === 'coding' ? (
            <CodingStudioView
              currentLanguage={currentLanguage}
              onShowToast={showToast}
            />
          ) : (
            /* Standard AI Chat View */
            <>
              <ChatView
                messages={currentMessages}
                isLoading={isLoading}
                error={error}
                onRetry={handleRetry}
                currentMode={currentMode}
                currentLanguage={currentLanguage}
                onSendPrompt={(p) => handleSendMessage(p)}
                onNewChat={() => handleNewChat()}
              />

              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                currentMode={currentMode}
                currentLanguage={currentLanguage}
                onChangeLanguage={setCurrentLanguage}
                onSelectMode={setCurrentMode}
                onShowToast={showToast}
              />
            </>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => {
          setSettings((prev) => ({ ...prev, ...newVals }));
          showToast('Settings saved', 'success');
        }}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Privacy & Data Management Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onClearAllData={handleClearAllSessions}
        totalConversations={sessions.length}
      />
    </div>
  );
}
