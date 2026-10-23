import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, BookOpen, PenTool, Code2, Clock } from 'lucide-react';
import { AssistantMode, LanguageMode } from '../types';

interface TypingIndicatorProps {
  mode: AssistantMode;
  language: LanguageMode;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ mode, language }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Dynamic status messages based on mode and language
  const getSteps = () => {
    const isHindi = language === 'hi';
    const isHinglish = language === 'hinglish';

    if (mode === 'study') {
      if (isHindi) {
        return [
          'सवालों व सूत्रों का विश्लेषण हो रहा है...',
          'चरणबद्ध (Step-by-step) हल तैयार किया जा रहा है...',
          'गणनाओं की पुष्टि व आसान व्याख्या लिखी जा रही है...',
        ];
      }
      return [
        'Analyzing problem & verifying equations...',
        'Formulating step-by-step solution...',
        'Writing clear concept explanation...',
      ];
    }

    if (mode === 'coding') {
      if (isHindi) {
        return [
          'लॉजिक और सिंटैक्स का विश्लेषण हो रहा है...',
          'क्लीन व मॉडर्न कोड तैयार किया जा रहा है...',
          'कोड विवरण और रन करने के निर्देश लिखे जा रहे हैं...',
        ];
      }
      return [
        'Analyzing logic and dependencies...',
        'Generating clean, tested code...',
        'Adding clear explanation and run instructions...',
      ];
    }

    if (mode === 'writer') {
      if (isHindi) {
        return [
          'रचनात्मक प्रारूप और विषयवस्तु का विश्लेषण...',
          'सुंदर भाषा और सटीक टोन में ड्राफ्ट तैयार हो रहा है...',
          'अंतिम रूप देकर लिखा जा रहा है...',
        ];
      }
      return [
        'Formulating structure & tone...',
        'Drafting compelling, polished content...',
        'Finalizing ready-to-use text...',
      ];
    }

    // General AI Chat
    if (isHindi) {
      return [
        'RITU AI आपके सवाल पर विचार कर रही है...',
        'सटीक व सरल भाषा में उत्तर तैयार किया जा रहा है...',
        'अंतिम स्पष्ट उत्तर लिखा जा रहा है...',
      ];
    }

    if (isHinglish) {
      return [
        'RITU AI soch rahi hai...',
        'Clear aur simple bhasha me answer draft ho raha hai...',
        'Final response type ho raha hai...',
      ];
    }

    return [
      'RITU AI is thinking...',
      'Formulating a well-reasoned answer...',
      'Synthesizing complete response...',
    ];
  };

  const steps = getSteps();

  // Cycle through step messages every 2.4 seconds
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 2400);

    return () => clearInterval(stepInterval);
  }, [steps.length]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getModeIcon = () => {
    switch (mode) {
      case 'study':
        return <BookOpen className="h-3.5 w-3.5 text-emerald-500" />;
      case 'coding':
        return <Code2 className="h-3.5 w-3.5 text-blue-500" />;
      case 'writer':
        return <PenTool className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Brain className="h-3.5 w-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="w-full flex gap-2.5 sm:gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* AI Avatar with subtle pulsing glow */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 mt-0.5">
        <Sparkles className="h-4 w-4 animate-spin text-purple-200 duration-1000" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
        </span>
      </div>

      <div className="flex flex-col min-w-0 w-full flex-1 max-w-full items-start">
        {/* Header Status & Elapsed Badge */}
        <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/50">
            {getModeIcon()}
            <span>RITU AI</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <Clock className="h-2.5 w-2.5" />
            <span>{elapsedSeconds}s</span>
          </span>
        </div>

        {/* Typing Card Container */}
        <div className="w-full rounded-2xl rounded-tl-xs border border-purple-200/80 bg-white/95 dark:border-purple-900/40 dark:bg-slate-900/95 px-4 py-3.5 shadow-md shadow-purple-500/5 ring-1 ring-purple-500/20 transition-all">
          {/* Active status caption with crossfade */}
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <div className="flex items-center gap-2 truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
              <span className="truncate transition-opacity duration-300">
                {steps[currentStepIndex]}
              </span>
            </div>

            {/* 4 Staggered Bouncing Dots with Gradient Waves */}
            <div className="flex items-center gap-1 shrink-0 py-0.5">
              <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce [animation-delay:-0.36s] shadow-xs shadow-purple-500/50"></span>
              <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:-0.24s] shadow-xs shadow-indigo-500/50"></span>
              <span className="h-2 w-2 rounded-full bg-pink-500 dark:bg-pink-400 animate-bounce [animation-delay:-0.12s] shadow-xs shadow-pink-500/50"></span>
              <span className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-300 animate-bounce shadow-xs shadow-purple-500/50"></span>
            </div>
          </div>

          {/* Animated typing shimmer skeleton lines */}
          <div className="space-y-2 mt-3 w-full max-w-lg">
            <div className="h-2.5 bg-gradient-to-r from-purple-200/80 via-indigo-100 to-purple-200/80 dark:from-purple-950/60 dark:via-indigo-900/40 dark:to-purple-950/60 rounded-full animate-pulse w-[85%]" />
            <div className="flex items-center gap-2">
              <div className="h-2.5 bg-gradient-to-r from-purple-200/80 via-indigo-100 to-purple-200/80 dark:from-purple-950/60 dark:via-indigo-900/40 dark:to-purple-950/60 rounded-full animate-pulse w-[55%]" />
              {/* Blinking typing cursor */}
              <span className="inline-block h-3 w-1 bg-purple-600 dark:bg-purple-400 rounded-full animate-ping" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
