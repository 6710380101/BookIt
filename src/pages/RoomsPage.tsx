import React, { useState, useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { Room, RoomCategory, NavigationTab } from '../types';

interface RoomsPageProps {
  setCurrentTab: (tab: NavigationTab) => void;
  onSelectRoomForBooking: (roomId: string) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  setCurrentTab,
  onSelectRoomForBooking,
}) => {
  const { rooms } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'capacity-30'>('all');
  const [sortBy, setSortBy] = useState<'capacity-asc' | 'capacity-desc' | 'name'>('capacity-asc');

  const categories: { id: RoomCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'ทั้งหมด', icon: 'apps' },
    { id: 'computer', label: 'ห้องคอมพิวเตอร์', icon: 'desktop_windows' },
    { id: 'meeting', label: 'ห้องประชุม', icon: 'groups' },
    { id: 'hall', label: 'หอประชุม', icon: 'stadium' },
    { id: 'science', label: 'ห้องปฏิบัติการวิทย์', icon: 'science' },
    { id: 'smart', label: 'ห้อง Smart Classroom', icon: 'cast_for_education' },
  ];

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // Category filter
        if (selectedCategory !== 'all' && room.type !== selectedCategory) {
          return false;
        }

        // Status filter
        if (statusFilter === 'available' && !room.isActive) {
          return false;
        }
        if (statusFilter === 'capacity-30' && room.capacity < 30) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = room.name.toLowerCase().includes(q);
          const matchBuilding = room.building.toLowerCase().includes(q);
          const matchEquip = room.equipment.some((e) => e.toLowerCase().includes(q));
          if (!matchName && !matchBuilding && !matchEquip) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'capacity-asc') return a.capacity - b.capacity;
        if (sortBy === 'capacity-desc') return b.capacity - a.capacity;
        return a.name.localeCompare(b.name, 'th');
      });
  }, [rooms, selectedCategory, statusFilter, searchQuery, sortBy]);

  const availableCount = rooms.filter((r) => r.isActive).length;
  const busyCount = rooms.length - availableCount;

  const handleBookRoom = (roomId: string) => {
    onSelectRoomForBooking(roomId);
    setCurrentTab('new-booking');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Utility & Breadcrumb Bar */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-sm pt-space-lg pb-space-md">
        <div className="flex items-center gap-space-xs text-on-surface-variant text-[13px] font-semibold">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>หน้าหลัก</span>
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold">ห้องและสถานที่</span>
        </div>
        <div className="flex items-center gap-space-sm text-on-surface-variant text-[12px]">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            อัปเดตสถานะแบบเรียลไทม์
          </span>
          <span className="hidden sm:inline text-outline-variant">•</span>
          <span className="hidden sm:inline">ภาคเรียนที่ 2 / 2568</span>
        </div>
      </div>

      {/* Header Banner Section */}
      <section className="relative w-full rounded-xl bg-surface-container-lowest p-space-lg md:p-space-xl shadow-sm overflow-hidden mb-space-lg">
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-surface-container-highest/50 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[12px] font-semibold tracking-wide mb-space-sm">
              <span className="material-symbols-outlined text-[14px]">domain</span>
              ระบบจองพื้นที่การศึกษา
            </div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-on-surface tracking-tight mb-space-xs">
              รายการห้องและพื้นที่การเรียนรู้
            </h1>
            <p className="text-[15px] text-on-surface-variant">
              ค้นหาและตรวจสอบสถานะความพร้อมของห้องก่อนทำรายการจอง เพื่อประสิทธิภาพสูงสุดในการจัดกิจกรรมการเรียนการสอน
            </p>
          </div>

          {/* Quick Stats Counter Strip */}
          <div className="flex items-stretch gap-space-sm sm:gap-space-md">
            <div className="flex flex-col justify-center px-space-md py-space-sm rounded-lg bg-surface-container-low min-w-[100px]">
              <span className="text-[11px] text-on-surface-variant">ห้องทั้งหมด</span>
              <span className="text-[24px] text-on-surface font-bold">{rooms.length}</span>
            </div>
            <div className="flex flex-col justify-center px-space-md py-space-sm rounded-lg bg-tertiary-fixed/30 min-w-[100px]">
              <span className="text-[11px] text-on-tertiary-fixed-variant font-medium">ว่างพร้อมใช้</span>
              <span className="text-[24px] text-tertiary font-bold">{availableCount}</span>
            </div>
            <div className="flex flex-col justify-center px-space-md py-space-sm rounded-lg bg-secondary-fixed/40 min-w-[100px]">
              <span className="text-[11px] text-on-secondary-fixed-variant font-medium">ปิดปรับปรุง/ใช้งาน</span>
              <span className="text-[24px] text-secondary font-bold">{busyCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm mb-space-lg flex flex-col gap-space-md">
        <div className="w-full flex flex-col sm:flex-row gap-space-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อห้อง, อาคาร, หรืออุปกรณ์ประจำห้อง..."
              className="w-full h-11 pl-12 pr-space-md rounded-lg bg-surface-container-low text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus:ring-2 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:bg-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-space-xs self-end sm:self-auto shrink-0">
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-56 h-11 pl-space-md pr-9 rounded-lg bg-surface-container-low text-[13px] font-semibold text-on-surface appearance-none focus:outline-none cursor-pointer"
              >
                <option value="capacity-asc">เรียงตาม: ความจุ (น้อยไปมาก)</option>
                <option value="capacity-desc">เรียงตาม: ความจุ (มากไปน้อย)</option>
                <option value="name">เรียงตาม: ชื่อห้อง ก-ฮ</option>
              </select>
              <span className="material-symbols-outlined absolute right-space-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-col gap-space-xs">
          <span className="text-[13px] font-bold text-on-surface-variant">หมวดหมู่สถานที่</span>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 flex-wrap">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`h-9 px-space-md rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status & Capacity Quick Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="text-[13px] text-on-surface-variant mr-space-xs">ตัวกรองพิเศษ:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-space-sm py-1 rounded-lg text-[12px] font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('available')}
              className={`px-space-sm py-1 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1 ${
                statusFilter === 'available'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
              เฉพาะห้องว่างตอนนี้
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('capacity-30')}
              className={`px-space-sm py-1 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1 ${
                statusFilter === 'capacity-30'
                  ? 'bg-surface-container-high text-on-surface'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              รองรับ 30+ ที่นั่ง
            </button>
          </div>
          <div className="text-on-surface-variant text-[13px]">
            พบข้อมูล <span className="font-bold text-primary">{filteredRooms.length}</span> ห้อง
          </div>
        </div>
      </section>

      {/* Room Cards Grid */}
      {filteredRooms.length > 0 ? (
        <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-space-xl">
          {filteredRooms.map((room) => {
            const isAvailable = room.isActive;

            return (
              <article
                key={room.id}
                className={`group flex flex-col justify-between bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                  !isAvailable ? 'opacity-85' : ''
                }`}
              >
                <div>
                  {/* Room Media Header */}
                  <div className="relative w-full h-52 bg-surface-container overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        !isAvailable ? 'filter grayscale' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>

                    {/* Category Chip Overlay */}
                    <div className="absolute top-space-md left-space-md">
                      <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface text-[11px] font-semibold shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          {room.type === 'computer'
                            ? 'desktop_windows'
                            : room.type === 'meeting'
                            ? 'groups'
                            : room.type === 'hall'
                            ? 'stadium'
                            : room.type === 'science'
                            ? 'science'
                            : 'cast_for_education'}
                        </span>
                        {room.typeName}
                      </span>
                    </div>

                    {/* Capacity Badge Overlay */}
                    <div className="absolute bottom-space-md left-space-md flex items-center gap-space-xs text-white text-[13px] font-semibold drop-shadow">
                      <span className="material-symbols-outlined text-[18px]">
                        airline_seat_recline_normal
                      </span>
                      <span>
                        ความจุ: <strong className="font-bold">{room.capacity}</strong> ที่นั่ง
                      </span>
                    </div>
                  </div>

                  {/* Room Details Body */}
                  <div className="p-space-lg flex flex-col gap-space-sm">
                    <div className="flex items-start justify-between gap-space-sm">
                      <div>
                        <h2 className="text-[17px] font-bold text-on-surface group-hover:text-primary transition-colors">
                          {room.name}
                        </h2>
                        <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[16px] text-outline">
                            location_on
                          </span>
                          {room.building}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-fixed/40 text-tertiary text-[11px] font-bold shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                          ว่างพร้อมใช้งาน
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-bold shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                          ปิดปรับปรุงชั่วคราว
                        </span>
                      )}
                    </div>

                    {/* Equipment Tags */}
                    <div className="pt-space-xs">
                      <span className="text-[11px] font-bold text-outline uppercase tracking-wider block mb-1.5">
                        อุปกรณ์ประจำห้อง
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {room.equipment.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-space-sm py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[11px]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-space-lg pt-0">
                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => handleBookRoom(room.id)}
                      className="w-full h-11 px-space-lg rounded-lg bg-primary-container text-on-primary text-[14px] font-semibold flex items-center justify-center gap-space-xs hover:bg-primary transition-colors shadow-sm focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                      จองห้องนี้
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full h-11 px-space-lg rounded-lg bg-surface-container-high text-outline cursor-not-allowed text-[14px] font-semibold flex items-center justify-center gap-space-xs"
                    >
                      <span className="material-symbols-outlined text-[20px]">block</span>
                      ปิดรับจอง
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        /* Empty State */
        <div className="w-full py-16 bg-surface-container-lowest rounded-xl shadow-sm text-center flex flex-col items-center justify-center gap-space-md mb-space-xl">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[32px]">meeting_room</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-[18px] font-bold text-on-surface">
              ไม่พบห้องหรือสถานที่ตามเงื่อนไข
            </h3>
            <p className="text-[13px] text-on-surface-variant mt-1">
              ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองหมวดหมู่เพื่อค้นหาใหม่อีกครั้ง
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="h-10 px-space-lg rounded-lg bg-surface-container-high text-on-surface text-[13px] font-semibold hover:bg-surface-container-highest transition-colors"
          >
            รีเซ็ตตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {/* Booking Help & Guidelines */}
      <aside className="w-full rounded-xl bg-surface-container-low p-space-lg mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-md">
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">info</span>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-on-surface leading-tight">
              ระเบียบและข้อกำหนดการใช้ห้อง
            </h4>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              กรุณาจองล่วงหน้าอย่างน้อย 24 ชั่วโมง และปิดระบบไฟ/เครื่องปรับอากาศทุกครั้งหลังเสร็จสิ้นการใช้งาน
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => alert('คู่มือการจอง: 1. เลือกห้อง 2. ตรวจสอบเวลาว่าง 3. กรอกวัตถุประสงค์ 4. รอการอนุมัติ ภายใน 24 ชม.')}
          className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:underline shrink-0"
        >
          อ่านคู่มือการจองฉบับเต็ม
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </aside>
    </div>
  );
};
