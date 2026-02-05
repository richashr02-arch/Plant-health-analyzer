import React from 'react';
import { LayoutDashboard, Microscope, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentPage: 'home' | 'insights';
  onNavigate: (page: 'home' | 'insights') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex flex-col h-auto md:h-screen sticky top-0 md:fixed z-40">
      <div className="p-6 border-b border-stone-100 hidden md:block">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Navigation</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPage === 'home'
              ? 'bg-green-50 text-green-700 font-semibold shadow-sm ring-1 ring-green-200'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Microscope className={`w-5 h-5 ${currentPage === 'home' ? 'text-green-600' : 'text-stone-400'}`} />
            <span>Plant Analyzer</span>
          </div>
          {currentPage === 'home' && <ChevronRight className="w-4 h-4 text-green-500" />}
        </button>

        <button
          onClick={() => onNavigate('insights')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPage === 'insights'
              ? 'bg-green-50 text-green-700 font-semibold shadow-sm ring-1 ring-green-200'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className={`w-5 h-5 ${currentPage === 'insights' ? 'text-green-600' : 'text-stone-400'}`} />
            <span>Review Insights</span>
          </div>
          {currentPage === 'insights' && <ChevronRight className="w-4 h-4 text-green-500" />}
        </button>
      </nav>

      <div className="p-6 bg-stone-50 md:bg-transparent mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 text-white shadow-lg">
          <p className="font-bold text-sm mb-1">BotaniScan Pro</p>
          <p className="text-xs text-green-100 opacity-80 mb-3">Upgrade for unlimited batch processing.</p>
          <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg w-full transition-colors font-medium">
            Learn More
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
