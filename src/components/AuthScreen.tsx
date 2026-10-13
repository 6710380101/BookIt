import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../data/seedData';
import { DemoAccount, UserRole } from '../types';

export const AuthScreen: React.FC = () => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsDemoUser,
    error,
    clearError,
    loading
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('areeya.s@school.ac.th');
  const [loginPassword, setLoginPassword] = useState('admin1234');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsSubmitting(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName) return;
    setIsSubmitting(true);
    try {
      await signUpWithEmail(regEmail, regPassword, regName, regRole);
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demo: DemoAccount) => {
    setIsSubmitting(true);
    try {
      await signInAsDemoUser(demo);
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-space-md py-8">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1)] p-space-xl">
        <div className="flex flex-col w-full">
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center mb-space-lg">
            <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md mb-space-sm">
              <span className="material-symbols-outlined text-[32px]">meeting_room</span>
            </div>
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="text-[28px] font-bold text-on-surface tracking-tight">BookIt</span>
              <span className="text-[28px] font-bold text-primary tracking-tight">School</span>
            </div>
            <p className="text-[13px] text-on-surface-variant max-w-[320px] leading-relaxed">
              ระบบจองห้องและอุปกรณ์การเรียนรู้ออนไลน์ สะดวก รวดเร็ว ตรวจสอบได้ทันที
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-surface-container-low p-space-xs rounded-xl flex items-center mb-space-lg">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                clearError();
              }}
              className={`flex-1 py-space-sm px-space-md text-center rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                clearError();
              }}
              className={`flex-1 py-space-sm px-space-md text-center rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-space-sm p-space-md bg-error-container text-on-error-container rounded-xl mb-space-lg transition-all duration-300">
              <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0 mt-0.5">error</span>
              <div className="flex-1">
                <p className="text-[13px] font-bold mb-0.5 text-error">
                  {activeTab === 'login' ? 'เข้าสู่ระบบไม่สำเร็จ' : 'สมัครสมาชิกไม่สำเร็จ'}
                </p>
                <p className="text-[12px] leading-tight text-on-surface-variant">{error}</p>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="text-outline hover:text-on-surface p-1"
                aria-label="ปิดการแจ้งเตือน"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="flex flex-col">
              <form onSubmit={handleLogin} className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label className="text-[14px] font-semibold text-on-surface" htmlFor="email">
                    อีเมลโรงเรียน
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@school.ac.th"
                      required
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest rounded-lg text-[14px] text-on-surface placeholder:text-outline shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors"
                    />
                  </div>
                  <p className="text-[12px] text-outline px-1">กรุณาใช้อีเมลภายใต้โดเมน @school.ac.th</p>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[14px] font-semibold text-on-surface" htmlFor="password">
                      รหัสผ่าน
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('หากลืมรหัสผ่าน กรุณาติดต่อศูนย์ช่วยเหลืองานเทคโนโลยีโรงเรียน อาคาร 2')}
                      className="text-[12px] font-semibold text-primary hover:text-primary-container transition-colors"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-11 pl-11 pr-11 bg-surface-container-lowest rounded-lg text-[14px] text-on-surface placeholder:text-outline shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="แสดงหรือซ่อนรหัสผ่าน"
                      className="absolute right-3 text-outline hover:text-on-surface p-1 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-space-xs">
                  <label className="flex items-center gap-space-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary-container"
                    />
                    <span className="text-[13px] text-on-surface-variant">จดจำฉันไว้ในระบบ</span>
                  </label>
                  <div className="flex items-center gap-1.5 py-0.5 px-2 bg-surface-container rounded-full">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    <span className="text-[11px] font-medium text-on-surface-variant">ระบบออนไลน์</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full h-11 bg-primary-container hover:bg-primary text-on-primary rounded-xl text-[14px] font-semibold flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.99] mt-space-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      กำลังเข้าสู่ระบบ...
                    </span>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบ</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center my-space-lg">
                <div className="flex-grow h-px bg-surface-container-high"></div>
                <span className="px-space-md text-[12px] text-outline uppercase tracking-wider">
                  หรือดำเนินการต่อด้วย
                </span>
                <div className="flex-grow h-px bg-surface-container-high"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || loading}
                className="w-full h-11 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-[14px] font-semibold flex items-center justify-center gap-space-sm shadow-sm transition-all"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google Workspace โรงเรียน</span>
              </button>
            </div>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <div className="flex flex-col">
              <form onSubmit={handleRegister} className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <label className="text-[14px] font-semibold text-on-surface" htmlFor="reg-name">
                    ชื่อ-นามสกุล
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      person
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="สมชาย ใจดี"
                      required
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest rounded-lg text-[14px] text-on-surface placeholder:text-outline shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="text-[14px] font-semibold text-on-surface" htmlFor="reg-email">
                    อีเมลสถาบัน
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      mail
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="student@school.ac.th"
                      required
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest rounded-lg text-[14px] text-on-surface placeholder:text-outline shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="text-[14px] font-semibold text-on-surface" htmlFor="reg-role">
                    สถานะผู้ใช้งาน
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      badge
                    </span>
                    <select
                      id="reg-role"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full h-11 pl-11 pr-8 bg-surface-container-lowest rounded-lg text-[14px] text-on-surface shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors appearance-none cursor-pointer"
                    >
                      <option value="student">นักเรียน / นักศึกษา (Student)</option>
                      <option value="teacher">ครู / อาจารย์ประจำการ (Teacher)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 text-outline pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                  <p className="text-[11px] text-outline px-1">
                    *ตามข้อกำหนด ผู้ใช้ที่สมัครใหม่จะได้รับสิทธิ์นักเรียนเป็นค่าเริ่มต้น
                  </p>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <label className="text-[14px] font-semibold text-on-surface" htmlFor="reg-password">
                    ตั้งรหัสผ่านใหม่
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      lock_reset
                    </span>
                    <input
                      id="reg-password"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      required
                      minLength={6}
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest rounded-lg text-[14px] text-on-surface placeholder:text-outline shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full h-11 bg-primary-container hover:bg-primary text-on-primary rounded-xl text-[14px] font-semibold flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.99] mt-space-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      กำลังบันทึก...
                    </span>
                  ) : (
                    <>
                      <span>ยืนยันการสมัครสมาชิก</span>
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick Demo Accounts Selector (1-Click Test Login for Evaluators) */}
          <div className="mt-6 pt-4 border-t border-surface-container-high">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">account_box</span>
                เข้าสู่ระบบด่วนด้วยบัญชีทดลอง (5 บัญชี):
              </span>
              <span className="text-[11px] text-outline font-medium">คลิกเพื่อทดสอบ</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(demo)}
                  disabled={isSubmitting}
                  className="w-full text-left p-2 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-between transition-colors text-[12px] group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        demo.role === 'admin'
                          ? 'bg-secondary-container'
                          : demo.role === 'teacher'
                          ? 'bg-primary'
                          : 'bg-outline'
                      }`}
                    ></span>
                    <span className="font-semibold text-on-surface truncate">{demo.name}</span>
                    <span className="text-on-surface-variant text-[11px] truncate">({demo.email})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      demo.role === 'admin'
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : demo.role === 'teacher'
                        ? 'bg-primary-fixed text-on-primary-fixed-variant'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {demo.role === 'admin' ? 'แอดมิน' : demo.role === 'teacher' ? 'ครู' : 'นักเรียน'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Toggle and Help Support Box */}
          <div className="mt-space-lg pt-space-md flex flex-col items-center text-center gap-space-md">
            <div>
              {activeTab === 'login' ? (
                <p className="text-[12px] text-on-surface-variant">
                  ยังไม่มีบัญชีผู้ใช้?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      clearError();
                    }}
                    className="text-[13px] text-primary font-bold hover:underline ml-1"
                  >
                    สมัครสมาชิกใหม่
                  </button>
                </p>
              ) : (
                <p className="text-[12px] text-on-surface-variant">
                  มีบัญชีผู้ใช้งานแล้ว?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      clearError();
                    }}
                    className="text-[13px] text-primary font-bold hover:underline ml-1"
                  >
                    เข้าสู่ระบบที่นี่
                  </button>
                </p>
              )}
            </div>

            <div className="w-full p-space-sm bg-surface-container rounded-lg flex items-center justify-between text-left">
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="material-symbols-outlined text-outline text-[20px] flex-shrink-0">
                  support_agent
                </span>
                <div className="truncate">
                  <p className="text-[12px] font-bold text-on-surface truncate">
                    ศูนย์ช่วยเหลืองานเทคโนโลยีโรงเรียน
                  </p>
                  <p className="text-[11px] text-outline truncate">
                    ติดต่อห้องโสตทัศนูปกรณ์ อาคาร 2 โทร. 02-xxx-xxxx
                  </p>
                </div>
              </div>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  alert('ติดต่อห้องโสตทัศนูปกรณ์ อาคาร 2 โทรศัพท์: 02-xxx-xxxx ต่อ 101');
                }}
                className="text-[12px] font-semibold text-primary hover:underline flex-shrink-0 ml-space-sm"
              >
                ติดต่อ
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
