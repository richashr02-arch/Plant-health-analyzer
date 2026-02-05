import React from 'react';
import { Loader2, Clapperboard } from 'lucide-react';

interface LoadingStateProps {
  isVideo?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isVideo = false }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
      <div className="relative">
        <div className={`absolute inset-0 ${isVideo ? 'bg-purple-400' : 'bg-green-400'} blur-xl opacity-20 rounded-full animate-pulse`}></div>
        <div className="relative bg-white p-4 rounded-full shadow-sm border border-stone-100">
            {isVideo ? (
                <Clapperboard className="w-10 h-10 text-purple-600 animate-bounce" />
            ) : (
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            )}
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-stone-800">
        {isVideo ? 'Creating Magic...' : 'Analyzing your plant...'}
      </h3>
      <p className="mt-2 text-stone-500 text-center max-w-xs">
        {isVideo 
            ? 'Veo is generating a cinematic video of your plant. This may take a minute.'
            : 'Our AI is examining the leaves, identifying the species, and checking for diseases.'
        }
      </p>
    </div>
  );
};

export default LoadingState;