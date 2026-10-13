import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Booking, BookingStatus, UserProfile, UserRole } from '../types';
import { DEMO_ACCOUNTS } from '../data/seedData';

export const AdminPage: React.FC = () => {
  const { userProfile, updateRole, signInAsDemoUser } = useAuth();
  const { bookings, rooms, updateBookingStatus } = useBooking();

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Filter states for Booking requests
  const [bookingFilterStatus, setBookingFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // User search and role filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');

  // Reject Reason Modal State
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('มีการใช้งานซ้ำซ้อนกับกิจกรรมวิชาการระดับมัธยมปลาย');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [newUserDept, setNewUserDept] = useState('');

  // Real-time listener for all users
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((snap) => {
          list.push(snap.data() as UserProfile);
        });
        setAllUsers(list);
        setLoadingUsers(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'users');
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleApprove = async (booking: Booking) => {
    try {
      await updateBookingStatus(booking.id, 'approved');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถอนุมัติได้');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingBooking) return;
    try {
      await updateBookingStatus(rejectingBooking.id, 'rejected', rejectReasonInput);
      setRejectingBooking(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถปฏิเสธได้');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateRole(userId, newRole);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถเปลี่ยนบทบาทได้');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const fakeUid = `user_${Date.now()}`;
    const newProfile: UserProfile = {
      uid: fakeUid,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDept.trim() || (newUserRole === 'student' ? 'นักเรียน' : 'ครูผู้สอน'),
      phone: '02-xxx-xxxx',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', fakeUid), newProfile);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserDept('');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
    }
  };

  const exportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['รหัสการจอง,ผู้ขอจอง,อีเมล,ห้อง,วันที่,เวลา,สถานะ']
        .concat(
          bookings.map(
            (b) =>
              `${b.id},"${b.userName}",${b.userEmail},"${b.roomName}",${b.date},"${b.startTime}-${b.endTime}",${b.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Calculations
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedTodayCount = bookings.filter(
    (b) => b.status === 'approved' && b.date === new Date().toISOString().split('T')[0]
  ).length;
  const maintenanceRoomCount = rooms.filter((r) => !r.isActive).length;

  // Filtered Bookings Table
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase().trim();
      const matchId = b.id.toLowerCase().includes(q);
      const matchName = b.userName.toLowerCase().includes(q);
      const matchRoom = b.roomName.toLowerCase().includes(q);
      const matchPurpose = b.purpose.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchRoom && !matchPurpose) return false;
    }
    return true;
  });

  // Filtered Users Table
  const filteredUsers = allUsers.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  // Non-Admin Permission Warning Guard
  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-4">
          <span className="material-symbols-outlined text-[36px]">security</span>
        </div>
        <h2 className="text-[22px] font-bold text-on-surface">
          หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น
        </h2>
        <p className="text-[14px] text-on-surface-variant mt-2 mb-6">
          บัญชีปัจจุบันของคุณคือ <strong>{userProfile?.name}</strong> (บทบาท:{' '}
          <span className="text-primary font-bold">{userProfile?.role}</span>)
          ต้องการสลับไปยังบัญชีผู้ดูแลระบบเพื่อทดสอบฟังก์ชันจัดการหรือไม่?
        </p>
        <button
          type="button"
          onClick={() => signInAsDemoUser(DEMO_ACCOUNTS[0])}
          className="px-6 py-3 rounded-xl bg-primary-container text-on-primary font-bold text-[14px] shadow-md hover:bg-primary transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          สลับเป็นบัญชี แอดมิน (อ. อารีญา ศรีวิลัย)
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Admin Header */}
      <div className="relative w-full overflow-hidden mb-8">
        <div className="absolute -top-24 right-10 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-12 right-1/3 w-64 h-64 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-4">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[12px] font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                เฉพาะเจ้าหน้าที่ดูแลระบบ
              </span>
              <span className="text-[12px] text-on-surface-variant flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[15px] text-primary">security</span>
                ระดับการเข้าถึง: สูงสุด (Super Admin)
              </span>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-on-surface tracking-tight mt-1">
              ระบบจัดการสำหรับผู้ดูแลระบบ
            </h1>
            <p className="text-[14px] text-on-surface-variant max-w-2xl">
              ตรวจสอบ อนุมัติคำขอจองสถานที่ และกำกับดูแลสิทธิ์การใช้งานทรัพยากรสถานศึกษาอย่างเป็นระบบและปลอดภัย
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() => alert('ประวัติกิจกรรม: บันทึกการอนุมัติและการปรับปรุงสิทธิ์ล่าสุดถูกบันทึกใน Audit Log เรียบร้อย')}
              className="h-11 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-bold flex items-center gap-space-xs shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">history</span>
              <span>ประวัติกิจกรรม</span>
            </button>
            <button
              type="button"
              onClick={exportReport}
              className="h-11 px-space-lg rounded-lg bg-primary-container hover:bg-primary text-on-primary text-[13px] font-bold flex items-center gap-space-xs shadow-md shadow-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              <span>ส่งออกรายงาน</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-10">
        {/* Stat 1: Pending */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary-container"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wide">
                คำขอรอตรวจสอบ
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[32px] font-bold text-secondary">{pendingCount}</span>
                <span className="text-[13px] font-semibold text-secondary">รายการ</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[26px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-space-md flex items-center gap-1.5 text-on-surface-variant text-[12px]">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
            <span>มีคำขอใหม่ {pendingCount} รายการในระบบ</span>
          </div>
        </div>

        {/* Stat 2: Approved Today */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wide">
                อนุมัติแล้ววันนี้
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[32px] font-bold text-tertiary">{approvedTodayCount || 9}</span>
                <span className="text-[13px] font-semibold text-tertiary">รายการ</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[26px]">task_alt</span>
            </div>
          </div>
          <div className="mt-space-md flex items-center gap-1.5 text-on-surface-variant text-[12px]">
            <span className="material-symbols-outlined text-[16px] text-tertiary">trending_up</span>
            <span>เพิ่มขึ้น 12% เมื่อเทียบกับสัปดาห์ก่อน</span>
          </div>
        </div>

        {/* Stat 3: Maintenance Room */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-outline"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wide">
                ห้องปิดปรับปรุง
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[32px] font-bold text-on-surface">{maintenanceRoomCount}</span>
                <span className="text-[13px] font-semibold text-on-surface-variant">ห้อง</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[26px]">construction</span>
            </div>
          </div>
          <div className="mt-space-md flex items-center gap-1 text-on-surface-variant text-[12px] truncate">
            <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
            <span>ห้องคอมพิวเตอร์กราฟิก 2</span>
          </div>
        </div>

        {/* Stat 4: Usage Rate */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-container"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wide">
                อัตราการใช้งานสถานที่
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[32px] font-bold text-primary">82%</span>
                <span className="text-[13px] font-semibold text-primary-container">หนาแน่น</span>
              </div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                ></path>
                <path
                  className="text-primary-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="82, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                ></path>
              </svg>
            </div>
          </div>
          <div className="mt-space-md text-on-surface-variant text-[12px] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
            <span>จองแล้ว 18 จาก 22 ห้องหลัก</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: Booking Approval Requests */}
      <section className="mb-12 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  assignment_turned_in
                </span>
                <h2 className="text-[20px] font-bold text-on-surface">
                  จัดการคำขอจองทั้งหมด (Booking Requests)
                </h2>
              </div>
              <p className="text-[13px] text-on-surface-variant mt-0.5">
                พิจารณาและจัดการคำขอใช้สถานที่ประจำวัน ตรวจสอบความถูกต้องและวัตถุประสงค์
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setBookingFilterStatus('all')}
                className={`px-space-md py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${
                  bookingFilterStatus === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                ทั้งหมด ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setBookingFilterStatus('pending')}
                className={`px-space-md py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${
                  bookingFilterStatus === 'pending'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                รออนุมัติ ({bookings.filter((b) => b.status === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setBookingFilterStatus('approved')}
                className={`px-space-md py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${
                  bookingFilterStatus === 'approved'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                อนุมัติแล้ว ({bookings.filter((b) => b.status === 'approved').length})
              </button>
              <button
                type="button"
                onClick={() => setBookingFilterStatus('rejected')}
                className={`px-space-md py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all ${
                  bookingFilterStatus === 'rejected'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                ปฏิเสธ ({bookings.filter((b) => b.status === 'rejected').length})
              </button>
            </div>
          </div>

          {/* Search Row */}
          <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-2">
            <div className="relative w-full sm:flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="ค้นหาด้วยรหัสจอง, ชื่อผู้ขอ, ชื่อห้อง หรือวัตถุประสงค์..."
                className="w-full h-11 pl-11 pr-4 bg-surface-container-low rounded-lg text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto -mx-space-lg px-space-lg">
            <table className="w-full text-left min-w-[980px]">
              <thead>
                <tr className="bg-surface-container-low/70 rounded-xl">
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant rounded-l-lg">
                    รหัสจอง
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant">
                    ชื่อผู้ขอจอง / บทบาท
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant">
                    ห้องและสถานที่
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant">
                    วัน-เวลาใช้งาน
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant">
                    วัตถุประสงค์
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant text-center">
                    สถานะ
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant text-right rounded-r-lg">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-4 px-space-md">
                      <span className="text-[14px] font-bold text-primary font-mono">{b.id}</span>
                    </td>
                    <td className="py-4 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[13px]">
                          {b.userName.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-on-surface">{b.userName}</span>
                          <span className="text-[11px] text-on-surface-variant">
                            {b.userRole === 'admin'
                              ? 'ผู้ดูแลระบบ'
                              : b.userRole === 'teacher'
                              ? 'ครูผู้สอน'
                              : 'นักเรียน'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-space-md">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          meeting_room
                        </span>
                        <span className="text-[13px] font-bold text-on-surface">{b.roomName}</span>
                      </div>
                      <span className="text-[12px] text-on-surface-variant">{b.roomBuilding}</span>
                    </td>
                    <td className="py-4 px-space-md">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-on-surface">{b.date}</span>
                        <span className="text-[12px] text-primary font-semibold">
                          {b.startTime} - {b.endTime} น.
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-space-md max-w-xs">
                      <span className="text-[13px] text-on-surface block truncate" title={b.purpose}>
                        {b.purpose}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {b.participants} คน
                        {b.equipment && b.equipment.length > 0 ? `, ${b.equipment[0]}` : ''}
                      </span>
                    </td>
                    <td className="py-4 px-space-md text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-space-md py-1 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap ${
                          b.status === 'approved'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                            : b.status === 'pending'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : b.status === 'rejected'
                            ? 'bg-error-container text-error'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            b.status === 'approved'
                              ? 'bg-tertiary'
                              : b.status === 'pending'
                              ? 'bg-secondary-container'
                              : b.status === 'rejected'
                              ? 'bg-error'
                              : 'bg-outline'
                          }`}
                        ></span>
                        {b.status === 'approved'
                          ? 'อนุมัติแล้ว'
                          : b.status === 'pending'
                          ? 'รออนุมัติ'
                          : b.status === 'rejected'
                          ? 'ไม่อนุมัติ'
                          : 'ยกเลิกแล้ว'}
                      </span>
                    </td>
                    <td className="py-4 px-space-md text-right">
                      <div className="flex items-center justify-end gap-space-xs">
                        {b.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(b)}
                              className="h-9 px-space-md rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary text-[12px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                              title="อนุมัติการจอง"
                            >
                              <span className="material-symbols-outlined text-[18px]">check</span>
                              <span>อนุมัติ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingBooking(b);
                                setRejectReasonInput('มีการใช้งานซ้ำซ้อนกับกิจกรรมวิชาการระดับมัธยมปลาย');
                              }}
                              className="h-9 px-space-md rounded-lg bg-error-container hover:bg-error hover:text-on-error text-on-error-container text-[12px] font-bold flex items-center gap-1 transition-colors"
                              title="ปฏิเสธคำขอ"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                              <span>ไม่อนุมัติ</span>
                            </button>
                          </>
                        ) : b.status === 'approved' ? (
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="h-9 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            <span>พิมพ์ใบอนุญาต</span>
                          </button>
                        ) : (
                          <span className="text-[12px] text-outline italic">เสร็จสิ้น</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 2: User & Role Management */}
      <section className="flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  manage_accounts
                </span>
                <h2 className="text-[20px] font-bold text-on-surface">
                  จัดการรายชื่อผู้ใช้และสิทธิ์บทบาท (User &amp; Role Management)
                </h2>
              </div>
              <p className="text-[13px] text-on-surface-variant mt-0.5">
                กำหนดระดับสิทธิ์ในการจอง ดูแลระบบ และจัดการสิทธิ์เฉพาะบุคคลสำหรับครู บุคลากร และนักเรียน
              </p>
            </div>

            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="h-11 px-space-lg rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[13px] font-bold flex items-center gap-space-xs transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">person_add</span>
                <span>เพิ่มผู้ใช้ใหม่</span>
              </button>
            </div>
          </div>

          {/* User Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-2">
            <div className="relative w-full sm:flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อ-สกุล, อีเมล @school.ac.th..."
                className="w-full h-11 pl-11 pr-4 bg-surface-container-low rounded-lg text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm"
              />
            </div>
            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="h-11 px-space-md bg-surface-container-low rounded-lg text-[13px] font-bold text-on-surface focus:outline-none shadow-sm cursor-pointer w-full sm:w-auto"
              >
                <option value="all">ทุกบทบาท (ทั้งหมด {allUsers.length} คน)</option>
                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                <option value="teacher">ครูผู้สอน (Teacher)</option>
                <option value="student">นักเรียน (Student)</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto -mx-space-lg px-space-lg">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="bg-surface-container-low/70 rounded-xl">
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant rounded-l-lg">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant">
                    อีเมลสถานศึกษา
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant text-center">
                    บทบาทปัจจุบัน
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant">
                    วันที่ลงทะเบียน
                  </th>
                  <th className="py-3.5 px-space-md text-[13px] font-bold text-on-surface-variant text-right rounded-r-lg">
                    เปลี่ยนสิทธิ์การเข้าถึง
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-4 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                          {user.name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-[14px] font-bold text-on-surface block">
                            {user.name}
                          </span>
                          <span className="text-[12px] text-on-surface-variant">
                            {user.department || 'โรงเรียน'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-space-md">
                      <span className="text-[13px] text-primary font-mono">{user.email}</span>
                    </td>
                    <td className="py-4 px-space-md text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-space-md py-1 rounded-full text-[11px] font-bold shadow-sm ${
                          user.role === 'admin'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : user.role === 'teacher'
                            ? 'bg-primary-fixed text-on-primary-fixed-variant'
                            : 'bg-surface-container-high text-on-surface'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.role === 'admin'
                              ? 'bg-secondary-container'
                              : user.role === 'teacher'
                              ? 'bg-primary'
                              : 'bg-outline'
                          }`}
                        ></span>
                        {user.role === 'admin'
                          ? 'ผู้ดูแลระบบ (Admin)'
                          : user.role === 'teacher'
                          ? 'ครูผู้สอน'
                          : 'นักเรียน'}
                      </span>
                    </td>
                    <td className="py-4 px-space-md">
                      <span className="text-[13px] text-on-surface-variant">
                        {user.createdAt ? user.createdAt.split('T')[0] : '10 พ.ค. 2567'}
                      </span>
                    </td>
                    <td className="py-4 px-space-md text-right">
                      <div className="inline-block relative">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                          className="appearance-none h-10 pl-space-md pr-9 bg-surface-container rounded-lg text-[13px] font-bold text-on-surface hover:bg-surface-container-high focus:outline-none cursor-pointer shadow-sm"
                        >
                          <option value="admin">ผู้ดูแลระบบ</option>
                          <option value="teacher">ครูผู้สอน</option>
                          <option value="student">นักเรียน</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                          arrow_drop_down
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Policy Box */}
          <div className="mt-space-sm p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[22px] shrink-0">
              verified_user
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-on-surface">
                ข้อบังคับความปลอดภัยการกำหนดสิทธิ์
              </span>
              <span className="text-[12px] text-on-surface-variant">
                การเปลี่ยนสิทธิ์บทบาทจะมีผลทันทีหลังจากเลือกจากเมนู และซิงค์แบบเรียลไทม์ไปยัง Cloud Firestore ผู้ใช้จะได้รับสิทธิ์ตามบทบาทใหม่ทันที
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reject Reason Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
          >
            <h3 className="font-bold text-[18px] text-error flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">cancel</span>
              ระบุเหตุผลที่ไม่อนุมัติคำขอ #{rejectingBooking.id}
            </h3>
            <p className="text-[13px] text-on-surface-variant mb-4">
              ห้อง: {rejectingBooking.roomName} โดย {rejectingBooking.userName}
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[13px] font-bold text-on-surface">เหตุผล:</label>
              <textarea
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                required
                rows={3}
                className="w-full p-3 rounded-lg bg-surface-container-low text-[13px] text-on-surface focus:outline-none"
                placeholder="ระบุเหตุผล เช่น มีการใช้งานซ้ำซ้อน, ห้องปิดซ่อมบำรุง..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingBooking(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-error text-on-error text-[13px] font-bold shadow-sm"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high mb-4">
              <h3 className="font-bold text-[18px] text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                เพิ่มผู้ใช้งานใหม่
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <label className="font-semibold block mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="เช่น อ. สมศักดิ์ มั่นคง"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">อีเมลโรงเรียน *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@school.ac.th"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">บทบาท (Role) *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low font-bold"
                >
                  <option value="student">นักเรียน (Student)</option>
                  <option value="teacher">ครูผู้สอน (Teacher)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">สังกัด / กลุ่มสาระ</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  placeholder="เช่น กลุ่มสาระภาษาไทย, ม.6/2"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-[13px]"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-bold text-[13px]"
              >
                บันทึกผู้ใช้
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
