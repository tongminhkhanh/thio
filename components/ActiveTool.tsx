

import React, { useState, useEffect, useRef } from 'react';
import { PromptDefinition } from '../types';
import { generateEducationalContent } from '../services/geminiService';

// Declare globals from CDN
declare const marked: any;
declare const html2pdf: any;
declare const html2canvas: any;
declare const JSZip: any;
declare const saveAs: any;
declare const renderMathInElement: any; // KaTeX Auto-render

// --- File Drop Zone Component ---
interface FileDropZoneProps {
  fieldKey: string;
  accept?: string;
  label: string;
  currentFileName?: string;
  onFileSelect: (key: string, file: File) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ fieldKey, accept, label, currentFileName, onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(fieldKey, e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(fieldKey, e.target.files[0]);
    }
  };

  const isPDF = currentFileName?.toLowerCase().endsWith('.pdf');

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out p-6 flex flex-col items-center justify-center text-center
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900'
        }
        ${currentFileName ? 'border-solid border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {currentFileName ? (
        <div className="animate-fade-in flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isPDF ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
             {isPDF ? (
               <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5v1.5H19v2h-1.5V7h2V6.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
             ) : (
               <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-white break-all max-w-xs">{currentFileName}</p>
            <p className="text-xs text-slate-500 mt-1">Nhấn hoặc kéo thả để thay đổi</p>
          </div>
          <div className="absolute top-2 right-2">
             <div className="bg-green-500 text-white rounded-full p-1 shadow-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             </div>
          </div>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
             </svg>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
             Kéo thả tài liệu vào đây, hoặc <span className="text-blue-600 dark:text-blue-400 underline">duyệt file</span>
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            Hỗ trợ: {accept?.replace(/,/g, ', ') || 'Tất cả định dạng'}
          </p>
        </>
      )}
    </div>
  );
};

interface ActiveToolProps {
  prompt: PromptDefinition;
  onBack: () => void;
}

