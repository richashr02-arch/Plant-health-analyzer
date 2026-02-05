import React from 'react';
import { Leaf, ScanLine } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-stone-200/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-green-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl shadow-inner border border-white/20">
              <Leaf className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={2.5} />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                 <ScanLine className="w-3 h-3 text-green-600" />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight leading-none">
              Botani<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Scan</span>
            </h1>
            <p className="text-[0.6rem] font-bold text-stone-400 uppercase tracking-[0.2em] mt-0.5">
              AI Plant Doctor
            </p>
          </div>
        </div>

        {/* Right side decoration or link */}
        <div className="hidden sm:block">
            <div className="px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-500">
                v1.0 Beta
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;