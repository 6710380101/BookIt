import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block w-full bg-surface-container-low py-space-lg mt-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-6 h-6 rounded-lg bg-primary-container text-on-primary flex items-center justify-center text-[14px]">
            <span className="material-symbols-outlined text-[16px]">meeting_room</span>
          </div>
          <span className="text-[13px] text-on-surface-variant">
            © 2025 BookIt School ระบบจองห้องและทรัพยากรสถานศึกษา
          </span>
        </div>
        <div className="flex items-center gap-space-lg text-on-surface-variant text-[12px]">
          <button
            onClick={() => alert('ระเบียบการใช้งาน: กรุณาจองล่วงหน้าอย่างน้อย 24 ชั่วโมง และปิดระบบไฟ/แอร์หลังใช้งานทุกครั้ง')}
            className="hover:text-on-surface transition-colors"
          >
            ระเบียบการใช้งาน
          </button>
          <button
            onClick={() => alert('แจ้งปัญหาอุปกรณ์: ติดต่อเจ้าหน้าที่ห้องโสตทัศนูปกรณ์ อาคาร 2 โทร. 02-xxx-xxxx')}
            className="hover:text-on-surface transition-colors"
          >
            แจ้งปัญหาอุปกรณ์
          </button>
          <button
            onClick={() => alert('ติดต่อเจ้าหน้าที่: ศูนย์เทคโนโลยีสารสนเทศ อาคารเฉลิมพระเกียรติ ชั้น 3')}
            className="hover:text-on-surface transition-colors"
          >
            ติดต่อเจ้าหน้าที่
          </button>
        </div>
      </div>
    </footer>
  );
};
