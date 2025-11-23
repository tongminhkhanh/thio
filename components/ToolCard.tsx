import React from 'react';
import { PromptDefinition } from '../types';

interface ToolCardProps {
  prompt: PromptDefinition;
  onClick: (prompt: PromptDefinition) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ prompt, onClick }) => {
  // Enhanced Icon Mapping based on ID content
  const renderIcon = () => {
    const id = prompt.id;
    
    // AUDIO / PODCAST (NEW)
    if (id.includes('PODCAST') || id.includes('AUDIO')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />;
    }
    // RESEARCH / SEARCH (NEW)
    if (id.includes('RESEARCH') || id.includes('SEARCH')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
    }
    // GAME DESIGN (NEW)
    if (id.includes('GAME')) {
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />;
    }

    // IMAGE & ART
    if (id.includes('IMG') || id.includes('DECOR')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />;
    }
    // PLAN & STRATEGY (5E, SKKN)
    if (id.includes('PLAN') || id.includes('INITIATIVE') || id.includes('CHECKLIST')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />;
    }
    // SUMMARIZE & SLIDES (New separate check)
    if (id.includes('SUMMARIZE')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
    }
    // SLIDE & PRESENTATION
    if (id.includes('SLIDE') || id.includes('PPT')) {
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />;
    }

    // MINDMAP & STRUCTURE (Removed SUMMARIZE from here)
    if (id.includes('MAP') || id.includes('MATRIX')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />;
    }
    // QUIZ & ASSESSMENT
    if (id.includes('TEST') || id.includes('QUEST') || id.includes('RUBRIC') || id.includes('ERROR')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
    }
    // COMMUNICATION & PARENTS
    if (id.includes('PARENT') || id.includes('BEHAVIOR')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />;
    }
    // SCHOOL MANAGEMENT (NEW)
    if (id.includes('SCHOOL') || id.includes('TEACHER_EVAL') || id.includes('ENROLLMENT') || id.includes('MEETING')) {
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
    }
    // CREATIVE (POEM, STORY, VIDEO)
    if (id.includes('STORY') || id.includes('POEM') || id.includes('VIDEO') || id.includes('REAL_WORLD')) {
       return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />;
    }
    // COACH & TRANSLATE
    if (id.includes('COACH') || id.includes('TRANSLATE')) {
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
    }

    // Default
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />;
  };

  // Color generator based on ID - adjusted for better contrast/vibrancy
  const getBgColor = () => {
    const id = prompt.id;
    // Determine color based on ID prefix for semantic coloring
    if (id.includes('PODCAST') || id.includes('AUDIO')) return 'bg-purple-600 group-hover:bg-purple-700'; // Audio
    if (id.includes('RESEARCH') || id.includes('SEARCH')) return 'bg-amber-600 group-hover:bg-amber-700'; // Search
    if (id.includes('GAME')) return 'bg-rose-500 group-hover:bg-rose-600'; // Game
    
    if (id.includes('IMG') || id.includes('DECOR')) return 'bg-pink-600 group-hover:bg-pink-700';
    if (id.includes('PLAN') || id.includes('5E')) return 'bg-blue-600 group-hover:bg-blue-700';
    if (id.includes('TEST') || id.includes('MATRIX')) return 'bg-purple-600 group-hover:bg-purple-700';
    if (id.includes('BEHAVIOR') || id.includes('PARENT')) return 'bg-orange-600 group-hover:bg-orange-700';
    if (id.includes('STORY') || id.includes('VIDEO')) return 'bg-indigo-600 group-hover:bg-indigo-700';
    if (id.includes('COACH') || id.includes('TRANSLATE') || id.includes('SUMMARIZE')) return 'bg-emerald-600 group-hover:bg-emerald-700';
    if (id.includes('SLIDE') || id.includes('PPT')) return 'bg-orange-500 group-hover:bg-orange-600';
    if (id.includes('SCHOOL') || id.includes('TEACHER_EVAL') || id.includes('ENROLLMENT') || id.includes('MEETING')) return 'bg-red-700 group-hover:bg-red-800'; // Specific for School Management
    
    // Fallback cyclic colors
    const colors = [
      'bg-blue-600 group-hover:bg-blue-700',
      'bg-teal-600 group-hover:bg-teal-700',
      'bg-cyan-600 group-hover:bg-cyan-700',
    ];
    const index = prompt.id.length % colors.length;
    return colors[index];
  };

  return (
    <div 
      onClick={() => onClick(prompt)}
      className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1"
    >
      <div className={`h-24 flex items-center justify-center transition-colors duration-300 ${getBgColor()}`}>
        <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {renderIcon()}
        </svg>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {prompt.title}
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 flex-1 line-clamp-3 leading-relaxed">
          {prompt.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {prompt.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[11px] uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-bold border border-slate-200 dark:border-slate-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};