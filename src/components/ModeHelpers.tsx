import React, { useState } from 'react';
import {
  BookOpen,
  PenTool,
  Code2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  FileText,
  Send,
  Zap,
} from 'lucide-react';
import { AssistantMode, LanguageMode } from '../types';

interface ModeHelpersProps {
  mode: AssistantMode;
  language: LanguageMode;
  onSelectPrompt: (promptText: string) => void;
}

export const ModeHelpers: React.FC<ModeHelpersProps> = ({
  mode,
  language,
  onSelectPrompt,
}) => {
  // Study Assistant helper state
  const [studyTopic, setStudyTopic] = useState('');
  const [studyLevel, setStudyLevel] = useState<'eli10' | 'deep' | 'steps' | 'quiz' | 'analogy'>('eli10');

  // Writer Assistant helper state
  const [writerTopic, setWriterTopic] = useState('');
  const [writerTone, setWriterTone] = useState('Professional');
  const [writerFormat, setWriterFormat] = useState('Email');

  // Coding Assistant helper state
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLang, setCodeLang] = useState('HTML & Tailwind CSS');
  const [codeTask, setCodeTask] = useState<'website' | 'app' | 'build' | 'debug' | 'explain'>('website');

  const handleStudySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyTopic.trim()) return;

    let instruction = '';
    if (studyLevel === 'eli10') {
      instruction = `Explain "${studyTopic}" in simple language like I am 10 years old. Use a relatable everyday analogy and keep it easy to understand.`;
    } else if (studyLevel === 'steps') {
      instruction = `Break down "${studyTopic}" step-by-step with clear numbered points, key concepts, and core takeaways.`;
    } else if (studyLevel === 'analogy') {
      instruction = `Explain "${studyTopic}" primarily through an intuitive real-world analogy and compare it with something we see in daily life.`;
    } else if (studyLevel === 'quiz') {
      instruction = `Provide a concise explanation of "${studyTopic}", followed by 3 practice multiple-choice questions with answers hidden at the bottom.`;
    } else {
      instruction = `Provide a comprehensive yet intuitive explanation of "${studyTopic}", covering the what, why, and how, with examples.`;
    }

    if (language === 'hi') {
      instruction += ' (कृपया पूरा उत्तर स्पष्ट हिन्दी में दें)';
    }

    onSelectPrompt(instruction);
    setStudyTopic('');
  };

  const handleWriterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writerTopic.trim()) return;

    let prompt = `Help me write a ${writerFormat} about "${writerTopic}". The tone should be ${writerTone}. Make it well-structured, compelling, and ready to use.`;
    if (language === 'hi') {
      prompt += ' (कृपया इसे हिन्दी में लिखें)';
    }

    onSelectPrompt(prompt);
    setWriterTopic('');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeQuery.trim()) return;

    let prompt = '';
    if (codeTask === 'website') {
      prompt = `Write complete, production-ready code for a full website: "${codeQuery}". Use ${codeLang}. Include modern UI styling, responsive design for desktop & mobile, clean structure, and clear instructions to preview/run it in browser.`;
    } else if (codeTask === 'app') {
      prompt = `Write complete mobile app code in ${codeLang} for: "${codeQuery}". Provide clean layout, modern UI components, responsive styling, and clear instructions.`;
    } else if (codeTask === 'build') {
      prompt = `Write clean, efficient ${codeLang} code to: ${codeQuery}. Include comments and an example of how to run it.`;
    } else if (codeTask === 'debug') {
      prompt = `Help me debug and fix this issue in ${codeLang}: ${codeQuery}. Explain what caused the problem and provide the corrected code.`;
    } else {
      prompt = `Explain how the following concept/code works in ${codeLang}: ${codeQuery}. Break down each part clearly.`;
    }

    if (language === 'hi') {
      prompt += ' (कृपया पूरा कोड और उसका विवरण आसान हिन्दी में समझाएं)';
    }

    onSelectPrompt(prompt);
    setCodeQuery('');
  };

  if (mode === 'study') {
    return (
      <div className="mx-auto my-3 w-full max-w-3xl rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-4 shadow-sm dark:border-indigo-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
        <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
          <BookOpen className="h-4 w-4" />
          <span>Study Assistant • Simplify Complex Concepts</span>
        </div>

        <form onSubmit={handleStudySubmit} className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'eli10', label: "Explain Like I'm 10" },
              { id: 'steps', label: 'Step-by-Step' },
              { id: 'analogy', label: 'Everyday Analogy' },
              { id: 'quiz', label: 'Quiz Me (3 Qs)' },
              { id: 'deep', label: 'Comprehensive' },
            ].map((lvl) => (
              <button
                type="button"
                key={lvl.id}
                onClick={() => setStudyLevel(lvl.id as any)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  studyLevel === lvl.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-white'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={language === 'hi' ? "विषय लिखें (उदा. Quantum Physics, Photosynthesis, Stock Market)..." : "Enter topic (e.g., Photosynthesis, Black Holes, Inflation, Blockchain)..."}
              value={studyTopic}
              onChange={(e) => setStudyTopic(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs md:text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-900"
            />
            <button
              type="submit"
              disabled={!studyTopic.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shrink-0"
            >
              <span>Explain</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'writer') {
    return (
      <div className="mx-auto my-3 w-full max-w-3xl rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-white to-pink-50/40 p-4 shadow-sm dark:border-purple-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/40">
        <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-400 font-bold text-sm">
          <PenTool className="h-4 w-4" />
          <span>AI Writer • Emails, Scripts, Articles & Posts</span>
        </div>

        <form onSubmit={handleWriterSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Format</label>
              <select
                value={writerFormat}
                onChange={(e) => setWriterFormat(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Professional Email">Professional Email</option>
                <option value="YouTube / Reels Script">YouTube / Reels Script</option>
                <option value="Blog Article">Blog Article</option>
                <option value="LinkedIn Post">LinkedIn / Social Post</option>
                <option value="Formal Leave / Request Letter">Formal Request / Letter</option>
                <option value="Product Description">Product Description</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Tone</label>
              <select
                value={writerTone}
                onChange={(e) => setWriterTone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Professional & Polite">Professional & Polite</option>
                <option value="Casual & Engaging">Casual & Engaging</option>
                <option value="Persuasive & Compelling">Persuasive & Compelling</option>
                <option value="Inspiring & Story-driven">Inspiring & Story-driven</option>
                <option value="Urgent & Action-oriented">Urgent & Action-oriented</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={language === 'hi' ? "किस विषय पर लिखना है? (उदा. सिक लीव ईमेल, टेक वीडियो स्क्रिप्ट)..." : "What should we write about? (e.g., Sick leave email to manager, Intro script for AI video)..."}
              value={writerTopic}
              onChange={(e) => setWriterTopic(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs md:text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-purple-900"
            />
            <button
              type="submit"
              disabled={!writerTopic.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-all shrink-0"
            >
              <span>Draft</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'coding') {
    return (
      <div className="mx-auto my-3 w-full max-w-3xl rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/40 p-4 shadow-sm dark:border-teal-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40">
        <div className="flex items-center gap-2 mb-3 text-teal-700 dark:text-teal-400 font-bold text-sm">
          <Code2 className="h-4 w-4" />
          <span>Coding Assistant • Write, Explain & Debug Code</span>
        </div>

        <form onSubmit={handleCodeSubmit} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Tech:</span>
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="HTML & Tailwind CSS">HTML & Tailwind CSS</option>
                <option value="React.js / Next.js">React.js / Next.js</option>
                <option value="Flutter (Mobile App)">Flutter (Mobile App)</option>
                <option value="React Native (Android/iOS)">React Native (Mobile)</option>
                <option value="Node.js & Express API">Node.js Express API</option>
                <option value="Python (FastAPI / Flask)">Python (FastAPI/Flask)</option>
                <option value="Kotlin (Android Native)">Kotlin (Android Native)</option>
                <option value="SQL / Database Schema">SQL / Database</option>
              </select>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: 'website', label: 'Full Website' },
                { id: 'app', label: 'Mobile App' },
                { id: 'build', label: 'Component / Code' },
                { id: 'debug', label: 'Fix Bugs' },
                { id: 'explain', label: 'Explain' },
              ].map((task) => (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => setCodeTask(task.id as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    codeTask === task.id
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-white'
                  }`}
                >
                  {task.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={language === 'hi' ? "कोड टास्क लिखें (उदा. CSV फाइल पार्स करना, API फेच, या एरर पेस्ट करें)..." : "Enter coding prompt or paste error (e.g., fetch data from API with error handling)..."}
              value={codeQuery}
              onChange={(e) => setCodeQuery(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs md:text-sm font-mono text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-teal-900"
            />
            <button
              type="submit"
              disabled={!codeQuery.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition-all shrink-0"
            >
              <span>Generate</span>
              <Zap className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // General Chat quick prompt pills
  const generalPrompts = language === 'hi' ? [
    'सौर मंडल के ग्रह और उनकी विशेषताएं बताएं',
    'अच्छे टाइम मैनेजमेंट के 5 वैज्ञानिक तरीके',
    'कंप्यूटर कैसे काम करता है? सरल शब्दों में समझाएं',
    'एक स्वस्थ दैनिक दिनचर्या कैसी होनी चाहिए?',
  ] : [
    'Explain the 80/20 rule with practical life examples',
    'How do search engines index and rank web pages?',
    'Give me 5 actionable productivity habits for students',
    'Draft a polite follow-up email after a job interview',
  ];

  return (
    <div className="mx-auto my-3 flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 px-2">
      {generalPrompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(p)}
          className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-slate-800 transition-all text-left"
        >
          <span className="text-blue-500 mr-1.5">✦</span>
          <span>{p}</span>
        </button>
      ))}
    </div>
  );
};
