import React, { useState } from 'react';
import {
  Code2,
  Bug,
  FileCode,
  Terminal,
  Copy,
  Check,
  Play,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { LanguageMode } from '../types';

interface CodingStudioViewProps {
  currentLanguage: LanguageMode;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CODING_TOOLS = [
  { id: 'generator', label: 'Code Generator', icon: Code2, desc: 'Generate complete, clean code based on your requirements' },
  { id: 'debugger', label: 'Error Diagnostics & Bug Fix', icon: Bug, desc: 'Paste your code and error message to pinpoint and fix the bug' },
  { id: 'explainer', label: 'Code Explainer', icon: FileCode, desc: 'Get line-by-line breakdown and architectural explanation' },
  { id: 'refactor', label: 'Refactor & Optimize', icon: Terminal, desc: 'Make code cleaner, faster, modular, and modern' },
];

const CODE_LANGUAGES = [
  'HTML / CSS',
  'JavaScript',
  'TypeScript',
  'Python',
  'React / Next.js',
  'Node.js',
  'SQL',
];

export const CodingStudioView: React.FC<CodingStudioViewProps> = ({
  onShowToast,
}) => {
  const [selectedTool, setSelectedTool] = useState(CODING_TOOLS[0].id);
  const [selectedLang, setSelectedLang] = useState(CODE_LANGUAGES[0]);
  const [promptText, setPromptText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      onShowToast('Please enter your coding task or requirement', 'error');
      return;
    }
    if (isGenerating) return;

    setIsGenerating(true);
    setCopied(false);

    let instruction = `Language / Stack: ${selectedLang}
Task Type: ${CODING_TOOLS.find((t) => t.id === selectedTool)?.label}

User Prompt:
${promptText.trim()}`;

    if (selectedTool === 'debugger' && errorMessage.trim()) {
      instruction += `\n\nEncountered Error Message / Stack Trace:\n${errorMessage.trim()}`;
    }

    instruction += `\n\nGuidelines:
- Provide clean, modern, well-formatted code.
- Always wrap code inside standard markdown code blocks (\`\`\`${selectedLang.toLowerCase().includes('python') ? 'python' : selectedLang.toLowerCase().includes('html') ? 'html' : 'typescript'}).
- Clearly explain how to run or test the code.
- Diagnose why the error occurred if debugging.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: instruction }],
          mode: 'coding',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      setCodeOutput(data.text || '');
      onShowToast('Code generated successfully', 'success');
    } catch (err: any) {
      onShowToast(err?.message || 'Error communicating with coding assistant', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!codeOutput) return;
    try {
      await navigator.clipboard.writeText(codeOutput);
      setCopied(true);
      onShowToast('Code copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not copy', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 pb-32 max-w-6xl mx-auto w-full">
      {/* Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <Code2 className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">RITU AI Coding Assistant</h2>
            <p className="text-xs sm:text-sm text-blue-100">
              HTML/CSS • JavaScript • Python • Bug Diagnostics • Clean Production Code
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tool Mode selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Task Mode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CODING_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setSelectedTool(tool.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-semibold">{tool.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Programming Language / Framework
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CODE_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLang(lang)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      selectedLang === lang
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-medium'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {selectedTool === 'debugger' ? 'Code to Debug' : 'What would you like to build?'}
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={selectedTool === 'debugger' ? 5 : 4}
                placeholder={
                  selectedTool === 'debugger'
                    ? 'Paste your broken code here...'
                    : 'Describe what the component, function, or script should do (e.g. A responsive login card in Tailwind, A Python script to scrape CSV table)...'
                }
                className="w-full font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            {selectedTool === 'debugger' && (
              <div>
                <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                  Error Message or Console Output (Optional)
                </label>
                <textarea
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  rows={2}
                  placeholder="Paste error logs (e.g. TypeError: undefined is not a function at line 14)..."
                  className="w-full font-mono text-xs rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20 p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{selectedTool === 'debugger' ? 'Diagnose & Fix Code' : 'Generate Code'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Code Output */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-500" />
                <span>Generated Output</span>
              </h3>

              {codeOutput && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 my-4 flex flex-col justify-center">
              {codeOutput ? (
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  {codeOutput}
                </div>
              ) : isGenerating ? (
                <div className="text-center py-12 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Code2 className="h-6 w-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Crafting Clean Code...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Writing syntax-checked, production-ready code with explanations.
                  </p>
                </div>
              ) : (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Code2 className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Code ready when you are
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Select language and requirements on the left, then click Generate to get clean code with explanations and execution instructions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
