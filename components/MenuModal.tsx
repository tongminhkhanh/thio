import React from 'react';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity opacity-100" 
        onClick={onClose}
      ></div>

      {/* Sidebar Panel */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-slide-in-right p-6 flex flex-col border-l border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mt-6 mb-8 border-b border-slate-100 pb-6">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-md">T</div>
             <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">TRỢ LÝ AI TH ÍT ONG</h2>
           </div>
           <p className="text-slate-500 text-sm font-medium">Trợ lý AI toàn diện cho giáo viên</p>
        </div>

        <div className="space-y-8 flex-1">
          {/* Section: Features */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Giới Thiệu
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
              TRỢ LÝ AI TH ÍT ONG là ứng dụng hỗ trợ giáo viên Việt Nam tối ưu hóa quy trình làm việc. Ứng dụng cung cấp các công cụ AI mạnh mẽ để tự động hóa việc soạn giáo án, thiết kế bài giảng, tạo đề kiểm tra và giải quyết các tình huống sư phạm.
            </p>
          </section>

          {/* Section: Developer */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                Thông Tin Nhà Phát Triển
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nhà phát triển</p>
                  <p className="font-bold text-slate-800 text-sm">Tòng Minh Khánh</p>
                  <p className="text-[10px] text-slate-500">TH Ít Ong - Mường La - Sơn La</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                   <a href="mailto:tongminhkhanh@gmail.com" className="font-bold text-slate-800 hover:text-blue-600 transition-colors text-sm">tongminhkhanh@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Điện thoại</p>
                   <a href="tel:0326439774" className="font-bold text-slate-800 hover:text-green-600 transition-colors text-sm">0326439774</a>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Donate */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Mời Cà Phê
            </h3>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-amber-200/30 rounded-full blur-xl"></div>
               <div className="relative z-10 space-y-3">
                 <div className="flex justify-between items-center border-b border-amber-200/50 pb-2">
                    <span className="text-slate-500 text-xs font-medium">Ngân hàng</span>
                    <span className="font-bold text-slate-800 text-sm">BIDV</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-amber-200/50 pb-2">
                    <span className="text-slate-500 text-xs font-medium">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-slate-900 font-mono text-base">4130101771</span>
                         <button onClick={() => navigator.clipboard.writeText("4130101771")} className="text-amber-600 hover:text-amber-700" title="Sao chép">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                         </button>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 text-xs font-medium">Chủ tài khoản</span>
                    <span className="font-bold text-slate-900 text-sm uppercase">TONG MINH KHANH</span>
                 </div>
               </div>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-normal">
             Bản quyền thuộc về nhà phát triển <strong>Tòng Minh Khánh</strong>.<br/>Trường Tiểu học Ít Ong, xã Mường La, tỉnh Sơn La.<br/>Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
};
