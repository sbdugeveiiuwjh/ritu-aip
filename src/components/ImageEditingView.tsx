import React, { useState, useRef } from 'react';
import {
  Wand2,
  Upload,
  Camera,
  Download,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ImageAttachment } from '../types';

interface ImageEditingViewProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const PRESET_INSTRUCTIONS = [
  'Add warm sunset lighting and glowing golden hour atmosphere',
  'Turn into digital concept art style with sharp highlights',
  'Convert to black and white with high cinematic contrast',
  'Add futuristic neon accents and glowing cyan highlights',
  'Enhance clarity, sharpen details, and balance exposure',
];

export const ImageEditingView: React.FC<ImageEditingViewProps> = ({ onShowToast }) => {
  const [originalAttachment, setOriginalAttachment] = useState<ImageAttachment | null>(null);
  const [instruction, setInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'edited' | 'original'>('both');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file (JPEG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      onShowToast('Image size must be under 15MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || '';
      setOriginalAttachment({
        mimeType: file.type || 'image/jpeg',
        data: base64Data,
        previewUrl: result,
        name: file.name,
        size: file.size,
      });
      setEditedImageUrl(null);
      setStatusNotice(null);
      onShowToast('Image uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const handleCameraCapture = (attachment: ImageAttachment) => {
    setOriginalAttachment(attachment);
    setEditedImageUrl(null);
    setStatusNotice(null);
    setIsCameraOpen(false);
    onShowToast('Photo captured', 'success');
  };

  const handleEdit = async () => {
    if (!originalAttachment) {
      onShowToast('Please upload or capture an image first', 'error');
      return;
    }
    if (!instruction.trim()) {
      onShowToast('Please enter an editing instruction', 'error');
      return;
    }
    if (isEditing) return;

    setIsEditing(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: {
            mimeType: originalAttachment.mimeType,
            data: originalAttachment.data,
          },
          instruction: instruction.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && data.imageUrl) {
        setEditedImageUrl(data.imageUrl);
        onShowToast('Image edited successfully', 'success');
      } else {
        const msg = data.error || data.details || 'Image editing model returned no output.';
        setStatusNotice(msg);
        onShowToast('Note on image editing', 'info');
      }
    } catch (err: any) {
      const msg = err?.message || 'Server error communicating with image model.';
      setStatusNotice(msg);
      onShowToast('Could not complete image edit', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritu-ai-edited-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Download started', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 pb-32 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <Wand2 className="h-5 w-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">AI Image Editing Studio</h2>
            <p className="text-xs sm:text-sm text-purple-100">
              Transform photos with natural language instructions • Powered by Gemini Vision
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Instructions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Image source section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span>1. Original Image</span>
              {originalAttachment && (
                <button
                  type="button"
                  onClick={() => {
                    setOriginalAttachment(null);
                    setEditedImageUrl(null);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-normal"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              )}
            </h3>

            {originalAttachment ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                <img
                  src={originalAttachment.previewUrl}
                  alt="Original to edit"
                  className="w-full max-h-64 object-contain mx-auto"
                />
                <div className="p-2 text-xs text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  {originalAttachment.name || 'Captured Image'} ({Math.round((originalAttachment.size || 0) / 1024)} KB)
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
                >
                  <Upload className="h-6 w-6 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      Upload from Device
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG, WebP up to 15MB</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Take Live Photo with Camera
                </button>
              </div>
            )}
          </div>

          {/* Instructions Input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              2. Editing Instructions
            </h3>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Describe the changes you want (e.g. Add warm sunlight, make the background blurred, change color tone)..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
            />

            {/* Quick Inspiration Chips */}
            <div className="mt-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_INSTRUCTIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInstruction(preset)}
                    className="text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-left"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleEdit}
              disabled={isEditing || !originalAttachment || !instruction.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isEditing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Image Edit...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Apply AI Edit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Comparison & Results */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-h-[480px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-500" />
                <span>Result & Comparison</span>
              </h3>

              {editedImageUrl && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab('both')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'both'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Side by Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edited')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'edited'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Edited Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('original')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeTab === 'original'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Original Only
                  </button>
                </div>
              )}
            </div>

            {/* Status notice when model quota or response returned a message */}
            {statusNotice && (
              <div className="my-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/30 p-3.5 text-xs text-purple-900 dark:text-purple-200 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">AI Image Generation & Editing Notice:</p>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">{statusNotice}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Tip: RITU AI Vision Q&A is 100% active! You can attach any photo in the main chat to ask questions, solve homework, or get deep analysis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusNotice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                  aria-label="Dismiss notice"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Image Preview Canvas */}
            <div className="flex-1 flex flex-col justify-center items-center my-4">
              {editedImageUrl ? (
                <div className="w-full">
                  {activeTab === 'both' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Original</span>
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/10 dark:bg-slate-950 flex items-center justify-center min-h-[220px]">
                          <img
                            src={originalAttachment?.previewUrl}
                            alt="Original"
                            className="max-h-72 w-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Edited</span>
                        <div className="rounded-xl overflow-hidden border-2 border-purple-500/40 dark:border-purple-500/60 bg-slate-950/10 dark:bg-slate-950 flex items-center justify-center min-h-[220px]">
                          <img
                            src={editedImageUrl}
                            alt="Edited"
                            className="max-h-72 w-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'edited' ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/10 dark:bg-slate-950 flex items-center justify-center min-h-[300px]">
                      <img
                        src={editedImageUrl}
                        alt="Edited"
                        className="max-h-96 w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/10 dark:bg-slate-950 flex items-center justify-center min-h-[300px]">
                      <img
                        src={originalAttachment?.previewUrl}
                        alt="Original"
                        className="max-h-96 w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleEdit}
                      disabled={isEditing}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(editedImageUrl)}
                      className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Edited Image
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                <div className="text-center py-12 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-6 w-6 animate-spin" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Applying AI Transformations...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Processing your image instruction with deep neural vision models.
                  </p>
                </div>
              ) : (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Wand2 className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No edited image yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Upload or snap a photo on the left, enter what you want to modify, and click "Apply AI Edit".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera capture modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
