import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  PenTool,
  Code2,
  CornerDownLeft,
  Mic,
  MicOff,
  AlertCircle,
  Plus,
  Camera,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { AssistantMode, LanguageMode, ImageAttachment } from '../types';
import { AttachmentMenuModal } from './AttachmentMenuModal';
import { CameraCaptureModal } from './CameraCaptureModal';

interface ChatInputProps {
  onSendMessage: (text: string, image?: ImageAttachment) => void;
  isLoading: boolean;
  currentMode: AssistantMode;
  currentLanguage: LanguageMode;
  onChangeLanguage: (lang: LanguageMode) => void;
  onSelectMode?: (mode: AssistantMode) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  currentMode,
  currentLanguage,
  onSelectMode,
  onShowToast,
}) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check SpeechRecognition support in current browser
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Stop recognition helper
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  // Toggle voice dictation
  const toggleListening = () => {
    setSpeechError(null);

    if (isListening) {
      stopListening();
      return;
    }

    if (!isSpeechSupported) {
      setSpeechError('Voice dictation is supported in Chrome, Edge, and Safari.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();

      // Configure language based on active app language
      if (currentLanguage === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (currentLanguage === 'hinglish') {
        recognition.lang = 'en-IN';
      } else if (currentLanguage === 'en') {
        recognition.lang = 'en-US';
      } else {
        recognition.lang = navigator.language || 'en-US';
      }

      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          setText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone in settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice error (${event.error}). Try again.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError('Unable to start microphone.');
      setIsListening(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast?.('Please choose an image file (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      onShowToast?.('Image size must be under 15MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setAttachment({
        mimeType: file.type || 'image/jpeg',
        data: base64,
        previewUrl: result,
        name: file.name,
        size: file.size,
      });
      onShowToast?.('Image attached for AI analysis', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setText((prev) => {
        const prefix = prev ? `${prev}\n\n` : '';
        return `${prefix}Document Name: ${file.name}\n${content.slice(0, 3000)}`;
      });
      onShowToast?.('Document text extracted to message composer', 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasText = Boolean(text.trim());
    const hasImage = Boolean(attachment);

    if ((!hasText && !hasImage) || isLoading) return;

    if (isListening) {
      stopListening();
    }

    const messageToSend = hasText ? text.trim() : 'Please analyze this attached photo.';
    const imageToSend = attachment || undefined;

    onSendMessage(messageToSend, imageToSend);
    setText('');
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getPlaceholder = () => {
    if (isListening) {
      return currentLanguage === 'hi'
        ? '🎙️ सुन रहा हूँ... बोलिए...'
        : '🎙️ Listening... Speak naturally...';
    }

    if (attachment) {
      return currentLanguage === 'hi'
        ? 'इस फ़ोटो के बारे में क्या पूछना चाहते हैं? सवाल लिखें...'
        : 'Ask a question about this attached image or tap send to analyze...';
    }

    if (currentLanguage === 'hi') {
      switch (currentMode) {
        case 'study':
          return 'कोई भी सवाल या गणित की समस्या पूछें या फ़ोटो भेजें...';
        case 'writer':
          return 'ईमेल, वीडियो स्क्रिप्ट, या लेख लिखने के लिए कहें...';
        case 'coding':
          return 'कोडिंग सवाल पूछें या कोड ठीक करने को कहें...';
        default:
          return 'Socho mat... Bas RITU AI se poochho!';
      }
    }

    switch (currentMode) {
      case 'study':
        return 'Ask any study question, math problem, or attach homework photo...';
      case 'writer':
        return 'Ask to draft an email, video script, essay, or blog post...';
      case 'coding':
        return 'Ask for code, debug an error, or explain an algorithm...';
      default:
        return 'Ask RITU AI anything, attach image, or dictate with 🎙️...';
    }
  };

  const getModeIcon = () => {
    switch (currentMode) {
      case 'study':
        return <BookOpen className="h-3.5 w-3.5 text-emerald-500" />;
      case 'writer':
        return <PenTool className="h-3.5 w-3.5 text-purple-500" />;
      case 'coding':
        return <Code2 className="h-3.5 w-3.5 text-blue-500" />;
      case 'image':
      case 'edit':
        return <ImageIcon className="h-3.5 w-3.5 text-pink-500" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-slate-200/80 bg-white/95 px-3 py-2.5 sm:px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto max-w-3xl w-full">
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          type="file"
          ref={docInputRef}
          accept=".txt,.md,.json,.csv"
          onChange={handleDocumentUpload}
          className="hidden"
        />

        {/* Active Dictation Indicator */}
        {isListening && (
          <div className="mb-2 flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:border-red-900/50 dark:text-red-300 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span>
                {currentLanguage === 'hi'
                  ? 'माइक्रोफ़ोन चालू है • हिन्दी या अंग्रेज़ी में बोलें...'
                  : 'Listening to your voice • Speak naturally...'}
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-[11px] underline font-bold hover:text-red-900 dark:hover:text-red-100"
            >
              Done
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-950/60 dark:border-amber-900/50 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Input Card Container */}
        <form
          onSubmit={handleSubmit}
          className={`relative flex flex-col rounded-2xl border shadow-sm transition-all ${
            isListening
              ? 'border-red-400 bg-red-50/20 ring-2 ring-red-200 dark:border-red-600 dark:bg-red-950/20 dark:ring-red-950'
              : 'border-slate-300/80 bg-slate-50/80 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:border-purple-500 dark:focus-within:bg-slate-900 dark:focus-within:ring-purple-950'
          }`}
        >
          {/* Staged Image Attachment Thumbnail */}
          {attachment && (
            <div className="m-2 p-2 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={attachment.previewUrl}
                  alt="Attachment preview"
                  className="h-12 w-12 object-cover rounded-lg border border-purple-200 dark:border-purple-800 shrink-0"
                />
                <div className="truncate">
                  <div className="text-xs font-semibold text-purple-900 dark:text-purple-200 truncate">
                    {attachment.name || 'Photo ready to send'}
                  </div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400">
                    Vision AI will analyze this with your prompt
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                aria-label="Remove attached image"
                className="rounded-lg p-1 text-purple-600 hover:bg-purple-200/50 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Top toolbar */}
          <div className="flex items-center justify-between border-b border-slate-200/50 px-3 py-1 text-[11px] text-slate-500 dark:border-slate-700/50 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              {getModeIcon()}
              <span className="capitalize">{currentMode} Assistant</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={text.length > 3800 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                {text.length}/4000
              </span>
            </div>
          </div>

          {/* Text Area and Buttons Row */}
          <div className="flex items-end gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2">
            {/* Attachment (+) Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              title="Add attachment, camera, or tools"
              aria-label="Open attachments menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/70 hover:text-purple-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-purple-400 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* Direct Camera Button */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              title="Take a live photo with camera"
              aria-label="Take photo with camera"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/70 hover:text-purple-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-purple-400 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>

            {/* Message Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              maxLength={4000}
              className="max-h-40 min-h-[38px] flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 leading-relaxed"
            />

            <div className="flex items-center gap-1 pb-0.5 shrink-0">
              {/* Dictation / Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                title={
                  isListening
                    ? 'Stop listening'
                    : isSpeechSupported
                    ? 'Dictate with voice'
                    : 'Voice input not supported in this browser'
                }
                aria-label={isListening ? 'Stop listening' : 'Start voice dictation'}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-600 text-white shadow-md animate-pulse ring-4 ring-red-400/30'
                    : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300 active:scale-95 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!text.trim() && !attachment) || isLoading}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 active:scale-95 disabled:opacity-40 disabled:hover:from-purple-600 transition-all"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
          <div className="hidden sm:flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            <span>Enter sends • Shift+Enter newline • Tap 🎙️ to dictate</span>
          </div>
          <div className="sm:hidden flex items-center gap-1 text-[10px]">
            <span>Tap + to attach • Tap 🎙️ to dictate</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400 font-medium">RITU AI</span>
            <span>• Vision & Multimodal</span>
          </div>
        </div>
      </div>

      {/* Attachment Menu Modal */}
      <AttachmentMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onPickImage={() => fileInputRef.current?.click()}
        onOpenCamera={() => setIsCameraOpen(true)}
        onOpenImageGen={() => onSelectMode?.('image')}
        onOpenImageEdit={() => onSelectMode?.('edit')}
        onPickDocument={() => docInputRef.current?.click()}
      />

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(att) => {
          setAttachment(att);
          setIsCameraOpen(false);
          onShowToast?.('Photo captured for AI analysis', 'success');
        }}
      />
    </div>
  );
};
