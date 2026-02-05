import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Camera, SwitchCamera } from 'lucide-react';
import { AnalysisStatus } from '../types';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
  status: AnalysisStatus;
  onClear: () => void;
  previewUrl: string | null;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, status, onClear, previewUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount or when camera is stopped
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      // Short delay to allow render so videoRef is available
      setTimeout(async () => {
        if (!videoRef.current) return;
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }, 100);
    } catch (err) {
      console.error("Camera initialization failed:", err);
      setIsCameraActive(false);
      alert("Could not access camera. Please ensure you have granted permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          onImageSelected(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            onImageSelected(file);
        }
    }
  }, [onImageSelected]);

  // View: Preview Mode (Image Selected)
  if (previewUrl) {
    return (
      <div className="relative group w-full max-w-md mx-auto aspect-square sm:aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-stone-100 animate-in fade-in zoom-in duration-300">
        <img 
          src={previewUrl} 
          alt="Plant preview" 
          className="w-full h-full object-cover"
        />
        {status !== AnalysisStatus.ANALYZING && status !== AnalysisStatus.GENERATING_VIDEO && (
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 rounded-full shadow-sm transition-all duration-200 backdrop-blur-sm"
            aria-label="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  // View: Camera Mode
  if (isCameraActive) {
    return (
      <div className="w-full max-w-md mx-auto relative rounded-2xl overflow-hidden bg-black aspect-[3/4] sm:aspect-[4/3] shadow-lg animate-in fade-in duration-300">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-8">
          <button 
            onClick={stopCamera}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            onClick={captureImage}
            className="p-1 rounded-full border-4 border-white transition-transform active:scale-95"
          >
            <div className="w-14 h-14 rounded-full bg-white hover:bg-stone-200" />
          </button>

          <div className="w-12" /> {/* Spacer for balance */}
        </div>
      </div>
    );
  }

  // View: Default Upload Mode
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragging 
            ? 'border-green-500 bg-green-50 scale-[1.02]' 
            : 'border-stone-300 bg-white'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 w-full h-full">
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-green-100' : 'bg-stone-100'}`}>
            {isDragging ? (
               <Upload className="w-8 h-8 text-green-600" />
            ) : (
               <ImageIcon className="w-8 h-8 text-stone-400" />
            )}
          </div>
          
          <p className="mb-2 text-lg font-semibold text-stone-700">
            {isDragging ? 'Drop it here!' : 'Upload Plant Photo'}
          </p>
          
          {/* File Input Trigger */}
          <label className="cursor-pointer">
            <span className="text-sm text-stone-500 hover:text-green-600 transition-colors underline decoration-dotted underline-offset-4">
              Click to browse
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
          
          <p className="text-sm text-stone-400 mt-1 mb-6">
            or drag & drop
          </p>

          <div className="flex items-center gap-2 w-full px-8">
            <div className="h-px bg-stone-200 flex-grow"></div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">OR</span>
            <div className="h-px bg-stone-200 flex-grow"></div>
          </div>

          <button
            onClick={startCamera}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Use Camera</span>
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default UploadZone;