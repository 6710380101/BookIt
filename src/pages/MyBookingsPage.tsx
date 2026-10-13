import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Booking, NavigationTab } from '../types';

interface MyBookingsPageProps {
  setCurrentTab: (tab: NavigationTab) => void;
  onSelectRoomForBooking: (roomId: string) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  setCurrentTab,
  onSelectRoomForBooking,
}) => {
  const { userProfile } = useAuth();
  const { bookings, rooms, cancelBooking } = useBooking();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [slipModalBooking, setSlipModalBooking] = useState<Booking | null>(null);

  // User's own bookings
  const myBookings = bookings.filter((b) => b.userId === userProfile?.uid);

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = myBookings.filter(
    (b) => (b.status === 'approved' || b.status === 'pending') && b.date >= todayStr
  );
  const pastBookings = myBookings.filter(
    (b) => (b.date < todayStr || b.status === 'rejected') && b.status !== 'cancelled'
  );
  const cancelledBookings = myBookings.filter((b) => b.status === 'cancelled');

  const approvedCount = myBookings.filter((b) => b.status === 'approved').length;
  const pendingCount = myBookings.filter((b) => b.status === 'pending').length;

  const currentList =
    activeTab === 'upcoming'
      ? upcomingBookings
      : activeTab === 'past'
      ? pastBookings
      : cancelledBookings;

  const handleCancel = async (bookingId: string) => {
    if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่? การยกเลิกจะมีผลทันทีและเปิดให้ผู้อื่นสามารถจองได้')) {
      try {
        await cancelBooking(bookingId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิก');
      }
    }
  };

  const getRoomImage = (roomId: string) => {
    const r = rooms.find((x) => x.id === roomId);
    return (
      r?.imageUrl ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOQw-1HjKgngloBY0HAyZFrWK9duyLLWvwiHGbmJhsiHW9Alf54Ebenoe14JwWhLSG7VBZGiw05OrVrJPYrCJUsQFIa8jXrbOGjRv46SsWlGGn07Vmv6c19ALm9xHDcy-zLyn1JqfNrZzIrE3lwcml9Sc38Rg-yVZ_7ypCSNc--Ers-MBIXl8MfxgqcvBY2YGxLZiz1t4qv66y3jpKhNsklXHg86J9N0rljv8Uc6g8b9DZR0AZGrb-cg'
    );
  };

  return (
    <div className="flex flex-col w-full py-space-md md:py-space-lg gap-space-lg pb-16">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md pb-space-sm pt-2">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-primary text-[13px] font-semibold">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>ระบบบริหารจัดการห้องและทรัพยากร</span>
          </div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-on-surface tracking-tight">
            ประวัติและการจองของฉัน
          </h1>
          <p className="text-[14px] text-on-surface-variant">
            ตรวจสอบ ติดตามสถานะการอนุมัติ และจัดการรายการห้องเรียนหรือสถานที่ที่คุณขอใช้งาน
          </p>
        </div>

        {/* Shortcut CTA */}
        <button
          type="button"
          onClick={() => setCurrentTab('rooms')}
          className="inline-flex items-center justify-center gap-space-sm px-space-lg h-12 rounded-xl bg-primary-container text-on-primary text-[14px] font-bold shadow-md hover:bg-primary transition-all duration-200 active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>+ ทำการจองใหม่</span>
        </button>
      </div>

      {/* Key Metric Micro-strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[26px]">schedule</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">กำลังจะมาถึง</span>
            <span className="text-[22px] font-bold text-on-surface">
              {upcomingBookings.length} รายการ
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[26px]">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">อนุมัติเรียบร้อย</span>
            <span className="text-[22px] font-bold text-tertiary">{approvedCount} รายการ</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/15 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[26px]">pending_actions</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">รอการอนุมัติ</span>
            <span className="text-[22px] font-bold text-secondary">{pendingCount} รายการ</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[26px]">history</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">ประวัติทั้งหมด</span>
            <span className="text-[22px] font-bold text-on-surface">{myBookings.length} ครั้ง</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl self-start w-full sm:w-auto overflow-x-auto shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">event_upcoming</span>
          <span>กำลังจะมาถึง</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ml-1 ${
              activeTab === 'upcoming'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {upcomingBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
            activeTab === 'past'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          <span>ที่ผ่านมา / ปฏิเสธ</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-semibold ml-1">
            {pastBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          className={`flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${
            activeTab === 'cancelled'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">event_busy</span>
          <span>ยกเลิกแล้ว</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-semibold ml-1">
            {cancelledBookings.length}
          </span>
        </button>
      </div>

      {/* Booking Cards Stream */}
      {currentList.length > 0 ? (
        <div className="flex flex-col gap-space-md">
          {currentList.map((booking) => {
            const isApproved = booking.status === 'approved';
            const isPending = booking.status === 'pending';
            const isRejected = booking.status === 'rejected';
            const isCancelled = booking.status === 'cancelled';

            return (
              <article
                key={booking.id}
                className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row md:items-center justify-between gap-space-lg"
              >
                <div className="flex flex-col sm:flex-row gap-space-md items-start flex-1 min-w-0">
                  {/* Room Preview Image Thumbnail */}
                  <div className="relative w-full sm:w-36 h-28 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
                    <img
                      src={getRoomImage(booking.roomId)}
                      alt={booking.roomName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold">
                      {booking.roomBuilding.split(' ')[0] || 'อาคาร'}
                    </span>
                  </div>

                  {/* Meta Details */}
                  <div className="flex flex-col gap-space-xs flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-space-sm">
                      <h2 className="text-[17px] font-bold text-on-surface truncate">
                        {booking.roomName}
                      </h2>

                      {/* Status Pill Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                          isApproved
                            ? 'bg-surface-container-low text-tertiary'
                            : isPending
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
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
                    </div>

                    {/* Schedule Meta */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-space-md text-on-surface-variant text-[13px] pt-0.5">
                      <span className="inline-flex items-center gap-1 text-primary font-bold">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        {booking.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">alarm</span>
                        {booking.startTime} - {booking.endTime} น.
                      </span>
                      <span className="inline-flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">group</span>
                        {booking.participants} ที่นั่ง
                      </span>
                    </div>

                    {/* Objective */}
                    <div className="flex items-start gap-1.5 pt-1 text-on-surface text-[13px]">
                      <span className="text-on-surface-variant font-bold shrink-0">วัตถุประสงค์:</span>
                      <span className="text-on-surface">{booking.purpose}</span>
                    </div>

                    {/* Equipment if any */}
                    {booking.equipment && booking.equipment.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-0.5 text-[12px] text-on-surface-variant">
                        <span className="font-semibold text-outline">อุปกรณ์เสริม:</span>
                        <span>{booking.equipment.map((e) => e.split('(')[0]).join(', ')}</span>
                      </div>
                    )}

                    {booking.rejectReason && (
                      <div className="mt-1 text-error text-[12px] flex items-center gap-1 bg-error-container/40 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-[16px]">error_outline</span>
                        <span>เหตุผลที่ไม่อนุมัติ: {booking.rejectReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center flex-wrap sm:flex-nowrap gap-space-sm shrink-0 pt-space-xs md:pt-0">
                  {/* Cancel Button */}
                  {(isPending || isApproved) && (
                    <button
                      type="button"
                      onClick={() => handleCancel(booking.id)}
                      className="h-11 px-space-md rounded-lg bg-surface-container-lowest text-error hover:bg-error-container hover:text-on-error-container text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      <span>ยกเลิกการจอง</span>
                    </button>
                  )}

                  {/* View Confirmation Slip */}
                  {isApproved && (
                    <button
                      type="button"
                      onClick={() => setSlipModalBooking(booking)}
                      className="h-11 px-space-lg rounded-lg bg-primary-container text-on-primary hover:bg-primary text-[13px] font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">description</span>
                      <span>ดูใบยืนยัน</span>
                    </button>
                  )}

                  {isRejected && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRoomForBooking(booking.roomId);
                        setCurrentTab('new-booking');
                      }}
                      className="h-11 px-space-md rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">cached</span>
                      <span>เลือกช่วงเวลาใหม่</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <section className="w-full bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm flex flex-col items-center justify-center min-h-[320px]">
          <div className="relative w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-space-md shadow-inner text-outline">
            <span className="material-symbols-outlined text-[44px]">event_busy</span>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-lowest shadow flex items-center justify-center text-outline-variant">
              <span className="material-symbols-outlined text-[18px]">search_off</span>
            </span>
          </div>

          <h3 className="text-[20px] font-bold text-on-surface mb-space-xs">
            ยังไม่มีประวัติการจองในหมวดนี้
          </h3>
          <p className="text-[14px] text-on-surface-variant max-w-md mb-space-lg leading-relaxed">
            เมื่อคุณทำการจองห้องหรืออุปกรณ์ รายการจะมาปรากฏที่นี่ทันที คุณสามารถวางแผนตารางเรียนและจองพื้นที่ล่วงหน้าได้ตลอดเวลา
          </p>

          <button
            type="button"
            onClick={() => setCurrentTab('rooms')}
            className="h-12 px-space-xl rounded-xl bg-primary-container text-on-primary hover:bg-primary text-[14px] font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            <span>ค้นหาและจองห้องเรียนเลย</span>
          </button>
        </section>
      )}

      {/* Confirmation Slip Modal */}
      {slipModalBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-surface-container-high">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <span className="font-bold text-[18px] text-on-surface">
                  ใบยืนยันการอนุญาตใช้สถานที่
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSlipModalBooking(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 flex flex-col gap-3 text-[13px]">
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant block">รหัสการจอง</span>
                  <span className="font-mono font-bold text-primary text-[15px]">
                    {slipModalBooking.id}
                  </span>
                </div>
                <div className="px-2.5 py-1 bg-tertiary-fixed text-tertiary rounded-full font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  อนุมัติแล้ว
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-surface-container-lowest p-2 border border-surface-container-high rounded-xl">
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-on-surface-variant">ห้อง / สถานที่:</span>
                  <span className="font-bold text-on-surface">{slipModalBooking.roomName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-on-surface-variant">อาคาร:</span>
                  <span className="text-on-surface">{slipModalBooking.roomBuilding}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-on-surface-variant">วัน-เวลา:</span>
                  <span className="font-bold text-primary">
                    {slipModalBooking.date} ({slipModalBooking.startTime} - {slipModalBooking.endTime} น.)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container-low">
                  <span className="text-on-surface-variant">ผู้ขอจอง:</span>
                  <span className="font-bold text-on-surface">{slipModalBooking.userName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">จำนวนที่นั่ง:</span>
                  <span className="text-on-surface">{slipModalBooking.participants} คน</span>
                </div>
              </div>

              <div className="p-2.5 bg-surface-container rounded-lg text-[11px] text-on-surface-variant">
                * กรุณาแสดงใบยืนยันนี้แก่เจ้าหน้าที่ธุรการหรือหัวหน้าอาคารเพื่อรับกุญแจเข้าใช้งาน
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 h-10 rounded-lg bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                พิมพ์ใบยืนยัน
              </button>
              <button
                type="button"
                onClick={() => setSlipModalBooking(null)}
                className="px-4 h-10 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
