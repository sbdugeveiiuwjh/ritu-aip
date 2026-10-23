import React from 'react';
import {
  Image as ImageIcon,
  Camera,
  Sparkles,
  Sliders,
  FileText,
  X,
} from 'lucide-react';

interface AttachmentMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onOpenCamera: () => void;
  onOpenImageGen: () => void;
  onOpenImageEdit: () => void;
  onPickDocument: () => void;
}

export const AttachmentMenuModal: React.FC<AttachmentMenuModalProps> = ({
  isOpen,
  onClose,
  onPickImage,
  onOpenCamera,
  onOpenImageGen,
  onOpenImageEdit,
  onPickDocument,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-900 dark:text-white">Attachment Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {/* 1. Upload Image */}
          <button
            onClick={() => {
              onClose();
              onPickImage();
            }}
            className="flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left hover:bg-blue-50/70 dark:hover:bg-slate-800/80 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Upload Image</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Choose photo from your gallery</div>
            </div>
          </button>

          {/* 2. Take Photo */}
          <button
            onClick={() => {
              onClose();
              onOpenCamera();
            }}
            className="flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left hover:bg-indigo-50/70 dark:hover:bg-slate-800/80 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Take Photo</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Open camera & capture question/math</div>
            </div>
          </button>

          {/* 3. Generate Image */}
          <button
            onClick={() => {
              onClose();
              onOpenImageGen();
            }}
            className="flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left hover:bg-purple-50/70 dark:hover:bg-slate-800/80 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Generate Image</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Create illustrations with AI</div>
            </div>
          </button>

          {/* 4. Edit Image */}
          <button
            onClick={() => {
              onClose();
              onOpenImageEdit();
            }}
            className="flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left hover:bg-teal-50/70 dark:hover:bg-slate-800/80 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400 group-hover:scale-105 transition-transform">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Edit Image</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Adjust and edit your photo</div>
            </div>
          </button>

          {/* 5. Upload Document */}
          <button
            onClick={() => {
              onClose();
              onPickDocument();
            }}
            className="flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Upload Document</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">PDF, TXT, DOC notes</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
