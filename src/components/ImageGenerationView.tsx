import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  AlertCircle,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { GeneratedImageRecord } from '../types';

interface ImageGenerationViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const STYLES = [
  'Cinematic',
  'Digital Art',
  'Photorealistic',
  'Anime & Manga',
  '3D Render',
  'Watercolor',
  'Fantasy Landscape',
  'Cyberpunk Neon',
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 (Square)' },
  { id: '16:9', label: '16:9 (Landscape)' },
  { id: '9:16', label: '9:16 (Story / Reel)' },
  { id: '4:3', label: '4:3 (Classic)' },
];

export const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ onShowToast }) => {
  const [prompt, setPrompt] = useState('A futuristic Indian city at sunset with glowing neon lights, floating vehicles and modern architecture');
  const [style, setStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImage, setActiveImage] = useState<GeneratedImageRecord | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, aspectRatio }),
      });

      const data = await res.json();

      if (data.success && data.imageUrl) {
        const record: GeneratedImageRecord = {
          id: 'gen_' + Date.now(),
          prompt,
          style,
          aspectRatio,
          imageUrl: data.imageUrl,
          timestamp: Date.now(),
        };
        setActiveImage(record);
        onShowToast('Image generated successfully!', 'success');
      } else {
        // Transparent explanation when image generation model quota is unprovisioned on key
        setStatusNotice(data.error || 'AI Image generation model requires quota on your Gemini project. You can ask vision questions in AI Chat.');
      }
    } catch (err: any) {
      setStatusNotice(err?.message || 'Failed to connect to image generation service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!activeImage) return;
    const a = document.createElement('a');
    a.href = activeImage.imageUrl;
    a.download = `RITU_AI_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Image downloaded', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>AI Image Generation • RITU AI</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn your imagination into visuals with AI art prompts, styles, and aspect ratios.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Prompt Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Image Description Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate (e.g. A futuristic Indian city at sunset, cinematic lighting)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-purple-950 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Visual Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {ASPECT_RATIOS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating Visual with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>
        </div>

        {/* Notice Card if image model quota is not active on key */}
        {statusNotice && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Status Information</span>
            </div>
            <p className="leading-relaxed">{statusNotice}</p>
          </div>
        )}

        {/* Generated Image Showcase */}
        {activeImage ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Generated Visual</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-black/90 flex items-center justify-center max-h-[500px]">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.prompt}
                referrerPolicy="no-referrer"
                className="max-h-[480px] w-auto object-contain rounded-xl"
              />
            </div>
            <p className="text-xs text-slate-500 italic">Prompt: "{activeImage.prompt}" • {activeImage.style}</p>
          </div>
        ) : (
          /* Placeholder Preview matching the template */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 mb-3">
              <ImageIcon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Image Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Type your creative description above, pick a style like Cinematic or Digital Art, and tap Generate Image.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
