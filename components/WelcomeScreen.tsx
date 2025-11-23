import React, { useEffect, useState } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isDarkMode, toggleTheme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans transition-colors duration-500 selection:bg-yellow-500 selection:text-slate-900">
      
      {/* Dark Mode Toggle (Absolute Top Right) */}
      {toggleTheme && (
        <div className="absolute top-6 right-6 z-50 animate-fade-in">
             <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all transform hover:scale-110 focus:outline-none"
                title={isDarkMode ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
             >
                {isDarkMode ? (
                   <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                ) : (
                   <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                   </svg>
                )}
             </button>
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Adaptive Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 opacity-90 transition-colors duration-1000"></div>
        
        {/* Abstract Grid Map representing Digital Era */}
        <div className="absolute inset-0 opacity-10 dark:opacity-10 opacity-30" 
             style={{ 
               backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        {/* Floating Glowing Orbs (Abstract Nodes) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 dark:bg-yellow-500 rounded-full blur-[128px] opacity-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight tracking-tight">
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-slate-500 dark:from-white dark:via-blue-100 dark:to-slate-300 drop-shadow-sm">
            TRỢ LÝ AI TH ÍT ONG
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-12 leading-relaxed font-medium">
          Chào mừng Quý Thầy Cô đến với trợ lý trí tuệ nhân tạo toàn diện. 
          Nơi công nghệ tiên tiến nhất hội tụ cùng triết lý giáo dục nhân văn, 
          giúp giải phóng sức lao động và khơi nguồn sáng tạo cho những bài giảng thăng hoa.
        </p>

        {/* Feature Cards (Mini) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
           <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm hover:bg-white dark:hover:bg-white/10 transition-all group shadow-sm hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Giáo Án Tự Động</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tiết kiệm 90% thời gian soạn bài với cấu trúc chuẩn Bộ GD&ĐT.</p>
           </div>
           
           <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm hover:bg-white dark:hover:bg-white/10 transition-all group shadow-sm hover:shadow-md">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Sáng Tạo Đa Phương Tiện</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tạo hình ảnh minh họa, sơ đồ tư duy và kịch bản video trong tích tắc.</p>
           </div>

           <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm hover:bg-white dark:hover:bg-white/10 transition-all group shadow-sm hover:shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Trợ Lý Chuyên Môn</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tư vấn phương pháp dạy học, xử lý tình huống và đánh giá học sinh.</p>
           </div>
        </div>

        {/* CTA Button */}
        <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <button 
                onClick={onStart}
                className="relative flex items-center gap-3 px-10 py-5 bg-white dark:bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform group-hover:scale-[1.02] shadow-2xl border border-transparent"
            >
                <span>Mời Thầy/Cô Bắt Đầu</span>
                <svg className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
        </div>

        {/* Footer Credit */}
        <div className="mt-16 text-slate-500 dark:text-slate-500 text-xs font-mono">
           Powered by Google Gemini 2.5 Flash • Developed by Tòng Minh Khánh trường Tiểu học Ít Ong, xã Mường La, tỉnh Sơn La
        </div>
      </div>
    </div>
  );
};