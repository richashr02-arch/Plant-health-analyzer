import React, { useState } from 'react';
import UploadZone from './UploadZone';
import AnalysisResult from './AnalysisResult';
import LoadingState from './LoadingState';
import { AnalysisStatus, AnalysisResultData } from '../types';
import { analyzePlantImage, generatePlantVideo } from '../services/geminiService';
import { AlertCircle, Leaf, Sparkles } from 'lucide-react';

const PlantAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setVideoUrl(null);
    setStatus(AnalysisStatus.IDLE);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleClear = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);

    try {
      const data = await analyzePlantImage(file);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleAnimate = async () => {
    if (!file) return;

    // Check for API Key selection for Veo
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.openSelectKey) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        if (!hasKey) {
            await aiStudio.openSelectKey();
        }
    }

    setStatus(AnalysisStatus.GENERATING_VIDEO);
    setError(null);

    try {
        const url = await generatePlantVideo(file);
        setVideoUrl(url);
        setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
        console.error(err);
        if (err.message && err.message.includes("Requested entity was not found")) {
             // Reset key selection on specific 404 error
             const aiStudio = (window as any).aistudio;
             if (aiStudio && aiStudio.openSelectKey) {
                 await aiStudio.openSelectKey();
             }
             setError("API Key issue detected. Please try again.");
        } else {
             setError(err.message || 'Failed to generate video.');
        }
        setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 relative">
        {/* Hero Section */}
        {status === AnalysisStatus.IDLE && !result && !videoUrl && (
          <div className="text-center mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
              Is your plant <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">healthy?</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
              Upload a photo to diagnose diseases instantly or create a cinematic video of your plant.
            </p>
          </div>
        )}

        {/* Action Area */}
        <div className="flex flex-col gap-8">
          
          {/* Upload & Preview */}
          <div className={`${(result || videoUrl) ? 'hidden' : 'block'}`}>
            <UploadZone 
              onImageSelected={handleImageSelected} 
              status={status}
              onClear={handleClear}
              previewUrl={previewUrl}
            />
          </div>

          {/* Action Buttons */}
          {file && status === AnalysisStatus.IDLE && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in zoom-in duration-300">
              <button
                onClick={handleAnalyze}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <Leaf className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Analyze Plant
              </button>
              
              <button
                onClick={handleAnimate}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-lg font-semibold rounded-full shadow-lg hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span>Animate with Veo</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {(status === AnalysisStatus.ANALYZING || status === AnalysisStatus.GENERATING_VIDEO) && (
            <LoadingState isVideo={status === AnalysisStatus.GENERATING_VIDEO} />
          )}

          {/* Error Message */}
          {status === AnalysisStatus.ERROR && error && (
            <div className="max-w-md mx-auto p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Operation Failed</h4>
                <p className="text-sm opacity-90">{error}</p>
                <button 
                  onClick={() => setStatus(AnalysisStatus.IDLE)}
                  className="mt-2 text-xs font-semibold underline hover:text-red-800"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Video Result Section */}
          {status === AnalysisStatus.SUCCESS && videoUrl && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-3xl shadow-2xl">
                        <div className="bg-black rounded-[20px] overflow-hidden relative">
                             <video 
                                src={videoUrl} 
                                controls 
                                autoPlay 
                                loop 
                                className="w-full max-w-lg aspect-video object-cover"
                             />
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <h3 className="text-2xl font-bold text-stone-800">Your Plant in Motion</h3>
                        <p className="text-stone-500 mt-2">Generated with Veo 3.1</p>
                    </div>
                 </div>
                 
                 <div className="flex justify-center pt-8 pb-12">
                   <button 
                    onClick={handleClear}
                    className="px-6 py-2.5 bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-600 font-medium rounded-full hover:bg-white hover:border-stone-300 transition-all shadow-sm hover:shadow-md"
                   >
                     Start Over
                   </button>
                 </div>
             </div>
          )}

          {/* Analysis Result Section */}
          {status === AnalysisStatus.SUCCESS && result && (
             <div className="space-y-6">
                 {/* Mini Preview in Result Mode */}
                 {previewUrl && (
                     <div className="flex justify-center animate-in fade-in duration-700 delay-200">
                         <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md rotate-3 hover:rotate-0 transition-transform duration-300">
                             <img src={previewUrl} alt="Analyzed Plant" className="w-full h-full object-cover" />
                         </div>
                     </div>
                 )}
                 <AnalysisResult data={result} />
                 
                 <div className="flex justify-center pt-8 pb-12">
                   <button 
                    onClick={handleClear}
                    className="px-6 py-2.5 bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-600 font-medium rounded-full hover:bg-white hover:border-stone-300 transition-all shadow-sm hover:shadow-md"
                   >
                     Analyze Another Plant
                   </button>
                 </div>
             </div>
          )}
        </div>
    </div>
  );
};

export default PlantAnalyzer;
