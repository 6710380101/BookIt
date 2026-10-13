import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavigationTab } from '../types';
import { DEMO_ACCOUNTS } from '../data/seedData';

interface HeaderProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  onOpenNewBooking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { userProfile, signOut, signInAsDemoUser } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const getRoleBadge = () => {
    if (userProfile?.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
          ผู้ดูแลระบบ (Admin)
        </span>
      );
    }
    if (userProfile?.role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          ครูผู้สอน
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
        นักเรียน / นักศึกษา
      </span>
    );
  };

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'หน้าหลัก' },
    { id: 'rooms' as NavigationTab, label: 'ห้องและสถานที่' },
    { id: 'my-bookings' as NavigationTab, label: 'การจองของฉัน' },
    { id: 'admin-console' as NavigationTab, label: 'จัดการระบบ (แอดมิน)' },
    { id: 'profile' as NavigationTab, label: 'โปรไฟล์' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between gap-space-md">
        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-space-lg">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-space-sm group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[20px] font-bold text-on-surface tracking-tight">BookIt</span>
              <span className="text-[20px] font-bold text-primary tracking-tight">School</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-space-xs">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-space-md py-space-sm rounded-lg text-[14px] font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-space-sm md:gap-space-md relative">
          {/* Search Button */}
          <button
            type="button"
            aria-label="ค้นหา"
            onClick={() => setCurrentTab('rooms')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              aria-label="การแจ้งเตือน"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest animate-pulse"></span>
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                  <span className="font-bold text-[14px] text-on-surface">การแจ้งเตือนล่าสุด</span>
                  <span className="text-[11px] text-primary">3 รายการ</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="p-2 rounded-lg bg-surface-container-low text-[12px]">
                    <p className="font-semibold text-primary">การจอง #BK-9021 ได้รับอนุมัติแล้ว</p>
                    <p className="text-on-surface-variant text-[11px]">ห้องปฏิบัติการคอมพิวเตอร์ 1 วันนี้ 13:00 - 15:00 น.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low text-[12px]">
                    <p className="font-semibold text-secondary">คำขอจอง #BK-9044 อยู่ระหว่างรออนุมัติ</p>
                    <p className="text-on-surface-variant text-[11px]">หอประชุมใหญ่ อาคาร 4 รอฝ่ายอาคารตรวจสอบ</p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low text-[12px]">
                    <p className="font-semibold text-on-surface">แจ้งเตือนก่อนเข้าใช้ 1 ชั่วโมง</p>
                    <p className="text-on-surface-variant text-[11px]">กรุณารับกุญแจที่ห้องโสตทัศนูปกรณ์ อาคาร 2</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-space-sm bg-surface-container-low pl-space-xs pr-space-md py-space-xs rounded-full shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] hover:bg-surface-container transition-colors"
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[13px]">
                  {userProfile?.name?.slice(0, 2) || 'ผู้ใช้'}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[13px] font-bold text-on-surface leading-tight">
                  {userProfile?.name || 'ผู้ใช้งาน'}
                </span>
                {getRoleBadge()}
              </div>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high p-3 z-50">
                <div className="p-2 border-b border-surface-container-high mb-2">
                  <p className="font-bold text-[14px] text-on-surface">{userProfile?.name}</p>
                  <p className="text-[12px] text-on-surface-variant font-mono">{userProfile?.email}</p>
                  <div className="mt-1">{getRoleBadge()}</div>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-container text-[13px] flex items-center gap-2 text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                    ดูและแก้ไขโปรไฟล์
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('my-bookings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-surface-container text-[13px] flex items-center gap-2 text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                    การจองของฉัน
                  </button>
                  {userProfile?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setCurrentTab('admin-console');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-surface-container text-[13px] flex items-center gap-2 text-secondary font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      ระบบจัดการแอดมิน
                    </button>
                  )}
                </div>

                {/* Quick Role Switcher (For testing roles easily) */}
                <div className="mt-2 pt-2 border-t border-surface-container-high">
                  <p className="text-[11px] font-bold text-outline uppercase px-2 mb-1">
                    สลับบัญชีทดลอง (Fast Switch):
                  </p>
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                    {DEMO_ACCOUNTS.map((demo) => (
                      <button
                        key={demo.id}
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await signInAsDemoUser(demo);
                        }}
                        className={`text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between ${
                          userProfile?.email === demo.email
                            ? 'bg-primary-fixed text-primary font-bold'
                            : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className="truncate">{demo.name}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {demo.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-surface-container-high">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-error-container text-[13px] flex items-center gap-2 text-error font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    ออกจากระบบ (Sign Out)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
