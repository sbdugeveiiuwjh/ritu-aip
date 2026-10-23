import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ImageAttachment } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (attachment: ImageAttachment) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState(false);

  // Start camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);
    setCapturedPhoto(null);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser. Use file upload instead.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      // Try fallback to any video source without exact facingMode
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (fallbackErr: any) {
        setCameraError(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'Camera permission denied. Please allow camera access in browser settings, or choose an existing photo.'
            : 'Unable to start camera viewfinder on this device. You can choose a photo from your gallery.'
        );
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCapturedPhoto(null);
      setCameraError(null);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  // Take photo from video stream
  const handleTakePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);

    // Stop video stream after snapshot
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Flip camera (front / back)
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Confirm photo
  const handleConfirmPhoto = () => {
    if (!capturedPhoto) return;

    const base64Data = capturedPhoto.split(',')[1] || '';
    onCapture({
      mimeType: 'image/jpeg',
      data: base64Data,
      previewUrl: capturedPhoto,
      name: `Photo_${Date.now()}.jpg`,
      size: Math.round(base64Data.length * 0.75),
    });
    onClose();
  };

  // Fallback file input change
  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size is too large. Please select an image under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const base64Data = result.split(',')[1] || '';
        onCapture({
          mimeType: file.type || 'image/jpeg',
          data: base64Data,
          previewUrl: result,
          name: file.name,
          size: file.size,
        });
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white max-h-[92vh]">
        {/* Top Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60 z-10">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-sm sm:text-base">Camera Capture • RITU AI</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close camera"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative flex-1 bg-black min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{cameraError}</p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Choose Photo from Device</span>
                </button>
                <button
                  onClick={() => startCamera(facingMode)}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            /* Snapshot Review View */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Captured Snapshot"
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-xs flex items-center gap-1.5 border border-emerald-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>Photo Captured</span>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover max-h-[60vh]"
              />

              {/* Viewfinder crosshairs / focus box */}
              <div className="absolute inset-8 border-2 border-white/25 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border border-blue-400/40 rounded-full" />
              </div>

              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>
          )}

          {/* Hidden file input for gallery fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileFallback}
            className="hidden"
          />
        </div>

        {/* Bottom Camera Action Bar */}
        <div className="flex h-20 items-center justify-around border-t border-slate-800 bg-slate-950 px-6">
          {capturedPhoto ? (
            /* Action Buttons after photo captured */
            <>
              <button
                onClick={() => startCamera(facingMode)}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retake</span>
              </button>

              <button
                onClick={handleConfirmPhoto}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Check className="h-4 w-4" />
                <span>Use Photo</span>
              </button>
            </>
          ) : (
            /* Action Buttons for live camera */
            <>
              {/* Choose from gallery fallback */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Select photo from device gallery"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <ImageIcon className="h-5 w-5" />
              </button>

              {/* Shutter Button */}
              <button
                onClick={handleTakePhoto}
                disabled={isInitializing || Boolean(cameraError)}
                aria-label="Capture photo"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all border-4 border-slate-300"
              >
                <div className="h-10 w-10 rounded-full border-2 border-slate-900 bg-white" />
              </button>

              {/* Flip Camera Button */}
              <button
                onClick={handleFlipCamera}
                disabled={isInitializing || Boolean(cameraError)}
                title="Switch front/back camera"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
