import React from 'react';
import { PROMPT_DATA } from '../constants';

interface GuideViewProps {
  onBack: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-12">
      <button 
        onClick={onBack} 
        className="flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
          <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="font-semibold">Quay lại Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 sm:p-12 text-white">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Hướng Dẫn Sử Dụng TRỢ LÝ AI TH ÍT ONG</h1>
          <p className="text-blue-50 text-lg max-w-2xl leading-relaxed font-medium opacity-95">
            Chào mừng bạn đến với phiên bản TRỢ LÝ AI TH ÍT ONG Pro. Dưới đây là các bí quyết giúp bạn khai thác tối đa sức mạnh của AI trong công việc giảng dạy hàng ngày.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {/* Section 1: Golden Rules */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700 border border-yellow-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">3 Nguyên Tắc Vàng Khi Dùng AI</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">1. Input Càng Chi Tiết</h3>
                <p className="text-slate-700 text-sm leading-relaxed">AI giống như một trợ lý mới. Đừng chỉ nói "soạn giáo án". Hãy nói "Soạn giáo án 5E cho lớp 6, bài Tế Bào, tập trung vào thực hành quan sát kính hiển vi".</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">2. Kiểm Chứng Thông Tin</h3>
                <p className="text-slate-700 text-sm leading-relaxed">AI có thể sáng tạo rất hay nhưng đôi khi sai số liệu thực tế. Luôn đọc lại và chỉnh sửa nội dung trước khi mang vào lớp học.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">3. Đối Thoại Liên Tục</h3>
                <p className="text-slate-700 text-sm leading-relaxed">Nếu kết quả chưa ưng ý, hãy thử lại với thông tin bổ sung hoặc thay đổi cách diễn đạt trong phần nhập liệu.</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200 mb-16" />

          {/* Section 2: Tool Reference */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Chi Tiết Tính Năng & Mẹo Sử Dụng</h2>
            </div>

            <div className="space-y-4">
              {PROMPT_DATA.prompts.map((prompt) => (
                <details key={prompt.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 open:shadow-md hover:border-slate-300">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 select-none">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${prompt.isImageTool ? 'bg-pink-600' : 'bg-blue-600'}`}></span>
                      <span className="font-bold text-slate-800 text-lg">{prompt.title}</span>
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">({prompt.id})</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
                    <div className="mt-4 grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Công dụng</h4>
                        <p className="text-slate-700 mb-4 text-sm font-medium">{prompt.description}</p>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Đầu vào yêu cầu</h4>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {prompt.inputs.map(input => (
                            <li key={input.key} className="flex gap-2">
                              <span className="font-mono text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-700 font-semibold">{input.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                          Mẹo từ AI
                        </h4>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                          {prompt.content.guidelines.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <hr className="border-slate-200 my-16" />

          {/* Section 3: New Tech */}
          <section className="bg-slate-900 rounded-2xl p-8 text-white text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Sức Mạnh Cốt Lõi</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
              TRỢ LÝ AI TH ÍT ONG hiện đang chạy trên mô hình <strong>Gemini 2.5 Flash</strong> - mô hình ngôn ngữ mới nhất của Google, tối ưu hóa cho tốc độ xử lý văn bản tiếng Việt và khả năng suy luận logic trong giáo dục.
            </p>
            <div className="inline-flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-1.5 bg-slate-800 rounded-full text-xs font-bold font-mono text-cyan-400 border border-slate-700">Low Latency</span>
              <span className="px-4 py-1.5 bg-slate-800 rounded-full text-xs font-bold font-mono text-purple-400 border border-slate-700">High Reasoning</span>
              <span className="px-4 py-1.5 bg-slate-800 rounded-full text-xs font-bold font-mono text-pink-400 border border-slate-700">Multimodal</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};