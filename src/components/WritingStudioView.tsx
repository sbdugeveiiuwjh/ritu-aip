import React, { useState } from 'react';
import {
  PenTool,
  Mail,
  Video,
  Share2,
  ShoppingBag,
  Languages,
  CheckCheck,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Send,
} from 'lucide-react';
import { LanguageMode } from '../types';

interface WritingStudioViewProps {
  currentLanguage: LanguageMode;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const WRITING_TOOLS = [
  { id: 'article', label: 'Article Writing', icon: PenTool, placeholder: 'Topic of the article (e.g. Benefits of AI in Education, Clean Energy Trends)...' },
  { id: 'email', label: 'Email Writing', icon: Mail, placeholder: 'Email purpose (e.g. Requesting leave for 2 days, Follow up on job application)...' },
  { id: 'youtube', label: 'YouTube Script', icon: Video, placeholder: 'Video title & concept (e.g. 5 Coding habits to succeed, Tech review intro)...' },
  { id: 'social', label: 'Social Media Caption', icon: Share2, placeholder: 'Post topic, product or photo context with hashtags...' },
  { id: 'product', label: 'Product Description', icon: ShoppingBag, placeholder: 'Product name, key features, and target audience...' },
  { id: 'translate', label: 'Translation', icon: Languages, placeholder: 'Enter text to translate between English, हिन्दी, or other languages...' },
  { id: 'grammar', label: 'Grammar Correction', icon: CheckCheck, placeholder: 'Paste text to correct grammar, polish tone, and fix errors...' },
  { id: 'rewrite', label: 'Rewriting & Summarizing', icon: RotateCcw, placeholder: 'Paste content to rewrite into concise, powerful bullet points or summary...' },
];

export const WritingStudioView: React.FC<WritingStudioViewProps> = ({
  currentLanguage,
  onShowToast,
}) => {
  const [selectedTool, setSelectedTool] = useState(WRITING_TOOLS[0].id);
  const [topic, setTopic] = useState('');
  const [lang, setLang] = useState<string>(currentLanguage === 'hi' ? 'Hindi' : 'English');
  const [tone, setTone] = useState('Professional');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeTool = WRITING_TOOLS.find((t) => t.id === selectedTool) || WRITING_TOOLS[0];

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setCopied(false);

    const prompt = `Task: ${activeTool.label}
Topic/Content: ${topic.trim()}
Language: ${lang}
Tone: ${tone}

Please produce a high-quality, comprehensive, and ready-to-use output formatted cleanly.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          mode: 'writer',
          language: lang === 'Hindi' ? 'hi' : lang === 'Hinglish' ? 'hinglish' : 'en',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setGeneratedResult(data.text || '');
      onShowToast('Draft created successfully', 'success');
    } catch (err: any) {
      onShowToast(err?.message || 'Error communicating with writing assistant', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult);
      setCopied(true);
      onShowToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not copy', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 pb-32 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <PenTool className="h-4 w-4" />
            </span>
            <span>Writing Assistant • RITU AI</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Draft articles, emails, YouTube scripts, social captions, and translations effortlessly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Tool Selector */}
        <div className="lg:col-span-3 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Writing Tools
          </div>
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {WRITING_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left shrink-0 transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
                  <span className="whitespace-nowrap">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Configuration Form */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>{activeTool.label}</span>
            <span className="text-[11px] font-normal text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
              Ready
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic or Content
            </label>
            <textarea
              rows={5}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={activeTool.placeholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-purple-950 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Professional">Professional</option>
                <option value="Casual & Friendly">Casual & Friendly</option>
                <option value="Persuasive">Persuasive</option>
                <option value="Inspiring">Inspiring</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Generating Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output / Result Panel */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Generated Result</span>
            {generatedResult && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 mt-3 overflow-y-auto pr-1">
            {generatedResult ? (
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                {generatedResult}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <PenTool className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium">Your generated writing will appear here.</p>
                <p className="text-[11px] text-slate-400 mt-1">Enter a topic and tap Generate to start.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
