import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sprout, 
  Stethoscope, 
  ClipboardList, 
  ShieldCheck,
  Droplets,
  Sun
} from 'lucide-react';
import { AnalysisResultData } from '../types';

interface AnalysisResultProps {
  data: AnalysisResultData;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const { isHealthy, plantName, diseaseName, diagnosis, treatment, preventativeMeasures } = data;

  const statusColor = isHealthy ? 'green' : 'amber';
  const StatusIcon = isHealthy ? CheckCircle2 : AlertTriangle;

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-stone-200 overflow-hidden border border-stone-100">
        
        {/* Header Banner */}
        <div className={`
          px-6 py-5 flex items-center justify-between
          ${isHealthy ? 'bg-gradient-to-r from-green-600 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}
        `}>
          <div className="flex items-center gap-3 text-white">
            <StatusIcon className="w-8 h-8" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Health Status</p>
              <h2 className="text-xl font-bold">{isHealthy ? 'Healthy Plant' : 'Attention Needed'}</h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Identity Section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-stone-500 mb-1">
                <Sprout className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wide">Plant Identified</span>
              </div>
              <h1 className="text-3xl font-extrabold text-stone-800">{plantName}</h1>
            </div>
            
            {!isHealthy && (
              <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Diagnosis</p>
                <p className="text-lg font-semibold text-red-700">{diseaseName}</p>
              </div>
            )}
            
            {isHealthy && (
               <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                 <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Condition</p>
                 <p className="text-lg font-semibold text-green-800">Thriving</p>
               </div>
            )}
          </div>

          {/* Diagnosis Description */}
          <div className="prose prose-stone max-w-none">
            <div className="flex items-start gap-3">
              <div className={`mt-1 p-2 rounded-lg ${isHealthy ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-800 mb-2">Assessment</h3>
                <p className="text-stone-600 leading-relaxed">{diagnosis}</p>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Treatment / Care Column */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className={`w-5 h-5 ${isHealthy ? 'text-green-600' : 'text-amber-600'}`} />
                <h3 className="font-bold text-stone-800">
                  {isHealthy ? 'Care Routine' : 'Treatment Plan'}
                </h3>
              </div>
              <ul className="space-y-3">
                {treatment.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-stone-600">
                    <span className={`
                      flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5
                      ${isHealthy ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}
                    `}>
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prevention / Tips Column */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-stone-800">Pro Tips & Prevention</h3>
              </div>
              <ul className="space-y-3">
                {preventativeMeasures.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-stone-600">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;