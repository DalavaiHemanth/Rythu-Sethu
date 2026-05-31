import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wheat, Languages, Landmark, Sparkles, BookOpen, FileCheck2, MapPin, ChevronRight, PhoneCall, FileText, Calculator } from 'lucide-react';
import { TRANSLATIONS, LanguageKey } from './data/translations';
import { TELANGANA_DISTRICTS_EN } from './data/staticData';
import Chatbot from './components/Chatbot';
import SchemeQuiz from './components/SchemeQuiz';
import CenterFinder from './components/CenterFinder';
import KnowledgeBase from './components/KnowledgeBase';
import FarmerTools from './components/FarmerTools';

interface AgriNewsItem {
  id: number;
  title: string;
  date: string;
}

export default function App() {
  const [language, setLanguage] = useState<LanguageKey>('te'); // Default to Telugu as per state target!
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz' | 'map' | 'rag' | 'tools'>('chat');
  
  // Shared farm profile context
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean> | null>(() => {
    try {
      const saved = localStorage.getItem('rythu_sethu_quiz_answers');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Siddipet'); // Seed default
  
  // News Ticker state
  const [news, setNews] = useState<AgriNewsItem[]>([]);
  const [newsIndex, setNewsIndex] = useState<number>(0);

  const t = TRANSLATIONS[language];

  // Fetch seasonal news from server API
  const fetchAgriNews = async () => {
    try {
      const response = await fetch(`/api/agri-news?lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (err) {
      console.error('Failed to trigger background news call:', err);
    }
  };

  useEffect(() => {
    fetchAgriNews();
  }, [language]);

  // Rotate news ticker
  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [news]);

  const handleLanguageChange = (lang: LanguageKey) => {
    setLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col font-sans select-none" id="rythu-sethu-app">
      
      {/* 1. Global Marquee / Emergency State Ticker */}
      <div className="bg-crop-900 border-b border-crop-950 text-white py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono font-medium md:px-6">
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded-sm bg-crop-550 text-[10px] uppercase font-bold animate-pulse text-white">
              Sahaayam
            </span>
            <span className="truncate text-stone-200">
              {news.length > 0 ? news[newsIndex].title : "Farmers State Advisory Portal Live."}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-stone-300">
            <span>District:</span>
            <select
              id="global-district-sc"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-stone-800 text-white font-mono font-semibold py-0.5 px-2 rounded-sm border border-stone-700 text-[11px]"
            >
              {TELANGANA_DISTRICTS_EN.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Brand Hero Container: Geometric Balance Professional Header */}
      <header className="bg-crop-600 text-white border-b-4 border-crop-510 py-5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo and Titles */}
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-crop-600 shrink-0">
              <Wheat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-display font-black tracking-tight flex items-baseline gap-2">
                  RYTHU SETHU <span className="font-light text-sm opacity-90">రైతు సేతు</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  TG Govt
                </span>
              </div>
              <p className="text-xs text-stone-100/90 font-mono tracking-wide uppercase font-medium mt-0.5">
                Government of Telangana • Agri-Advisory Portal
              </p>
            </div>
          </div>

          {/* Quick-Action Panel */}
          <div className="flex items-center flex-wrap gap-4 justify-center">
            
            {/* Lang Swapper in Geometric Theme */}
            <div className="flex gap-2 bg-crop-700/40 p-1 rounded-lg border border-white/10" id="language-capsules">
              <button
                id="lang-te-btn"
                onClick={() => handleLanguageChange('te')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                  language === 'te'
                    ? 'bg-crop-510 text-crop-600 font-extrabold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                తెలుగు
              </button>
              <button
                id="lang-en-btn"
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-crop-510 text-crop-600 font-extrabold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                ENGLISH
              </button>
              <button
                id="lang-ur-btn"
                onClick={() => handleLanguageChange('ur')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                  language === 'ur'
                    ? 'bg-crop-510 text-crop-600 font-extrabold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                اردو
              </button>
            </div>

            {/* Direct Dial Hotline indicator */}
            <div className="bg-crop-700/60 border border-white/10 px-4 py-2.5 rounded-lg text-left hidden sm:flex items-center gap-2.5 text-xs text-white font-sans font-medium">
              <PhoneCall className="w-5.5 h-5.5 text-crop-510" />
              <div>
                <p className="font-bold text-white leading-tight">Farmer Call-Center</p>
                <a href="tel:18001801551" className="font-mono text-[11px] text-crop-100 hover:underline font-bold">1800-180-1551</a>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* 3. Welcome Advisory Banner Card */}
      <section className="bg-earth-200 border-b border-earth-200/50 py-10 px-4 md:px-8 relative overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-crop-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:px-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-xl md:text-2xl font-display font-bold text-crop-900 tracking-tight">
              {t.welTitle}
            </h2>
            <p className="text-xs md:text-sm text-stone-700 leading-relaxed font-sans font-medium">
              {t.welDesc}
            </p>
          </div>
          <div className="bg-crop-600 text-white px-5 py-4 rounded-2xl flex items-center gap-3.5 shadow-sm shrink-0 uppercase tracking-wide text-xs font-mono font-bold border-b-2 border-crop-800">
            <Sparkles className="w-5 h-5 text-crop-100 animate-pulse" />
            <span>AI Guided Advisories Active</span>
          </div>
        </div>
      </section>

      {/* 4. Tab Navigation Hub */}
      <nav className="border-b border-earth-100 bg-white sticky top-0 z-40 shadow-xs px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center md:px-6 overflow-x-auto custom-scrollbar no-scrollbar py-2">
          <div className="flex gap-2 w-full justify-between sm:justify-start">
            
            {/* Tab 1 */}
            <button
              id="tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 py-3 px-5 text-xs font-sans font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-crop-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              {t.chatTab}
            </button>

            {/* Tab 2 */}
            <button
              id="tab-quiz"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 py-3 px-5 text-xs font-sans font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-crop-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              {t.quizTab}
            </button>

            {/* Tab 3 */}
            <button
              id="tab-map"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 py-3 px-5 text-xs font-sans font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-crop-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              {t.mapTab}
            </button>

            {/* Tab 4 */}
            <button
              id="tab-rag"
              onClick={() => setActiveTab('rag')}
              className={`flex items-center gap-2 py-3 px-5 text-xs font-sans font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'rag'
                  ? 'bg-crop-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {t.ragTab}
            </button>

            {/* Tab 5 */}
            <button
              id="tab-tools"
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 py-3 px-5 text-xs font-sans font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-crop-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              {t.toolsTab}
            </button>

          </div>
        </div>
      </nav>

      {/* 5. Primary Application Viewport with Entrance Transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28 }}
            className="w-full"
          >
            {activeTab === 'chat' && (
              <Chatbot
                language={language}
                quizAnswers={quizAnswers}
                selectedDistrict={selectedDistrict}
              />
            )}

            {activeTab === 'quiz' && (
              <SchemeQuiz
                language={language}
                onQuizCompleted={(answers) => {
                  setQuizAnswers(answers);
                  // Optionally redirect to Chat with recommendations loaded
                  setNews((prev) => [
                    ...prev,
                    { id: Date.now(), title: "Interactive schemes analysis generated based on land profile.", date: "Just now" }
                  ]);
                }}
              />
            )}

            {activeTab === 'map' && (
              <CenterFinder
                language={language}
              />
            )}

            {activeTab === 'rag' && (
              <KnowledgeBase
                language={language}
                onDocumentAdded={() => {
                  fetchAgriNews(); // Reload background elements
                }}
              />
            )}

            {activeTab === 'tools' && (
              <FarmerTools
                language={language}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 6. Footer Signature */}
      <footer className="border-t border-earth-150 bg-white py-8 text-center text-xs text-stone-500 font-sans font-medium px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 md:px-8">
          <p>
            Rythu Sethu — Telangana State Farmers Support & Agricultural Schemes Resource
          </p>
          <div className="flex gap-4 font-mono text-[10px] text-stone-400">
            <span>District Coordinate In-sync</span>
            <span>•</span>
            <span>Gemini LLM Guarded</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
