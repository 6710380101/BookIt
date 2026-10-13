import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { NavigationTab, Booking } from '../types';

interface DashboardProps {
  setCurrentTab: (tab: NavigationTab) => void;
  onSelectRoomForBooking: (roomId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setCurrentTab,
  onSelectRoomForBooking,
}) => {
  const { userProfile } = useAuth();
  const { bookings, rooms, cancelBooking } = useBooking();
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  // Filter user's bookings
  const myBookings = bookings.filter((b) => b.userId === userProfile?.uid);
  const myUpcomingBookings = myBookings.filter(
    (b) => b.status === 'approved' || b.status === 'pending'
  );
  const myPendingBookings = myBookings.filter((b) => b.status === 'pending');
  const myApprovedBookings = myBookings.filter((b) => b.status === 'approved');

  // Today's bookings for user
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = myBookings.filter((b) => b.date === todayStr);

  const availableRoomsCount = rooms.filter((r) => r.isActive).length;
  const totalRoomsCount = rooms.length;
  const usageRate = Math.round(((totalRoomsCount - availableRoomsCount) / (totalRoomsCount || 1)) * 100) || 35;

  const handleCancel = async (bookingId: string) => {
    if (confirm('คุณต้องการยกเลิกคำขอจองนี้หรือไม่?')) {
      try {
        await cancelBooking(bookingId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิก');
      }
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Greeting & Identity Banner */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg md:p-space-xl shadow-sm mb-space-lg">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-sm mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-primary text-[12px] font-semibold shadow-xs">
                <span className="material-symbols-outlined text-[15px]">
                  {userProfile?.role === 'student' ? 'person' : 'school'}
                </span>
                {userProfile?.role === 'student'
                  ? `นักเรียน / ${userProfile.department || 'มัธยมศึกษา'}`
                  : userProfile?.role === 'teacher'
                  ? `ครูผู้สอน / ${userProfile.department || 'กลุ่มสาระการเรียนรู้'}`
                  : 'ผู้ดูแลระบบงานเทคโนโลยี'}
              </span>
              {userProfile?.role === 'admin' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[12px] font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
                  ผู้ดูแลระบบ (Admin)
                </span>
              )}
              <span className="text-on-surface-variant text-[13px] hidden sm:inline-block">
                ภาคเรียนที่ 2/2568
              </span>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-on-surface tracking-tight flex items-center gap-2">
              สวัสดีตอนเช้า, {userProfile?.name || 'ผู้ใช้งาน'}{' '}
              <span className="inline-block transform hover:rotate-12 transition-transform cursor-default">
                👋
              </span>
            </h1>
            <p className="text-on-surface-variant text-[14px] max-w-2xl">
              ระบบพร้อมสำหรับการจัดการตารางเรียนและการใช้งานห้องเรียนอัจฉริยะ วันนี้คุณมีรายการจอง{' '}
              {todayBookings.length > 0
                ? `${todayBookings.length} รายการในระบบ`
                : 'พร้อมให้ทำการจองห้องและสถานที่'}
            </p>
          </div>

          {/* Quick Action Buttons Header Area */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setCurrentTab('rooms')}
              className="inline-flex items-center justify-center gap-2 px-space-lg py-3 rounded-xl bg-primary text-on-primary text-[14px] font-semibold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              จองห้องใหม่ทันที
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('rooms')}
              className="inline-flex items-center justify-center gap-2 px-space-md py-3 rounded-xl bg-surface-container-lowest text-on-surface text-[14px] font-semibold shadow-sm hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">devices</span>
              ยืมอุปกรณ์สื่อ
            </button>
          </div>
        </div>
      </section>

      {/* Metric KPI Cards (3 Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md md:gap-space-lg mb-space-xl">
        {/* Card 1: Today's Bookings */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-primary"></div>
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="text-[13px] font-semibold text-on-surface-variant">การจองของฉันวันนี้</span>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">event_available</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[32px] font-bold text-primary">
                {todayBookings.length}
              </span>
              <span className="text-[14px] text-on-surface-variant">รายการ</span>
            </div>
          </div>
          <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="material-symbols-outlined text-primary text-[18px]">computer</span>
              <span className="text-[13px] text-on-surface font-medium truncate">
                {todayBookings[0] ? todayBookings[0].roomName : 'ห้องคอมพิวเตอร์ 1'}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant shrink-0 font-semibold">
              {todayBookings[0] ? `${todayBookings[0].startTime} - ${todayBookings[0].endTime} น.` : '13:00 - 15:00 น.'}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-secondary-container"></div>
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="text-[13px] font-semibold text-on-surface-variant">คำขอรออนุมัติ</span>
              <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary-container group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">pending_actions</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[32px] font-bold text-secondary">
                {myPendingBookings.length}
              </span>
              <span className="text-[14px] text-on-surface-variant">คำขอที่รอการยืนยัน</span>
            </div>
          </div>
          <div className="mt-space-md p-space-sm rounded-lg bg-secondary-fixed/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">hourglass_top</span>
              <span className="text-[12px] text-on-secondary-container font-medium">รอการพิจารณาจากฝ่ายอาคาร</span>
            </div>
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className="text-[11px] px-2 py-0.5 rounded bg-secondary-container text-white shrink-0 font-bold hover:brightness-110"
            >
              ตรวจสอบ
            </button>
          </div>
        </div>

        {/* Card 3: Available Rooms */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-tertiary"></div>
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="text-[13px] font-semibold text-on-surface-variant">ห้องที่ว่างในขณะนี้</span>
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed/60 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">meeting_room</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-bold text-tertiary">
                  {availableRoomsCount}
                </span>
                <span className="text-[14px] text-on-surface-variant">ห้องว่าง</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-on-surface-variant">อัตราการใช้งานรวม</span>
                <p className="text-[14px] text-on-surface font-semibold">{usageRate}%</p>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-space-md">
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-tertiary-container h-full rounded-full"
                style={{ width: `${usageRate}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-1 text-on-surface-variant text-[11px]">
              <span>มีผู้ใช้งาน {totalRoomsCount - availableRoomsCount} ห้อง</span>
              <span>ทั้งหมด {totalRoomsCount} ห้อง</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Upcoming Bookings (8 cols) & Shortcuts (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Upcoming Bookings Section */}
        <section className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">การจองที่กำลังจะมาถึงของฉัน</h2>
              <p className="text-[12px] text-on-surface-variant">
                แสดงรายการที่ได้รับอนุมัติ รอตรวจสอบ และประวัติคำขอ
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className="text-[13px] text-primary font-semibold hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด ({myBookings.length})
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Bookings Cards Container */}
          <div className="flex flex-col gap-space-sm">
            {myBookings.slice(0, 4).map((booking) => {
              const isApproved = booking.status === 'approved';
              const isPending = booking.status === 'pending';
              const isRejected = booking.status === 'rejected';

              return (
                <article
                  key={booking.id}
                  className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-space-md"
                >
                  <div className="flex items-start gap-space-md min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isApproved
                          ? 'bg-primary-fixed text-primary'
                          : isPending
                          ? 'bg-secondary-fixed text-secondary'
                          : 'bg-error-container text-error'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[26px]">
                        {isApproved ? 'desktop_windows' : isPending ? 'theater_comedy' : 'video_camera_front'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isApproved
                              ? 'bg-surface-container-high text-tertiary'
                              : isPending
                              ? 'bg-secondary-fixed/50 text-secondary'
                              : isRejected
                              ? 'bg-error-container text-error'
                              : 'bg-surface-container text-outline'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved
                                ? 'bg-tertiary'
                                : isPending
                                ? 'bg-secondary-container'
                                : isRejected
                                ? 'bg-error'
                                : 'bg-outline'
                            }`}
                          ></span>
                          {isApproved
                            ? 'อนุมัติแล้ว'
                            : isPending
                            ? 'รออนุมัติ'
                            : isRejected
                            ? 'ไม่อนุมัติ'
                            : 'ยกเลิกแล้ว'}
                        </span>
                        <span className="text-on-surface-variant text-[11px]">
                          รหัสการจอง #{booking.id}
                        </span>
                      </div>

                      <h3 className="text-[16px] font-bold text-on-surface truncate">
                        {booking.roomName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-on-surface-variant text-[12px]">
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          {booking.date} {booking.startTime} - {booking.endTime} น.
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">apartment</span>
                          {booking.roomBuilding}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">group</span>
                          {booking.participants} ที่นั่ง
                        </span>
                      </div>

                      {booking.rejectReason && (
                        <div className="mt-2 text-error text-[12px] flex items-start gap-1.5 bg-error-container/40 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                            error_outline
                          </span>
                          <span>เหตุผล: {booking.rejectReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-space-sm shrink-0 pt-space-xs md:pt-0">
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        className="w-full md:w-auto px-space-md py-2 rounded-lg bg-surface-container-lowest text-error text-[13px] font-semibold hover:bg-error-container/20 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        ยกเลิกคำขอ
                      </button>
                    ) : isRejected ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectRoomForBooking(booking.roomId);
                          setCurrentTab('new-booking');
                        }}
                        className="w-full md:w-auto px-space-md py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">cached</span>
                        เลือกช่วงเวลาใหม่
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForDetail(booking)}
                        className="w-full md:w-auto px-space-md py-2 rounded-lg bg-surface-container text-primary text-[13px] font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        ดูรายละเอียด
                      </button>
                    )}
                  </div>
                </article>
              );
            })}

            {myBookings.length === 0 && (
              <div className="bg-surface-container-lowest p-8 rounded-xl text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-outline text-[40px] mb-2">
                  event_busy
                </span>
                <p className="font-semibold text-on-surface">ยังไม่มีประวัติการจอง</p>
                <p className="text-[12px] text-on-surface-variant mt-1 mb-4">
                  เลือกห้องและเวลาที่ต้องการเพื่อเริ่มต้นใช้งานห้องเรียนและสถานที่
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentTab('rooms')}
                  className="px-4 py-2 bg-primary-container text-on-primary rounded-lg text-[13px] font-semibold"
                >
                  เลือกห้องเพื่อจอง
                </button>
              </div>
            )}
          </div>

          {/* Quick Tips Banner */}
          <div className="bg-surface-container-high/60 rounded-xl p-space-md flex items-center gap-space-md mt-space-sm">
            <span className="material-symbols-outlined text-primary text-[28px] shrink-0">
              lightbulb
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-on-surface">
                ระเบียบการใช้ห้องปฏิบัติการ
              </p>
              <p className="text-[12px] text-on-surface-variant">
                โปรดแจ้งยกเลิกการจองล่วงหน้าอย่างน้อย 2 ชั่วโมง หากไม่มีการเรียนการสอน เพื่อเปิดโอกาสให้คุณครูท่านอื่นใช้งาน
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Shortcuts & Quick Views */}
        <aside className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Quick Action Navigation Hub */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <h3 className="text-[18px] font-bold text-on-surface mb-space-xs">
              ทางลัดดำเนินการด่วน
            </h3>
            <p className="text-[12px] text-on-surface-variant mb-space-md">
              เข้าถึงฟังก์ชันสำคัญในคลิกเดียว
            </p>
            <div className="flex flex-col gap-space-sm">
              <button
                type="button"
                onClick={() => setCurrentTab('rooms')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                      จองห้องใหม่ทันที
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      ระบุวัน เวลา และระบุจุดประสงค์
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-[20px]">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('rooms')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                      ยืมอุปกรณ์สื่อการสอน
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      โปรเจกเตอร์ ไมค์ และแท็บเล็ต
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-[20px]">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('my-bookings')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                      ตรวจสอบปฏิทินรวม
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      ดูสถานะทุกอาคารแบบเรียลไทม์
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-[20px]">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => alert('แจ้งซ่อม: กรุณาติดต่อช่างซ่อมบำรุงอาคาร โทร. 02-xxx-xxxx ต่อ 102')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">report_problem</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-on-surface group-hover:text-secondary transition-colors">
                      แจ้งซ่อมอุปกรณ์ในห้อง
                    </span>
                    <span className="text-[12px] text-on-surface-variant">
                      เครื่องปรับอากาศ จอภาพ หลอดไฟ
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-[20px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Featured Room Showcase */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-36 w-full overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6iWRIqS-76pHBeABa94RRcFZ3AllxMzlkndGbri641It1amMo5e2z93OIHsw-aNKZ1S49AUQaGiOxXroYcsVBkpUfTckPCBejxTKUJ1f6-ZXAHSTFmurz9P0ddQzF2dz1EbCUYA4pLmBLfx9lwMNf9blPOy0rx3hGV_dVkdFGuqeypIdBNKDF-q1RJFqp6YJKUFGjxQ9Uz-pKljR7fgQGGxol_sO1WEvMoTiM1ehgKQrltOE3SvAiVg"
                alt="ห้องปฏิบัติการวิทยาศาสตร์ SC-2"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary text-[11px] font-semibold shadow-xs">
                พร้อมใช้งานทันที
              </span>
            </div>
            <div className="p-space-md flex flex-col gap-space-xs">
              <h4 className="text-[16px] font-bold text-on-surface">
                ห้องปฏิบัติการวิทยาศาสตร์ SC-2
              </h4>
              <p className="text-[12px] text-on-surface-variant">
                อุปกรณ์ครบครัน กล้องจุลทรรศน์ 20 ชุด และโปรเจกเตอร์อินเทอร์แอคทีฟ
              </p>
              <div className="flex items-center justify-between pt-space-sm mt-space-xs">
                <span className="text-tertiary text-[13px] flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span> ว่างตลอดช่วงบ่าย
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectRoomForBooking('room-5');
                    setCurrentTab('new-booking');
                  }}
                  className="px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary text-[12px] font-semibold hover:bg-primary transition-colors"
                >
                  จองห้องนี้
                </button>
              </div>
            </div>
          </div>

          {/* Mini Weekly Usage Chart */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <span className="text-[16px] font-bold text-on-surface">
                สถิติการใช้งานสัปดาห์นี้
              </span>
              <span className="text-[12px] text-on-surface-variant">ชั่วโมงรวม: 14 ชม.</span>
            </div>
            <div className="flex items-end justify-between h-28 pt-4 px-2">
              <div className="flex flex-col items-center gap-1.5 w-8">
                <div className="w-full bg-surface-container rounded-t-md h-12 relative flex items-end">
                  <div className="w-full bg-primary-fixed-dim rounded-t-md h-full"></div>
                </div>
                <span className="text-[12px] text-on-surface-variant">จ.</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-8">
                <div className="w-full bg-surface-container rounded-t-md h-20 relative flex items-end">
                  <div className="w-full bg-primary rounded-t-md h-full shadow-xs"></div>
                </div>
                <span className="text-[12px] font-bold text-primary">อ.</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-8">
                <div className="w-full bg-surface-container rounded-t-md h-16 relative flex items-end">
                  <div className="w-full bg-primary-fixed-dim rounded-t-md h-full"></div>
                </div>
                <span className="text-[12px] text-on-surface-variant">พ.</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-8">
                <div className="w-full bg-surface-container rounded-t-md h-8 relative flex items-end">
                  <div className="w-full bg-primary-fixed-dim rounded-t-md h-full"></div>
                </div>
                <span className="text-[12px] text-on-surface-variant">พฤ.</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-8">
                <div className="w-full bg-surface-container rounded-t-md h-14 relative flex items-end">
                  <div className="w-full bg-primary-fixed-dim rounded-t-md h-full"></div>
                </div>
                <span className="text-[12px] text-on-surface-variant">ศ.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Booking Detail Modal */}
      {selectedBookingForDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
                <h3 className="font-bold text-[18px] text-on-surface">
                  รายละเอียดการจอง #{selectedBookingForDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForDetail(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 py-4 text-[13px]">
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">ห้องที่จอง:</span>
                <span className="font-bold text-on-surface">{selectedBookingForDetail.roomName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">สถานที่:</span>
                <span className="text-on-surface">{selectedBookingForDetail.roomBuilding}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">วัน-เวลา:</span>
                <span className="font-bold text-primary">
                  {selectedBookingForDetail.date} ({selectedBookingForDetail.startTime} -{' '}
                  {selectedBookingForDetail.endTime} น.)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">จำนวนผู้ร่วมใช้:</span>
                <span className="text-on-surface">{selectedBookingForDetail.participants} คน</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container">
                <span className="text-on-surface-variant">สถานะ:</span>
                <span
                  className={`font-bold ${
                    selectedBookingForDetail.status === 'approved'
                      ? 'text-tertiary'
                      : selectedBookingForDetail.status === 'pending'
                      ? 'text-secondary'
                      : 'text-error'
                  }`}
                >
                  {selectedBookingForDetail.status === 'approved'
                    ? 'อนุมัติแล้ว'
                    : selectedBookingForDetail.status === 'pending'
                    ? 'รออนุมัติ'
                    : 'ไม่อนุมัติ'}
                </span>
              </div>
              <div className="py-1">
                <span className="text-on-surface-variant block mb-1">วัตถุประสงค์:</span>
                <p className="bg-surface-container-low p-2.5 rounded-lg text-on-surface text-[12px]">
                  {selectedBookingForDetail.purpose}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForDetail(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
