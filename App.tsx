import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PlantAnalyzer from './components/PlantAnalyzer';
import InsightsPage from './pages/InsightsPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'insights'>('home');

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-200/40 rounded-full blur-[80px] mix-blend-multiply animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-emerald-100/60 rounded-full blur-[60px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-yellow-100/40 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <Header />

      <div className="flex flex-col md:flex-row flex-grow">
        {/* Navigation Sidebar */}
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={(page) => setCurrentPage(page)} 
        />

        {/* Main Content Area */}
        <main className="flex-grow overflow-auto h-[calc(100vh-64px)] scroll-smooth">
          {currentPage === 'home' ? (
            <PlantAnalyzer />
          ) : (
            <InsightsPage />
          )}
          
          {/* Footer - Only show on bottom of content area */}
          <footer className="py-6 text-center text-stone-400 text-sm">
            <p>© {new Date().getFullYear()} BotaniScan AI. Powered by Google Gemini & Veo.</p>
          </footer>
        </main>
      </div>

    </div>
  );
};

export default App;
