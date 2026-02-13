
import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { TRANSLATIONS } from './constants';
import Dashboard from './components/Dashboard';
import YieldPredictor from './components/YieldPredictor';
import VoiceChat from './components/VoiceChat';
import LanguageSelector from './components/LanguageSelector';
import { LayoutDashboard, Sprout, MessageSquareText, Menu, X, ChevronRight, Moon, Sun } from 'lucide-react';

// Simple navigation state instead of Router for SPA
type View = 'dashboard' | 'predict' | 'assistant';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(Language.ENGLISH);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const t = TRANSLATIONS[currentLang];

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard language={currentLang} />;
      // Pass isDarkMode state to YieldPredictor to fix internal error
      case 'predict': return <YieldPredictor language={currentLang} isDarkMode={isDarkMode} />;
      case 'assistant': return <VoiceChat language={currentLang} />;
      default: return <Dashboard language={currentLang} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center justify-between px-4 py-4 w-full rounded-xl transition-all ${
        currentView === view 
          ? 'bg-agri-600 text-white font-bold shadow-lg shadow-agri-200' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-agri-800 hover:text-agri-700 dark:hover:text-agri-400'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={22} />
        <span className="text-base">{label}</span>
      </div>
      {currentView === view && <ChevronRight size={16} />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-agri-50 dark:bg-agri-950 font-sans transition-colors duration-300">
      
      {/* MOBILE HEADER - Redesigned for Maximum Visibility */}
      <div className="md:hidden bg-white/80 dark:bg-agri-900/80 backdrop-blur-md border-b border-gray-200 dark:border-agri-800 px-5 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-agri-600 p-2 rounded-xl shadow-lg shadow-agri-200">
            <Sprout className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-black text-agri-900 dark:text-white tracking-tight">
            Agri<span className="text-agri-600">Yield</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-agri-800 text-agri-600 dark:text-agri-400 border border-gray-200 dark:border-agri-700 shadow-sm"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* High-visibility Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-agri-600 text-white shadow-lg shadow-agri-200 active:scale-90 transition-all border-2 border-white dark:border-agri-700"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
            {!mobileMenuOpen && (
              <span className="absolute inset-0 rounded-xl bg-agri-600 animate-ping opacity-20 pointer-events-none"></span>
            )}
          </button>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION - Improved Mobile Drawer */}
      <aside className={`
        fixed md:sticky md:top-0 h-[100dvh] w-[300px] bg-white dark:bg-agri-900 border-r border-gray-100 dark:border-agri-800 z-[60] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-[20px_0_50px_rgba(0,0,0,0.1)] md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="hidden md:flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="bg-agri-600 p-2 rounded-xl shadow-lg shadow-agri-200">
                <Sprout className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black text-agri-900 dark:text-white tracking-tight">
                Agri<span className="text-agri-600">Yield</span>
              </h1>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-agri-800 text-gray-500 dark:text-agri-400 hover:bg-gray-100 dark:hover:bg-agri-700 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          <nav className="space-y-4 flex-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t.dashboard} />
            <NavItem view="predict" icon={Sprout} label={t.predict} />
            <NavItem view="assistant" icon={MessageSquareText} label={t.assistant} />
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-100 dark:border-agri-800">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Choose Language</p>
            <div className="grid grid-cols-4 gap-2">
               {Object.values(Language).map((lang) => (
                 <button 
                  key={lang}
                  onClick={() => setCurrentLang(lang)} 
                  className={`text-[10px] font-black py-3 rounded-xl transition-all border flex items-center justify-center uppercase ${
                    currentLang === lang 
                      ? 'bg-agri-900 dark:bg-agri-600 text-white border-agri-900 dark:border-agri-600 shadow-md ring-4 ring-agri-50 dark:ring-agri-950' 
                      : 'bg-gray-50 dark:bg-agri-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-agri-700 hover:bg-gray-100 dark:hover:bg-agri-700 hover:text-agri-700 dark:hover:text-agri-300'
                  }`}
                 >
                   {lang}
                 </button>
               ))}
            </div>

            <div className="mt-8 bg-agri-50 dark:bg-agri-800 p-5 rounded-2xl border border-agri-100 dark:border-agri-700">
               <p className="text-sm text-agri-900 dark:text-agri-100 font-black mb-1">Agri-Yield Pro</p>
               <p className="text-[11px] text-agri-700 dark:text-agri-400 font-medium leading-relaxed opacity-80">Empowering Indian farmers with cutting-edge AI technology.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-5 md:p-10 overflow-y-auto w-full">
        <header className="flex justify-between items-end mb-8 md:mb-12">
           <div className="animate-fade-in">
             <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">{t.welcome}</h2>
             <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-2 font-medium">Monitoring crop health and market trends.</p>
           </div>
           <div className="hidden lg:block">
              <LanguageSelector currentLang={currentLang} onLanguageChange={setCurrentLang} />
           </div>
        </header>

        <div className="max-w-5xl mx-auto">
          <div className="animate-slide-up">
            {renderView()}
          </div>
        </div>
      </main>

      {/* OVERLAY FOR MOBILE - Enhanced with Blur */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-agri-950/40 backdrop-blur-md z-[55] md:hidden transition-all duration-500"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