export const ActiveTool: React.FC<ActiveToolProps> = ({ prompt, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  
  // Dynamic state container
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  
  // Ref for the content to be captured (PDF/Image)
  const contentRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close download/share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset state when prompt changes
  useEffect(() => {
    setResult(null);
    setAudioSrc(null);
    setCopied(false);
    setShowDownloadMenu(false);
    setShowShareMenu(false);
    // Initialize default values
    const defaults: Record<string, any> = {};
    prompt.inputs.forEach(input => {
      if (input.defaultValue) defaults[input.key] = input.defaultValue;
      else defaults[input.key] = '';
    });
    setFormValues(defaults);
  }, [prompt.id]);

  // Trigger KaTeX Math Rendering when result changes
  useEffect(() => {
      if (result && contentRef.current && typeof renderMathInElement !== 'undefined') {
          try {
            renderMathInElement(contentRef.current, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false,
                trust: true
            });
          } catch(e) {
              console.error("KaTeX render error:", e);
          }
      }
  }, [result]);

  const handleInputChange = (key: string, value: string | any) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  // Process file from either input or drag-drop
  const processFileSelection = async (key: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      handleInputChange(key, {
        inlineData: {
          data: base64String,
          mimeType: file.type
        },
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setLoading(true);
    // Set smart loading text
    if (prompt.isAudioTool) setLoadingText("Đang thu âm giả lập giọng người thật...");
    else if (prompt.isImageTool) setLoadingText("AI đang vẽ tranh minh họa...");
    else if (prompt.useThinking) setLoadingText("AI đang suy luận sâu (Thinking)...");
    else if (prompt.useSearch) setLoadingText("Đang tra cứu dữ liệu thực tế...");
    else setLoadingText("Đang soạn thảo nội dung...");

    setResult(null);
    setAudioSrc(null);
    setCopied(false);
    setShowDownloadMenu(false);
    setShowShareMenu(false);
    try {
      const text = await generateEducationalContent(prompt, formValues);
      
      // Check for Audio Data marker
      if (text.startsWith('[AUDIO_DATA]:')) {
          const base64Audio = text.replace('[AUDIO_DATA]:', '');
          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
             bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/mp3' });
          const url = URL.createObjectURL(blob);
          setAudioSrc(url);
          setResult("Audio đã được tạo thành công! Hãy nhấn nút Play bên dưới.");
      } else {
          setResult(text);
      }

    } catch (error) {
      setResult("Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowShareMenu(false);
    }
  };

  // --- Share Handlers ---
  const handleNativeShare = async () => {
    if (!result) return;
    try {
      await navigator.share({
        title: prompt.title,
        text: result,
      });
    } catch (err) {
      console.log('Share cancelled or failed', err);
    }
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    if (!result) return;
    const subject = encodeURIComponent(`[TRỢ LÝ AI] ${prompt.title}`);
    const bodyContent = result.length > 1500 ? result.substring(0, 1500) + "\n\n... (Nội dung quá dài, xem đầy đủ trong ứng dụng)" : result;
    const body = encodeURIComponent(bodyContent);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowShareMenu(false);
  };

  // --- Download Handlers ---

  const downloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `tro-ly-ai-it-ong-${Date.now()}.md`);
    setShowDownloadMenu(false);
  };

  const downloadPDF = () => {
    if (!contentRef.current) return;
    const element = contentRef.current;
    const opt = {
      margin: 15,
      filename: `tro-ly-ai-it-ong-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    setShowDownloadMenu(false);
  };

  const downloadImage = () => {
    if (!contentRef.current) return;
    html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas: any) => {
      canvas.toBlob((blob: any) => {
         saveAs(blob, `tro-ly-ai-it-ong-${Date.now()}.png`);
      });
    });
    setShowDownloadMenu(false);
  };

  const downloadZip = () => {
    if (!result) return;
    const zip = new JSZip();
    zip.file(`noidung.md`, result);
    zip.file(`readme.txt`, `Được tạo bởi TRỢ LÝ AI TH ÍT ONG vào lúc ${new Date().toLocaleString('vi-VN')}`);
    
    zip.generateAsync({type:"blob"}).then(function(content: any) {
        saveAs(content, `tro-ly-ai-export-${Date.now()}.zip`);
    });
    setShowDownloadMenu(false);
  };

  const renderDynamicInput = (field: any) => {
    // Adaptive contrast style: Slate-50 on light, Slate-900 on dark
    const commonClasses = "w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm";
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={formValues[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={`${commonClasses}`}
          >
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt} className="bg-white dark:bg-slate-900">{opt}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={formValues[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={`${commonClasses} ${field.height || 'h-32'} resize-y`}
            placeholder={field.placeholder}
          />
        );
      case 'number':
        return (
           <input
            type="number"
            value={formValues[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder={field.placeholder}
          />
        );
      case 'file':
        return (
          <FileDropZone 
            fieldKey={field.key}
            accept={field.accept}
            label={field.label}
            currentFileName={formValues[field.key]?.fileName}
            onFileSelect={processFileSelection}
          />
        );
      default: // text
        return (
          <input
            type="text"
            value={formValues[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={commonClasses}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Handle Markdown Rendering with Math Protection
  const getMarkdownHtml = (markdown: string) => {
    if (!markdown) return { __html: '' };
    
    // 1. Protect Math Blocks $$...$$ and $...$ by replacing them with placeholders
    // This prevents Markdown parsers from mangling LaTeX syntax (e.g. underscores)
    const mathBlocks: string[] = [];
    
    let protectedText = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
      mathBlocks.push(match);
      return `___MATH_BLOCK_${mathBlocks.length - 1}___`;
    });
    
    // Protect inline math. Be careful not to match empty $$.
    protectedText = protectedText.replace(/(?:\$|\\\()([^\n]+?)(?:\$|\\\))/g, (match) => {
        mathBlocks.push(match);
        return `___MATH_INLINE_${mathBlocks.length - 1}___`;
    });
    
    // 2. Parse Markdown
    let html = "";
    if (typeof marked !== 'undefined') {
      html = marked.parse(protectedText);
    } else {
      html = protectedText;
    }

    // 3. Restore Math Blocks
    // Note: We put back the delimiters $$...$$ so KaTeX can find them in the DOM
    html = html.replace(/___MATH_BLOCK_(\d+)___/g, (match, id) => {
        return mathBlocks[parseInt(id)];
    });
    html = html.replace(/___MATH_INLINE_(\d+)___/g, (match, id) => {
        return mathBlocks[parseInt(id)];
    });

    return { __html: html };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-120px)] animate-fade-in">
      {/* Left Panel: Dynamic Input Form */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <button 
          onClick={onBack} 
          className="self-start flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors mb-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm mr-2 border border-slate-200 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-slate-700 group-hover:border-blue-200 dark:group-hover:border-slate-600 transition-colors">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-semibold">Quay lại Dashboard</span>
        </button>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 transition-colors">
          <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-3 mb-2">
               <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{prompt.title}</h2>
               {prompt.isAudioTool && (
                   <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs font-bold rounded uppercase border border-purple-200 dark:border-purple-800">Audio</span>
               )}
               {prompt.useSearch && (
                   <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold rounded uppercase border border-amber-200 dark:border-amber-800">Live Data</span>
               )}
               {prompt.useThinking && (
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded uppercase border border-indigo-200 dark:border-indigo-800">Thinking</span>
               )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{prompt.description}</p>
          </div>
          
          <div className="space-y-5">
            {prompt.inputs.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 ml-1">
                  {field.label}
                </label>
                {renderDynamicInput(field)}
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`mt-8 w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-md transition-all transform
              ${loading 
                ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed translate-y-0 shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                 {prompt.useThinking ? (
                    // Thinking Pulse Animation
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                    </span>
                 ) : (
                    // Standard Spinner
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                 )}
                <span>{loadingText}</span>
              </span>
            ) : (
              prompt.isAudioTool ? 'Tạo Âm Thanh Ngay' : 'Bắt Đầu Tạo Nội Dung'
            )}
          </button>
        </div>

        {/* Smart Hints */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 text-sm shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-indigo-700 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold text-indigo-800 dark:text-indigo-300">Mẹo tối ưu kết quả:</span>
          </div>
          <ul className="space-y-2">
            {prompt.content.guidelines.slice(0, 3).map((g, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">•</span>
                <span className="font-medium opacity-90 line-clamp-2">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel: Output */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col h-[800px] lg:h-auto transition-colors">
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
             <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} ring-2 ring-green-200 dark:ring-green-900`}></div>
             <h3 className="font-bold text-slate-800 dark:text-slate-200">
                {loading ? (prompt.useThinking ? 'AI đang suy luận sâu (Thinking)...' : 'AI đang làm việc...') : 'Kết Quả Từ AI'}
             </h3>
          </div>
          {(result || audioSrc) && !loading && (
            <div className="flex gap-2 relative">
               {audioSrc && (
                 <a 
                   href={audioSrc} 
                   download={`dmp-podcast-${Date.now()}.mp3`}
                   className="text-xs bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 font-medium"
                 >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Tải MP3
                 </a>
               )}
               
               {result && !audioSrc && (
                   <>
                       {/* SHARE BUTTON & MENU */}
                       <div className="relative" ref={shareMenuRef}>
                         <button 
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className={`text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 font-medium border ${
                                showShareMenu 
                                ? 'bg-indigo-700 text-white border-indigo-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600'
                            }`}
                          >
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                             </svg>
                             Chia sẻ
                          </button>
                          
                          {showShareMenu && (
                             <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up">
                                <div className="py-1">
                                    {/* Native Share */}
                                    {navigator.share && (
                                        <button onClick={handleNativeShare} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                                           <span className="text-indigo-500">
                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                             </svg>
                                           </span>
                                           Gửi qua ứng dụng
                                        </button>
                                    )}

                                    {/* Email */}
                                    <button onClick={handleEmailShare} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                                        <span className="text-blue-500">
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                        </span>
                                        Gửi Email
                                    </button>

                                    {/* Social / Copy Fallback */}
                                    <button onClick={handleCopy} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                                        <span className="text-slate-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        Sao chép nội dung
                                    </button>
                                </div>
                             </div>
                          )}
                       </div>

                       {/* DOWNLOAD BUTTON & MENU */}
                       <div className="relative" ref={downloadMenuRef}>
                         <button 
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            className="text-xs bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 font-medium"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Tải kết quả
                            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {showDownloadMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up">
                                <div className="py-1">
                                    <button onClick={downloadPDF} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors">
                                        <span className="text-red-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5v1.5H19v2h-1.5V7h2V6.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg></span>
                                        Xuất PDF
                                    </button>
                                    <button onClick={downloadImage} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors">
                                        <span className="text-purple-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></span>
                                        Xuất Ảnh (PNG)
                                    </button>
                                    <button onClick={downloadZip} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors">
                                        <span className="text-yellow-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg></span>
                                        Nén ZIP
                                    </button>
                                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                    <button onClick={downloadMarkdown} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors">
                                        <span className="text-slate-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></span>
                                        File Markdown
                                    </button>
                                </div>
                            </div>
                          )}
                       </div>
                   </>
               )}

               {result && !audioSrc && (
                   <button 
                    onClick={handleCopy}
                    className={`text-xs border px-3 py-1.5 rounded-lg shadow-sm transition-all font-semibold flex items-center gap-1 ${
                        copied 
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {copied ? (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đã chép
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Sao chép
                        </>
                    )}
                  </button>
               )}
            </div>
          )}
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-slate-800 custom-scrollbar transition-colors">
          <div ref={contentRef}>
            {!result && !loading && !audioSrc && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-20">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                     <svg className="w-10 h-10 opacity-40 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                     </svg>
                  </div>
                  <p className="font-semibold text-slate-500 dark:text-slate-400 text-lg">Chưa có nội dung</p>
                  <p className="text-sm mt-2">Điền thông tin bên trái và nhấn nút tạo để bắt đầu</p>
               </div>
            )}
            
            {/* Skeleton Loading */}
            {loading && (
               <div className="animate-pulse space-y-4 max-w-3xl mx-auto py-10">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                  </div>
                  <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-6"></div>
                  <div className="space-y-2 mt-6">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6"></div>
                  </div>
                  {prompt.useThinking && (
                    <div className="flex justify-center mt-8">
                        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs rounded-full font-mono animate-bounce">
                            Thinking Process Active...
                        </div>
                    </div>
                  )}
               </div>
            )}

            {result && !audioSrc && (
               <div 
                 className="prose prose-slate dark:prose-invert max-w-none"
                 dangerouslySetInnerHTML={getMarkdownHtml(result)}
               />
            )}

            {audioSrc && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl mb-8 animate-pulse">
                         <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                         </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Podcast Đã Sẵn Sàng!</h3>
                    <audio controls src={audioSrc} className="w-full max-w-md rounded-lg shadow-md" autoPlay />
                    <p className="mt-6 text-slate-500 dark:text-slate-400 max-w-md">
                        Bạn có thể nghe trực tiếp tại đây hoặc tải xuống file MP3 để nghe offline.
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};