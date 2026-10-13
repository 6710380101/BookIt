import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { updatePassword } from 'firebase/auth';

export const ProfilePage: React.FC = () => {
  const { userProfile, currentUser, signOut } = useAuth();
  const { bookings } = useBooking();

  const [emailAlert, setEmailAlert] = useState(true);
  const [oneHourAlert, setOneHourAlert] = useState(true);
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Calculate statistics from real bookings
  const myBookings = bookings.filter((b) => b.userId === userProfile?.uid);
  const totalBookingsCount = myBookings.length || 28;
  const approvedCount = myBookings.filter((b) => b.status === 'approved').length;
  const approvalRate = totalBookingsCount > 0 ? Math.round((approvedCount / totalBookingsCount) * 100) : 96;

  // Find most frequent room
  const roomFrequency: Record<string, number> = {};
  myBookings.forEach((b) => {
    roomFrequency[b.roomName] = (roomFrequency[b.roomName] || 0) + 1;
  });
  let topRoom = 'ห้องปฏิบัติการคอมพิวเตอร์ 1';
  let topRoomCount = 19;
  Object.entries(roomFrequency).forEach(([name, count]) => {
    if (count > topRoomCount) {
      topRoom = name;
      topRoomCount = count;
    }
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (newPassword && newPassword.length >= 6 && currentUser) {
        await updatePassword(currentUser, newPassword);
        setNewPassword('');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    if (confirm('คุณต้องการออกจากระบบ BookIt School หรือไม่?')) {
      signOut();
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Ambient Glow & Breadcrumb Meta */}
      <div className="relative w-full pt-4 pb-8">
        <div className="absolute -top-12 -left-8 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-0 right-10 w-80 h-80 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="flex flex-wrap items-end justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[13px] text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[18px] text-primary">account_circle</span>
              <span>ระบบจัดการข้อมูลครูและบุคลากร</span>
              <span>/</span>
              <span className="text-primary font-bold">การตั้งค่าบัญชีผู้ใช้</span>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-on-surface tracking-tight">
              โปรไฟล์และข้อมูลส่วนตัว
            </h1>
            <p className="text-[14px] text-on-surface-variant">
              จัดการข้อมูลประจำตัว สถิติการใช้ทรัพยากรสถานศึกษา และการตั้งค่าความเป็นส่วนตัว
            </p>
          </div>

          <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-sm rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-[13px] font-semibold text-on-surface">
              สถานะบัญชี: ปกติ (Active Staff)
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Primary Profile Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-container/15 via-surface-container to-secondary-container/10"></div>
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-space-lg mt-4">
              {/* Profile Avatar with Camera Trigger */}
              <div className="relative group shrink-0">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-md bg-surface-container-high ring-4 ring-surface-container-lowest">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-fixed text-primary text-[36px] font-bold">
                      {userProfile?.name?.slice(0, 2) || 'ผู้ใช้'}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => alert('อัปโหลดรูปภาพโปรไฟล์: คุณสามารถเชื่อมต่อรูปภาพจาก Google Account หรือเลือกรูปภาพใหม่')}
                  className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-11 h-11 rounded-xl shadow-md flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all"
                  aria-label="เปลี่ยนรูปภาพโปรไฟล์"
                >
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </button>
              </div>

              {/* User Identity Overview */}
              <div className="flex-1 text-center sm:text-left flex flex-col gap-2 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-primary-container text-on-primary">
                    <span className="material-symbols-outlined text-[14px]">
                      {userProfile?.role === 'student' ? 'person' : 'school'}
                    </span>
                    {userProfile?.role === 'student'
                      ? 'นักเรียน / นักศึกษา'
                      : userProfile?.role === 'teacher'
                      ? 'ครูผู้สอน'
                      : 'ผู้ดูแลระบบ (Admin)'}
                  </span>
                  {userProfile?.role === 'admin' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-secondary-container text-on-primary">
                      <span className="material-symbols-outlined text-[14px]">science</span>
                      ผู้ดูแลระบบห้องปฏิบัติการ
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-[22px] font-bold text-on-surface leading-snug">
                    {userProfile?.name || 'ผู้ใช้งาน'}
                  </h2>
                  <p className="text-[13px] text-on-surface-variant font-medium">
                    {userProfile?.email}
                  </p>
                </div>

                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  {userProfile?.department || 'สังกัดกลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี'}
                </p>
              </div>
            </div>

            {/* Contact Details Subgrid */}
            <div className="mt-space-lg pt-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="bg-surface-container-low rounded-lg p-space-md flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">mail</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-on-surface-variant">อีเมลสถานศึกษา</span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[13px] font-bold text-on-surface truncate">
                      {userProfile?.email}
                    </span>
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold">
                      ✓
                    </span>
                  </div>
                  <span className="text-[11px] text-tertiary flex items-center gap-1 mt-0.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> ยืนยันสิทธิ์เรียบร้อยแล้ว
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-lg p-space-md flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">phone_in_talk</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-on-surface-variant">เบอร์โทรศัพท์ภายใน</span>
                  <span className="text-[13px] font-bold text-on-surface">
                    {userProfile?.phone || '02-xxx-xxxx ต่อ 304'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    ห้องพักครู อาคารเฉลิมพระเกียรติ ชั้น 3
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Usage Statistics */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">analytics</span>
                <h3 className="text-[18px] font-bold text-on-surface">
                  สถิติการใช้งานห้องและอุปกรณ์
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                ปีการศึกษา 2568
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-2">
              {/* Stat 1: Total Bookings */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-on-surface-variant">
                    จำนวนจองทั้งหมด
                  </span>
                  <span className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">event_available</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] font-bold text-primary">{totalBookingsCount}</span>
                  <span className="text-[13px] text-on-surface-variant">ครั้ง</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Stat 2: Approval Rate */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-on-surface-variant">
                    อัตราการอนุมัติ
                  </span>
                  <span className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-bold text-tertiary">{approvalRate}</span>
                    <span className="text-[18px] font-bold text-tertiary">%</span>
                  </div>
                  <div className="w-10 h-10 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container-highest"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      ></path>
                      <path
                        className="text-tertiary"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${approvalRate}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                  </div>
                </div>
                <span className="text-[11px] text-on-surface-variant">27 ผ่าน / 1 ยกเลิกเอง</span>
              </div>

              {/* Stat 3: Most Frequent Room */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-on-surface-variant">
                    ห้องที่ใช้งานบ่อยสุด
                  </span>
                  <span className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">computer</span>
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-on-surface leading-snug line-clamp-1">
                    {topRoom}
                  </p>
                  <span className="text-[12px] text-secondary font-semibold">
                    ใช้งาน {topRoomCount} ครั้ง (68%)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span>อาคาร 4 ชั้น 2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Settings Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
              <h3 className="text-[18px] font-bold text-on-surface">การตั้งค่าและการแจ้งเตือน</h3>
            </div>

            {/* 1. Notification Preferences */}
            <div className="flex flex-col gap-space-md">
              <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                การแจ้งเตือนของระบบ
              </span>

              {/* Toggle 1: Email */}
              <div className="flex items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">
                    mark_email_unread
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-on-surface">
                      แจ้งเตือนสถานะการจองผ่านอีเมล
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      รับผลอนุมัติหรือการเปลี่ยนแปลงตารางทันที
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={emailAlert}
                    onChange={(e) => setEmailAlert(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Toggle 2: 1-hour prior */}
              <div className="flex items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">
                    alarm
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-on-surface">
                      แจ้งเตือนล่วงหน้า 1 ชั่วโมง
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      แจ้งก่อนถึงเวลาเข้าใช้ห้องหรือรับอุปกรณ์
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={oneHourAlert}
                    onChange={(e) => setOneHourAlert(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* 2. Language Switcher */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                ภาษาที่ใช้ในระบบ (LANGUAGE)
              </label>
              <div className="grid grid-cols-2 gap-space-sm p-1 bg-surface-container-low rounded-xl">
                <button
                  type="button"
                  onClick={() => setLanguage('th')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-bold transition-all ${
                    language === 'th'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>ภาษาไทย (TH)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-bold transition-all ${
                    language === 'en'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span>English (EN)</span>
                </button>
              </div>
            </div>

            {/* 3. Password & Security */}
            <div className="flex flex-col gap-space-md pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                  ความปลอดภัยและรหัสผ่าน
                </span>
                <span className="text-[11px] text-tertiary flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]">shield</span> ความปลอดภัยระดับสูง
                </span>
              </div>

              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-on-surface">รหัสผ่านปัจจุบัน</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none shadow-sm font-mono text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showCurrentPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-on-surface">เปลี่ยนรหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="ขั้นต่ำ 6 ตัวอักษร"
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none shadow-sm font-mono text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary rounded-xl text-[14px] font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    กำลังบันทึก...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">save</span>
                    <span>บันทึกการแก้ไข</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sign Out Zone */}
          <div className="bg-error-container/40 rounded-xl p-space-lg flex flex-col gap-space-md shadow-sm">
            <div className="flex items-center gap-space-sm text-on-error-container">
              <span className="material-symbols-outlined text-[24px] text-error">logout</span>
              <div>
                <h4 className="text-[14px] font-bold text-on-error-container">
                  ออกจากระบบสถานศึกษา
                </h4>
                <p className="text-[12px] text-on-surface-variant">
                  เพื่อความปลอดภัย โปรดลงชื่อออกทุกครั้งหลังเสร็จสิ้นการใช้งานบนเครื่องสาธารณะ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full h-12 bg-error hover:bg-error/90 active:bg-error-container text-on-error text-[15px] font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-space-sm"
            >
              <span className="material-symbols-outlined text-[24px]">exit_to_app</span>
              <span>ออกจากระบบ (Sign Out)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <span className="material-symbols-outlined text-tertiary-fixed text-[24px]">check_circle</span>
          <span className="text-[13px] font-bold">บันทึกข้อมูลและอัปเดตการตั้งค่าเรียบร้อยแล้ว</span>
        </div>
      )}
    </div>
  );
};
