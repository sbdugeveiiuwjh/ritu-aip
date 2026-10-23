import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Award,
  FileText,
  Upload,
  Camera,
  X,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ImageAttachment, LanguageMode } from '../types';

interface StudyStudioViewProps {
  currentLanguage: LanguageMode;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const STUDY_TOOLS = [
  { id: 'solver', label: 'Step-by-Step Problem Solver', icon: HelpCircle, desc: 'Solve math, physics, chemistry questions with detailed step-by-step reasoning' },
  { id: 'explain', label: 'Explain Any Concept Simply', icon: BookOpen, desc: 'Get plain-language explanations with everyday real-world examples and analogies' },
  { id: 'quiz', label: 'Interactive Practice Quiz', icon: Award, desc: 'Generate 5 multiple-choice practice questions with hints and detailed answers' },
  { id: 'summary', label: 'Revision Notes & Formula Sheet', icon: FileText, desc: 'Generate key points, important formulas, and quick exam review notes' },
];

const GRADE_LEVELS = [
  'Class 6 - 8 (Middle School)',
  'Class 9 - 10 (Secondary / Board Exams)',
  'Class 11 - 12 (Higher Secondary)',
  'Competitive Exams (JEE / NEET / UPSC / SSC)',
  'College & University',
];

export const StudyStudioView: React.FC<StudyStudioViewProps> = ({
  currentLanguage,
  onShowToast,
}) => {
  const [selectedTool, setSelectedTool] = useState(STUDY_TOOLS[0].id);
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[1]);
  const [subject, setSubject] = useState('Mathematics');
  const [questionText, setQuestionText] = useState('');
  const [language, setLanguage] = useState<string>(currentLanguage === 'hi' ? 'Hindi' : 'English');
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [studyResult, setStudyResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Please upload an image file (JPG, PNG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachment({
        mimeType: file.type || 'image/jpeg',
        data: result.split(',')[1] || '',
        previewUrl: result,
        name: file.name,
        size: file.size,
      });
      onShowToast('Homework image attached', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSolve = async () => {
    if (!questionText.trim() && !attachment) {
      onShowToast('Please enter a question or upload a photo of the problem', 'error');
      return;
    }
    if (isSolving) return;

    setIsSolving(true);
    setCopied(false);

    let prompt = `Grade Level: ${gradeLevel}
Subject: ${subject}
Task: ${STUDY_TOOLS.find((t) => t.id === selectedTool)?.label}
Language requested: ${language}

Question / Topic:
${questionText.trim() || 'Please solve and explain the attached problem in detail.'}

Requirements:
- Provide accurate verification of equations and calculations.
- Explain each step clearly so a student at this grade level can understand the intuition.
- Use clean formatting without raw LaTeX delimiters like $$.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
              image: attachment
                ? {
                    mimeType: attachment.mimeType,
                    data: attachment.data,
                  }
                : undefined,
            },
          ],
          mode: 'study',
          language: language === 'Hindi' ? 'hi' : language === 'Hinglish' ? 'hinglish' : 'en',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to solve problem');
      }

      setStudyResult(data.text || '');
      onShowToast('Solution ready!', 'success');
    } catch (err: any) {
      onShowToast(err?.message || 'Error communicating with study assistant', 'error');
    } finally {
      setIsSolving(false);
    }
  };

  const handleCopy = async () => {
    if (!studyResult) return;
    try {
      await navigator.clipboard.writeText(studyResult);
      setCopied(true);
      onShowToast('Solution copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not copy', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 pb-32 max-w-6xl mx-auto w-full">
      {/* Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <GraduationCap className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">RITU AI Study Assistant</h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Master any topic • Step-by-step homework solver • Photo problem analyzer
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tool Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Select Study Mode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STUDY_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setSelectedTool(tool.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-semibold">{tool.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Grade / Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Hinglish">Hinglish</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History / GK'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      subject === sub
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Question or Topic Details
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                placeholder="Type your question, paste an equation, or describe what you want explained..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>

            {/* Photo Attachment (For solving photo questions) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Attach Photo of Question / Homework
                </span>
                {attachment && (
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                )}
              </div>

              {attachment ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 p-2 flex items-center gap-3">
                  <img
                    src={attachment.previewUrl}
                    alt="Homework preview"
                    className="h-16 w-16 object-cover rounded-lg border border-slate-300 dark:border-slate-800 shrink-0"
                  />
                  <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    <p className="font-medium truncate">{attachment.name || 'Question Photo'}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Ready for Vision AI analysis</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-slate-400" />
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Snap with Camera
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSolve}
              disabled={isSolving || (!questionText.trim() && !attachment)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSolving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing & Solving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Solve & Explain</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <span>AI Solution & Explanation</span>
              </h3>

              {studyResult && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Solution'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 my-4 flex flex-col justify-center">
              {studyResult ? (
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {studyResult}
                </div>
              ) : isSolving ? (
                <div className="text-center py-12 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <GraduationCap className="h-6 w-6 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Preparing Detailed Study Explanation...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Verifying equations, calculations, and breaking down steps clearly.
                  </p>
                </div>
              ) : (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Ready to learn with RITU AI
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Type any homework question or upload a photo of your textbook/notebook on the left to get instant step-by-step guidance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(att) => {
          setAttachment(att);
          setIsCameraOpen(false);
          onShowToast('Homework photo captured', 'success');
        }}
      />
    </div>
  );
};
