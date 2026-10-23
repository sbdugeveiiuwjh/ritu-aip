import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  BookOpen,
  PenTool,
  Code2,
  Languages,
  Info,
  Maximize2,
  Minimize2,
  X,
  Camera,
  Image as ImageIcon,
  ArrowDown,
  ChevronDown,
  Type,
} from 'lucide-react';
import { AssistantMode, ChatMessage, LanguageMode } from '../types';
import { FormattedMarkdown } from '../utils/markdown';
import { ModeHelpers } from './ModeHelpers';
import { TypingIndicator } from './TypingIndicator';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  currentMode: AssistantMode;
  currentLanguage: LanguageMode;
  onSendPrompt: (prompt: string) => void;
  onNewChat: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  error,
  onRetry,
  currentMode,
  currentLanguage,
  onSendPrompt,
  onNewChat,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<ChatMessage | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Smooth scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // Track scroll position to show/hide "Scroll to Bottom" button
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Show button if more than 140px away from the bottom
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottom(isFarFromBottom);
  };

  // Auto-scroll on new message or loading status with dual-pass timing
  useEffect(() => {
    scrollToBottom(false);
    const timer = setTimeout(() => scrollToBottom(true), 120);
    return () => clearTimeout(timer);
  }, [messages, isLoading, error, scrollToBottom]);

  // Copy message handler
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Text to speech handler (SpeechSynthesis API)
  const handleSpeak = (id: string, text: string, lang?: LanguageMode) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const getModeBadge = (mode?: AssistantMode) => {
    switch (mode) {
      case 'study':
        return { label: 'Study Assistant', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'writer':
        return { label: 'AI Writer', icon: PenTool, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300' };
      case 'coding':
        return { label: 'Coding Assistant', icon: Code2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300' };
      case 'image':
      case 'edit':
        return { label: 'Vision & Image AI', icon: ImageIcon, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60 dark:text-pink-300' };
      default:
        return { label: 'RITU AI', icon: Sparkles, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300' };
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 space-y-4 w-full max-w-full relative touch-pan-y"
    >
      {/* Lightbox for zooming attached images */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 rounded-full bg-slate-800/80 p-2 text-white hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={zoomedImage} alt="Zoomed view" className="max-h-[85vh] w-auto object-contain mx-auto" />
          </div>
        </div>
      )}

      {/* Full-Screen / Expanded Reader Modal for Long Answers */}
      {expandedMessage && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full sm:max-w-4xl h-[92dvh] sm:h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
          >
            {/* Top Draggable Handle Header */}
            <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    पूरा उत्तर (Full Answer View)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    आसानी से नीचे तक स्क्रॉल और ड्रैग करके पूरा पढ़ें
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5">
                {/* Font Size Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setFontSize((prev) =>
                      prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal'
                    )
                  }
                  title="Font size change"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  <Type className="h-3.5 w-3.5 text-purple-600" />
                  <span className="text-[11px] uppercase">{fontSize}</span>
                </button>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopy('expanded', expandedMessage.content)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {copiedId === 'expanded' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setExpandedMessage(null)}
                  className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close reader"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Draggable Drag-Handle Indicator for Mobile */}
            <div className="sm:hidden flex justify-center py-1 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800/60">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Scrollable Reader Content with Full Length */}
            <div
              className={`flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8 space-y-4 text-slate-900 dark:text-slate-100 leading-relaxed ${
                fontSize === 'large'
                  ? 'text-base sm:text-lg'
                  : fontSize === 'xlarge'
                  ? 'text-lg sm:text-xl'
                  : 'text-sm sm:text-base'
              }`}
            >
              <FormattedMarkdown content={expandedMessage.content} />
              {/* Generous bottom padding to ensure final words are never hidden */}
              <div className="h-20 w-full" />
            </div>

            {/* Bottom Footer inside reader */}
            <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
              <span>RITU AI • Complete Answer</span>
              <button
                type="button"
                onClick={() => setExpandedMessage(null)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-xs hover:bg-purple-700"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State / Welcome Screen */}
      {messages.length === 0 && (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center pt-2 md:pt-8 text-center animate-in fade-in duration-300">
          <div className="relative mb-3">
            <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-xl shadow-purple-500/25">
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight">R</span>
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-slate-900">
              <Check className="h-3.5 w-3.5" />
            </div>
          </div>

          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            RITU AI <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Assistant</span>
          </h1>
          <p className="mt-1 text-sm md:text-base font-medium text-purple-700 dark:text-purple-300">
            "Socho mat... Bas RITU AI se poochho!"
          </p>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Your all-in-one assistant for homework solving, AI writing, coding, photo analysis, and everyday answers.
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/80 px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
              <Languages className="h-3.5 w-3.5" />
              <span>English • हिन्दी • Hinglish</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Camera className="h-3.5 w-3.5" />
              <span>Photo & Camera Vision</span>
            </span>
          </div>

          <div className="w-full mt-4">
            <ModeHelpers
              mode={currentMode}
              language={currentLanguage}
              onSelectPrompt={onSendPrompt}
            />
          </div>

          <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 text-left">
            <div
              onClick={() => onSendPrompt("Explain Newton's third law with everyday examples step by step.")}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-600 transition-all"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Study Assistant
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Step-by-step math & science homework solver.
              </p>
            </div>

            <div
              onClick={() => onSendPrompt("Write an engaging YouTube video script about 5 smart AI habits.")}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-purple-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-600 transition-all"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <PenTool className="h-4 w-4" />
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                AI Writer
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Emails, scripts, articles, captions & translations.
              </p>
            </div>

            <div
              onClick={() => onSendPrompt("Create a responsive navigation bar in HTML, CSS and JavaScript.")}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-600 transition-all"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Code2 className="h-4 w-4" />
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Coding Assistant
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Write code, fix runtime bugs, and explain logic.
              </p>
            </div>

            <div
              onClick={() => onSendPrompt("हिन्दी में बताएं कि भारत के चंद्रयान 3 मिशन की क्या विशेषताएं थीं?")}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-pink-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-pink-600 transition-all"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400">
                <Languages className="h-4 w-4" />
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                हिन्दी / हिंग्लिश
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                सहज और शुद्ध भाषा में उत्तर प्राप्त करें।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message List */}
      {messages.length > 0 && (
        <div className="mx-auto max-w-3xl space-y-6 pb-36">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const badge = getModeBadge(m.mode);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={m.id}
                className={`w-full flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                {/* Message Container: Full width for model answer so it is never squished */}
                <div
                  className={`flex flex-col min-w-0 ${
                    isUser
                      ? 'max-w-[90%] sm:max-w-[80%] items-end ml-auto'
                      : 'w-full flex-1 max-w-full items-start'
                  }`}
                >
                  {/* Assistant Header Info */}
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}>
                        <BadgeIcon className="h-3 w-3" />
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble: Full width on assistant messages with smooth wrapping */}
                  <div
                    className={`w-full rounded-2xl px-4 py-3 text-sm shadow-xs transition-all ${
                      isUser
                        ? 'w-auto max-w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs font-normal selection:bg-purple-800'
                        : 'border border-slate-200/90 bg-white text-slate-900 rounded-tl-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm'
                    }`}
                  >
                    {/* Render User Attached Image if present */}
                    {isUser && m.image && (
                      <div className="mb-2.5 relative group rounded-xl overflow-hidden border border-white/20 bg-black/20">
                        <img
                          src={m.image.previewUrl}
                          alt={m.image.name || 'User attached photo'}
                          className="max-h-60 w-auto rounded-lg object-contain cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setZoomedImage(m.image!.previewUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedImage(m.image!.previewUrl)}
                          className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white rounded-lg px-2 py-1 text-[10px] opacity-90 hover:opacity-100"
                        >
                          <Maximize2 className="h-3 w-3" />
                          <span>Zoom</span>
                        </button>
                      </div>
                    )}

                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
                    ) : (
                      <div className="overflow-visible break-words">
                        <FormattedMarkdown content={m.content} />
                      </div>
                    )}
                  </div>

                  {/* Assistant Action Bar (Copy, Speak, Full Screen Expand) */}
                  {!isUser && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-slate-400">
                      {/* Expand / Full View Button (पूरा लंबा देखें) */}
                      <button
                        onClick={() => setExpandedMessage(m)}
                        className="flex items-center gap-1 rounded-lg border border-purple-200/70 bg-purple-50/60 dark:border-purple-900/50 dark:bg-purple-950/40 px-2.5 py-1 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                        title="Open in full-screen reader without any screen clipping"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span className="text-[11px] font-semibold">पूरा स्क्रीन में लंबा देखें</span>
                      </button>

                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Copy entire response"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 text-[11px] font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(m.id, m.content, m.language)}
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                          speakingId === m.id
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                        }`}
                        title={speakingId === m.id ? 'Stop audio playback' : 'Listen to response'}
                      >
                        {speakingId === m.id ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* In-flow Visual Typing Indicator when AI is generating */}
          {isLoading && (
            <TypingIndicator mode={currentMode} language={currentLanguage} />
          )}

          {/* Generous bottom spacer so answer is never covered by composer */}
          <div className="h-12 w-full pointer-events-none" />
        </div>
      )}

      {/* Visual Typing Indicator when starting from empty session */}
      {messages.length === 0 && isLoading && (
        <div className="mx-auto max-w-3xl pb-24 w-full">
          <TypingIndicator mode={currentMode} language={currentLanguage} />
        </div>
      )}

      {/* Friendly Error State Banner */}
      {error && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs md:text-sm font-bold text-rose-900 dark:text-rose-200">
                Service Notice
              </h4>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                {error}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry Request</span>
                </button>
                <button
                  onClick={onNewChat}
                  className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 transition-colors"
                >
                  Start Fresh Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Smart Scroll Single Arrow Button */}
      {showScrollBottom && messages.length > 0 && (
        <div className="fixed bottom-24 sm:bottom-26 left-1/2 -translate-x-1/2 z-30 animate-in fade-in zoom-in-90 duration-150">
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 dark:bg-slate-800/95 text-purple-600 dark:text-purple-400 border border-slate-200/90 dark:border-slate-700 shadow-xl shadow-purple-900/10 backdrop-blur-md hover:scale-110 hover:border-purple-300 dark:hover:border-purple-600 active:scale-95 transition-all cursor-pointer group"
          >
            <ChevronDown className="h-5 w-5 sm:h-5.5 sm:w-5.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
