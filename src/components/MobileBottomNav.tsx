import React from 'react';
import { NavigationTab } from '../types';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const items = [
    { id: 'dashboard' as NavigationTab, label: 'หน้าหลัก', icon: 'dashboard' },
    { id: 'rooms' as NavigationTab, label: 'รายการห้อง', icon: 'meeting_room' },
    { id: 'my-bookings' as NavigationTab, label: 'การจองของฉัน', icon: 'calendar_month' },
    { id: 'admin-console' as NavigationTab, label: 'จัดการระบบ', icon: 'admin_panel_settings' },
    { id: 'profile' as NavigationTab, label: 'โปรไฟล์', icon: 'account_circle' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t border-surface-container-high">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-space-xs">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-space-xs px-space-sm transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
