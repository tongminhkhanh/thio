import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PROMPT_DATA } from './constants';
import { PromptDefinition, AppView } from './types';
import { ToolCard } from './components/ToolCard';
import { ActiveTool } from './components/ActiveTool';
import { GuideView } from './components/GuideView';
import { MenuModal } from './components/MenuModal';
import { ChatInterface } from './components/ChatInterface';
import { WelcomeScreen } from './components/WelcomeScreen';

const App: React.FC = () => {
  // Set initial view to WELCOME
  const [currentView, setCurrentView] = useState<AppView>(AppView.WELCOME);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptDefinition | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter Logic - Enhanced to search in ID, Title, Description, and Tags
  const filteredPrompts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return PROMPT_DATA.prompts;

    return PROMPT_DATA.prompts.filter(prompt => 
      prompt.id.toLowerCase().includes(query) ||
      prompt.title.toLowerCase().includes(query) ||
      prompt.description.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchDropdown(!!value);
    
    // Automatically switch to dashboard to show results if user is searching and hits enter or just types
    // But we prefer the dropdown now, so we only switch if they don't select from dropdown
    if (value && currentView !== AppView.DASHBOARD) {
      setCurrentView(AppView.DASHBOARD);
      setSelectedPrompt(null);
    }
  };

  const handlePromptSelect = (prompt: PromptDefinition) => {
    setSelectedPrompt(prompt);
    setCurrentView(AppView.TOOL);
    setIsMobileSearchOpen(false);
    setShowSearchDropdown(false);
    setSearchQuery(''); // Clear search after selection for clean slate
  };

  const handleBackToDashboard = () => {
    setSelectedPrompt(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleStartApp = () => {
    setCurrentView(AppView.DASHBOARD);
  };

  // Helper to render mini icon in dropdown
  const renderMiniIcon = (id: string) => {
    if (id.includes('AUDIO')) return <span className="text-purple-600 dark:text-purple-400">🔊</span>;
    if (id.includes('IMG')) return <span className="text-pink-600 dark:text-pink-400">🎨</span>;
    if (id.includes('SEARCH')) return <span className="text-amber-600 dark:text-amber-400">🔍</span>;
    if (id.includes('GAME')) return <span className="text-rose-600 dark:text-rose-400">🎮</span>;
    return <span className="text-blue-600 dark:text-blue-400">⚡</span>;
  };

  // Render Welcome Screen
  if (currentView === AppView.WELCOME) {
    return (
      <WelcomeScreen 
        onStart={handleStartApp} 
        isDarkMode={darkMode}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 animate-fade-in">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={handleBackToDashboard} role="button">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200 dark:shadow-none shadow-md">T</div>
            <span className={`text-xl font-extrabold text-slate-800 dark:text-white tracking-tight ${isMobileSearchOpen ? 'hidden sm:block' : 'block'}`}>
              TRỢ LÝ AI TH ÍT ONG
            </span>
          </div>
          
          {/* Search Bar (Desktop) with Dropdown */}
          <div className="hidden md:flex flex-1 max-w-xl relative group z-50">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-full leading-5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner dark:shadow-none"
              placeholder="Tìm công cụ (VD: Giáo án, Toán, 5512...)"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { if(searchQuery) setShowSearchDropdown(true); }}
              autoComplete="off"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              </button>
            )}

            {/* Dropdown Popup */}
            {showSearchDropdown && filteredPrompts.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar divide-y divide-slate-50 dark:divide-slate-700 ring-1 ring-black/5 animate-fade-in-down"
              >
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm bg-slate-50/90 dark:bg-slate-800/90 z-10 border-b border-slate-100 dark:border-slate-700">
                  Gợi ý công cụ ({filteredPrompts.length})
                </div>
                {filteredPrompts.map((prompt) => (
                  <div 
                    key={prompt.id}
                    onClick={() => handlePromptSelect(prompt)}
                    className="p-4 hover:bg-blue-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group flex items-start gap-3"
                  >
                    <div className="mt-1 p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:shadow-sm transition-all">
                      {renderMiniIcon(prompt.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                         <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400">{prompt.title}</h4>
                         {prompt.useThinking && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold border border-indigo-200 dark:border-indigo-800">Think</span>}
                         {prompt.useSearch && <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-200 dark:border-amber-800">Web</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{prompt.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 3).map((tag, i) => (
                           <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:border-blue-100">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
             {showSearchDropdown && filteredPrompts.length === 0 && (
               <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Không tìm thấy công cụ phù hợp</p>
               </div>
             )}
          </div>

          {/* Mobile Search Input (Visible only when toggled on Mobile) */}
          {isMobileSearchOpen && (
            <div className="md:hidden flex-1 relative animate-fade-in-right z-50">
               <input
                type="text"
                autoFocus
                className="block w-full pl-4 pr-10 py-2 border border-blue-300 rounded-full leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-md"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button 
                onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
             {/* Mobile Search Toggle Button */}
             {!isMobileSearchOpen && (
               <button 
                 onClick={() => setIsMobileSearchOpen(true)}
                 className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </button>
             )}

             {/* Dark Mode Toggle */}
             <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-slate-600"
                title={darkMode ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
             >
                {darkMode ? (
                   <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                ) : (
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                   </svg>
                )}
             </button>

             <button
               onClick={() => setCurrentView(AppView.CHAT)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${currentView === AppView.CHAT ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden lg:inline">Trợ lý AI</span>
             </button>

             <button 
                onClick={() => setCurrentView(AppView.GUIDE)}
                className={`hidden sm:block text-sm font-semibold transition-colors px-2 ${currentView === AppView.GUIDE ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
             >
                Hướng dẫn
             </button>
             <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block mx-1"></div>
             
             <button 
               onClick={() => setIsMenuOpen(true)}
               className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-slate-600"
               aria-label="Menu"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentView === AppView.DASHBOARD && (
          <div className="animate-fade-in">
            {!searchQuery && (
              <div className="text-center mb-12 max-w-2xl mx-auto pt-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                  Công cụ hỗ trợ giảng dạy 
                  <span className="text-blue-600 dark:text-blue-400 block mt-1">dành cho Giáo Viên 4.0</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                  Chọn một công cụ bên dưới để bắt đầu tạo giáo án, thiết kế bài giảng hoặc tối ưu hóa nội dung học tập của bạn chỉ trong vài giây.
                </p>
                
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setCurrentView(AppView.CHAT)}
                    className="inline-flex items-center gap-2 text-white font-bold bg-blue-600 px-6 py-3 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-1"
                  >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Chat với AI
                  </button>
                  <button 
                    onClick={() => setCurrentView(AppView.GUIDE)}
                    className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-slate-800 px-6 py-3 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors border border-blue-100 dark:border-slate-700"
                  >
                    Xem hướng dẫn
                  </button>
                </div>
              </div>
            )}

            {/* Search Results Header */}
            {searchQuery && !showSearchDropdown && (
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Kết quả tìm kiếm cho: <span className="text-blue-600 dark:text-blue-400">"{searchQuery}"</span>
                </h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                  {filteredPrompts.length} công cụ
                </span>
              </div>
            )}

            {/* Tool Grid */}
            {filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                {filteredPrompts.map((prompt) => (
                  <ToolCard 
                    key={prompt.id} 
                    prompt={prompt} 
                    onClick={handlePromptSelect} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy công cụ nào</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Thử tìm bằng từ khóa khác như "Giáo án", "Game", "Video" hoặc xem lại danh sách toàn bộ.
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === AppView.TOOL && selectedPrompt && (
          <ActiveTool 
            prompt={selectedPrompt} 
            onBack={handleBackToDashboard} 
          />
        )}

        {currentView === AppView.GUIDE && (
           <GuideView onBack={handleBackToDashboard} />
        )}

        {currentView === AppView.CHAT && (
           <ChatInterface onBack={handleBackToDashboard} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            © 2024 TRỢ LÝ AI TH ÍT ONG. Powered by Google Gemini.
          </p>
          <div className="text-slate-500 dark:text-slate-400 text-xs px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 font-mono">
            {PROMPT_DATA.meta.model}
          </div>
        </div>
      </footer>
      
      {/* Menu Modal Overlay */}
      <MenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
};

export default App;