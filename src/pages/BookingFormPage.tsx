import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking, timeToMinutes } from '../context/BookingContext';
import { NavigationTab } from '../types';

interface BookingFormPageProps {
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
  setCurrentTab: (tab: NavigationTab) => void;
}

export const BookingFormPage: React.FC<BookingFormPageProps> = ({
  selectedRoomId,
  setSelectedRoomId,
  setCurrentTab,
}) => {
  const { userProfile } = useAuth();
  const { rooms, createBooking, checkTimeConflict, getRoomById } = useBooking();

  const room = getRoomById(selectedRoomId) || rooms[0];

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(defaultDateStr);
  const [participants, setParticipants] = useState<number>(35);
  const [startTime, setStartTime] = useState<string>('13:00');
  const [endTime, setEndTime] = useState<string>('15:00');
  const [purpose, setPurpose] = useState<string>(
    'จัดกิจกรรมการเรียนการสอนวิชาวิทยาการคำนวณ ชั้นมัธยมศึกษาปีที่ 4/1 หน่วยการเรียนรู้ปัญญาประดิษฐ์และการสร้างแบบจำลอง'
  );
  const [accessories, setAccessories] = useState<string[]>([
    'ไมโครโฟนไร้สาย (ชุด 2 ตัว + แบตเตอรี่สำรอง)',
    'ปลั๊กพ่วงสายยาว (มาตรฐาน มอก. ยาว 10 เมตร)',
  ]);

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Time slot options
  const timeOptions = [
    '08:30',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '16:30',
    '17:00',
    '18:00',
  ];

  // Validate conflict in real time as user modifies date / times
  useEffect(() => {
    if (!room) return;
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) {
      setConflictError('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    const conflict = checkTimeConflict(room.id, date, startTime, endTime);
    if (conflict.hasConflict && conflict.conflictingBooking) {
      setConflictError(
        `ช่วงเวลาทับซ้อนกับการจอง #${conflict.conflictingBooking.id} (${conflict.conflictingBooking.startTime} - ${conflict.conflictingBooking.endTime} น.) ที่ได้รับการอนุมัติแล้ว`
      );
    } else {
      setConflictError(null);
    }
  }, [room, date, startTime, endTime, checkTimeConflict]);

  const toggleAccessory = (item: string) => {
    if (accessories.includes(item)) {
      setAccessories(accessories.filter((a) => a !== item));
    } else {
      setAccessories([...accessories, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    if (conflictError) {
      alert(conflictError);
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await createBooking({
        roomId: room.id,
        date,
        startTime,
        endTime,
        purpose,
        participants: Number(participants) || 1,
        equipment: accessories,
      });

      setCreatedBookingId(newId);
      setShowSuccessModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefCode = () => {
    if (createdBookingId && navigator.clipboard) {
      navigator.clipboard.writeText(createdBookingId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!room) {
    return (
      <div className="py-16 text-center">
        <p>ไม่พบข้อมูลห้อง กรุณาเลือกห้องจากรายการ</p>
        <button
          onClick={() => setCurrentTab('rooms')}
          className="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded-lg"
        >
          กลับหน้ารายการห้อง
        </button>
      </div>
    );
  }

  // Duration in hours
  const durationHours = Math.max(0.5, (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Context Navigation Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg pt-4">
        <div className="flex items-center gap-space-xs text-on-surface-variant text-[13px] font-semibold">
          <button
            onClick={() => setCurrentTab('rooms')}
            className="hover:text-primary transition-colors"
          >
            ห้องและสถานที่
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">
            chevron_right
          </span>
          <span className="text-on-surface font-bold">แบบฟอร์มการขอใช้งานห้องและอุปกรณ์</span>
        </div>
        <div className="flex items-center gap-space-sm bg-surface-container-high px-space-md py-1.5 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
          <span className="text-[12px] font-semibold text-on-surface-variant">
            ระบบอนุมัติอัตโนมัติภายใน 24 ชม.
          </span>
        </div>
      </div>

      {/* Primary Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Booking Form (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Selected Room Highlight Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary-fixed/30 pointer-events-none blur-2xl"></div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md relative z-10">
              <div className="flex items-center gap-space-md">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold">
                      {room.typeName}
                    </span>
                    <span className="text-outline-variant text-[12px]">•</span>
                    <span className="text-on-surface-variant text-[12px] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">chair</span>
                      ความจุ {room.capacity} ที่นั่ง
                    </span>
                  </div>
                  <h2 className="text-[18px] font-bold text-on-surface leading-tight">
                    {room.name}
                  </h2>
                  <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      location_on
                    </span>
                    {room.building}
                  </p>
                </div>
              </div>

              {/* Change room select / button */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-surface-container-low text-primary text-[12px] font-bold border border-surface-container-high focus:outline-none cursor-pointer"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} disabled={!r.isActive}>
                      {r.name} {!r.isActive ? '(ปิดปรับปรุง)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Form Wrapper */}
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg"
          >
            {/* Step Header */}
            <div className="flex items-center justify-between pb-space-sm">
              <div>
                <h3 className="text-[20px] font-bold text-on-surface">ข้อมูลการขอใช้บริการ</h3>
                <p className="text-[12px] text-on-surface-variant">
                  กรอกข้อมูลให้ครบถ้วนเพื่อประกอบการพิจารณาอนุญาต
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary text-[12px] font-bold">
                ขั้นตอนที่ 1 จาก 1
              </span>
            </div>

            {/* Date & Participants Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md">
              {/* Date Picker */}
              <div className="sm:col-span-7 flex flex-col gap-space-xs">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    calendar_today
                  </span>
                  วันที่ต้องการใช้งาน <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface text-[14px] font-medium shadow-sm focus:outline-none focus:bg-surface-container cursor-pointer"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  สามารถจองล่วงหน้าได้ไม่เกิน 30 วัน
                </span>
              </div>

              {/* Participants Count */}
              <div className="sm:col-span-5 flex flex-col gap-space-xs">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                  จำนวนผู้ร่วมใช้ (คน) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={room.capacity}
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    required
                    className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface text-[14px] shadow-sm focus:outline-none focus:bg-surface-container"
                  />
                  <span className="text-[11px] text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    / {room.capacity} สูงสุด
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  ไม่เกินความจุที่ห้องรองรับ ({room.capacity} ที่นั่ง)
                </span>
              </div>
            </div>

            {/* Time Picker & Availability Visualizer */}
            <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                  ช่วงเวลาการใช้งาน <span className="text-error">*</span>
                </label>

                {conflictError ? (
                  <span className="text-[12px] text-error flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    ช่วงเวลาทับซ้อน
                  </span>
                ) : (
                  <span className="text-[12px] text-tertiary flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    ห้องว่างในรอบที่เลือก
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div>
                  <span className="text-[11px] text-on-surface-variant block mb-1">เวลาเริ่มต้น</span>
                  <div className="relative">
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest text-on-surface text-[14px] shadow-sm appearance-none focus:outline-none cursor-pointer"
                    >
                      {timeOptions.slice(0, -1).map((t) => (
                        <option key={t} value={t}>
                          {t} น.
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-on-surface-variant block mb-1">เวลาสิ้นสุด</span>
                  <div className="relative">
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-lowest text-on-surface text-[14px] shadow-sm appearance-none focus:outline-none cursor-pointer"
                    >
                      {timeOptions.slice(1).map((t) => (
                        <option key={t} value={t}>
                          {t} น.
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {conflictError && (
                <div className="p-2.5 rounded-lg bg-error-container text-error text-[12px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{conflictError}</span>
                </div>
              )}

              {/* Timeline Availability Bar Visual */}
              <div className="flex flex-col gap-1.5 mt-space-xs pt-space-xs">
                <div className="flex justify-between text-outline text-[11px]">
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                </div>
                <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden flex relative">
                  <div className="h-full bg-surface-dim" style={{ width: '20%' }} title="08:00 - 10:00 ติดสอน"></div>
                  <div className="h-full bg-tertiary-fixed/40" style={{ width: '20%' }} title="10:00 - 12:00 ว่าง"></div>
                  <div className="h-full bg-surface-dim" style={{ width: '10%' }} title="12:00 - 13:00 พักกลางวัน"></div>
                  <div
                    className="h-full bg-primary-container relative flex items-center justify-center text-on-primary text-[10px] font-bold"
                    style={{ width: '20%' }}
                    title="ช่วงที่คุณกำลังเลือก"
                  >
                    เลือก
                  </div>
                  <div className="h-full bg-tertiary-fixed/40" style={{ width: '30%' }} title="15:00 - 18:00 ว่าง"></div>
                </div>
                <div className="flex items-center gap-space-md text-[11px] text-on-surface-variant pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-primary-container inline-block"></span>
                    ช่วงเวลาที่ท่านเลือก
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-surface-dim inline-block"></span>
                    ไม่ว่าง / ปิดรอบ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-tertiary-fixed/60 inline-block"></span>
                    ว่างพร้อมจอง
                  </span>
                </div>
              </div>
            </div>

            {/* Purpose Textarea */}
            <div className="flex flex-col gap-space-xs">
              <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
                วัตถุประสงค์และรายละเอียดการใช้งาน <span className="text-error">*</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="ระบุเหตุผล เช่น จัดกิจกรรมการเรียนการสอน, อบรมเชิงปฏิบัติการ, จัดการแข่งขัน..."
                required
                rows={3}
                className="w-full p-space-md rounded-lg bg-surface-container-low text-on-surface text-[14px] resize-none shadow-sm focus:outline-none focus:bg-surface-container"
              />
              <span className="text-[11px] text-on-surface-variant">
                ข้อมูลนี้จะถูกส่งให้หัวหน้ากลุ่มสาระและรองผู้อำนวยการอนุมัติ
              </span>
            </div>

            {/* Additional Equipment Checklist */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">devices_other</span>
                  ยืมอุปกรณ์เสริมเพิ่มเติม (อุปกรณ์โสตทัศนูปกรณ์)
                </label>
                <span className="text-[11px] text-outline">ไม่คิดค่าบริการเพิ่ม</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                {[
                  {
                    title: 'ไมโครโฟนไร้สาย',
                    sub: 'ชุด 2 ตัว + แบตเตอรี่สำรอง',
                    val: 'ไมโครโฟนไร้สาย (ชุด 2 ตัว + แบตเตอรี่สำรอง)',
                  },
                  {
                    title: 'ปลั๊กพ่วงสายยาว',
                    sub: 'มาตรฐาน มอก. ยาว 10 เมตร',
                    val: 'ปลั๊กพ่วงสายยาว (มาตรฐาน มอก. ยาว 10 เมตร)',
                  },
                  {
                    title: 'กล้องบันทึกการสอน',
                    sub: 'พร้อมขาตั้งสำหรับไลฟ์สด',
                    val: 'กล้องบันทึกการสอน (พร้อมขาตั้งสำหรับไลฟ์สด)',
                  },
                ].map((item, idx) => {
                  const checked = accessories.includes(item.val);
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAccessory(item.val)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-on-surface">{item.title}</span>
                        <span className="text-[11px] text-on-surface-variant">{item.sub}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Instructor Note */}
            <div className="p-space-md rounded-xl bg-surface-container-high/60 flex items-start gap-space-md">
              <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0 mt-0.5">
                info
              </span>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-on-surface">
                  เงื่อนไขการใช้ห้องปฏิบัติการ
                </span>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  กรุณาดูแลรักษาความสะอาด ปิดเครื่องปรับอากาศและเครื่องคอมพิวเตอร์ทุกเครื่องหลังเสร็จสิ้นการใช้งาน และส่งมอบกุญแจคืนที่ห้องธุรการภายใน 17:00 น.
                </p>
              </div>
            </div>

            {/* Submission Buttons */}
            <div className="pt-space-sm flex flex-col sm:flex-row items-center gap-space-md">
              <button
                type="submit"
                disabled={isSubmitting || !!conflictError}
                className="w-full sm:flex-1 h-12 px-space-lg rounded-xl bg-primary-container text-on-primary text-[16px] font-bold flex items-center justify-center gap-space-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    กำลังส่งคำขอ...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">send</span>
                    ส่งคำขอจองห้อง
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPurpose('');
                  setAccessories([]);
                }}
                className="w-full sm:w-auto h-12 px-space-lg rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface text-[14px] font-semibold transition-colors"
              >
                ล้างข้อมูล
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Summary & Approval Workflow */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Realtime Summary Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
                <h3 className="text-[18px] font-bold text-on-surface">สรุปคำขอใช้งาน</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                แบบร่างคำขอ
              </span>
            </div>

            <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl text-[13px]">
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">ห้องที่เลือก:</span>
                <span className="text-on-surface text-right font-bold">{room.name}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">วันที่ใช้งาน:</span>
                <span className="text-on-surface text-right font-medium">{date}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">ระยะเวลา:</span>
                <span className="text-primary font-bold text-right">
                  {startTime} - {endTime} น. ({durationHours} ชม.)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">จำนวนนักเรียน:</span>
                <span className="text-on-surface text-right font-medium">{participants} คน</span>
              </div>
              <div className="flex justify-between items-start py-1">
                <span className="text-on-surface-variant">อุปกรณ์เสริม:</span>
                <div className="text-right flex flex-col items-end text-[12px]">
                  {accessories.length > 0 ? (
                    accessories.map((acc, i) => (
                      <span key={i} className="text-on-surface">
                        • {acc.split('(')[0]}
                      </span>
                    ))
                  ) : (
                    <span className="text-outline">ไม่มี</span>
                  )}
                </div>
              </div>
            </div>

            {/* Approval Route */}
            <div className="flex flex-col gap-space-sm pt-space-xs">
              <span className="text-[12px] font-bold text-on-surface-variant">
                ลำดับขั้นการอนุมัติ (Workflow)
              </span>
              <div className="flex items-center gap-space-sm">
                <div className="flex items-center gap-1.5 text-[12px] text-tertiary font-bold">
                  <span className="w-5 h-5 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center text-[11px] font-bold">
                    1
                  </span>
                  <span>ยื่นคำขอ</span>
                </div>
                <span className="text-outline-variant">→</span>
                <div className="flex items-center gap-1.5 text-[12px] text-on-surface font-bold">
                  <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[11px] font-bold">
                    2
                  </span>
                  <span>ผู้ดูแลห้อง</span>
                </div>
                <span className="text-outline-variant">→</span>
                <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
                  <span className="w-5 h-5 rounded-full bg-surface-container text-outline flex items-center justify-center text-[11px] font-bold">
                    3
                  </span>
                  <span>เสร็จสมบูรณ์</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-space-md rounded-xl bg-surface-container flex items-center gap-space-md">
              <span className="material-symbols-outlined text-primary text-[28px]">
                notifications_active
              </span>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                คุณจะได้รับการแจ้งเตือนผลการจองผ่านระบบและอีเมลทางการของสถานศึกษาทันทีที่ได้รับการพิจารณา
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL (Exact match from mockup) */}
      {showSuccessModal && createdBookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Ambient decorative elements */}
            <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-tertiary-fixed/30 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>

            {/* Live Demo Header */}
            <div className="w-full flex items-center justify-between pb-space-sm mb-space-sm">
              <span className="text-[12px] text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                จองสำเร็จ (SUCCESS STATE)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary text-[11px] font-bold">
                สำเร็จ
              </span>
            </div>

            {/* Check Icon Hero */}
            <div className="relative my-space-sm">
              <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-md">
                <span
                  className="material-symbols-outlined text-[48px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-[24px] font-bold text-on-surface mt-space-xs">
              ส่งคำขอจองเรียบร้อยแล้ว!
            </h3>
            <p className="text-[14px] text-on-surface-variant max-w-sm mt-1">
              ระบบได้บันทึกคำขอของคุณเข้าสู่ระบบการจัดสรรทรัพยากรสถานศึกษาแล้ว
            </p>

            {/* Reference Code Pill */}
            <div className="mt-space-md px-space-lg py-2.5 rounded-full bg-surface-container-high flex items-center gap-space-sm shadow-sm">
              <span className="text-[12px] text-on-surface-variant uppercase font-semibold">
                รหัสอ้างอิง:
              </span>
              <span className="text-[14px] text-primary tracking-wide font-mono font-bold">
                {createdBookingId}
              </span>
              <button
                type="button"
                onClick={copyRefCode}
                aria-label="คัดลอกรหัส"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedCode ? 'done' : 'content_copy'}
                </span>
              </button>
            </div>

            {/* Condensed Ticket Details */}
            <div className="w-full my-space-lg p-space-md rounded-xl bg-surface-container-low text-left flex flex-col gap-space-xs shadow-sm text-[13px]">
              <div className="flex items-center gap-space-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
                <span>
                  {room.name} ({room.building})
                </span>
              </div>
              <div className="flex items-center gap-space-sm text-on-surface-variant pl-7">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                <span>
                  {date} • {startTime} - {endTime} น.
                </span>
              </div>
              {accessories.length > 0 && (
                <div className="flex items-center gap-space-sm text-on-surface-variant pl-7">
                  <span className="material-symbols-outlined text-[16px]">check_box</span>
                  <span className="truncate">
                    อุปกรณ์เสริม: {accessories.map((a) => a.split('(')[0]).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Official Status Explanatory Box */}
            <div className="p-space-md rounded-xl bg-surface-container text-left flex items-start gap-space-sm mb-space-lg w-full">
              <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">
                verified_user
              </span>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                ระบบได้ส่งคำขอไปยังผู้ดูแลระบบเรียบร้อยแล้ว เจ้าหน้าที่จะพิจารณาและแจ้งผลอนุมัติผ่านระบบและอีเมลของคุณ (
                <span className="font-semibold text-on-surface">{userProfile?.email}</span>)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row w-full gap-space-sm">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentTab('my-bookings');
                }}
                className="flex-1 h-11 px-space-md rounded-lg bg-primary-container text-on-primary text-[14px] font-semibold flex items-center justify-center gap-space-xs hover:brightness-110 active:scale-[0.99] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                ไปที่หน้าการจองของฉัน
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentTab('dashboard');
                }}
                className="flex-1 h-11 px-space-md rounded-lg bg-surface-container text-on-surface text-[14px] font-semibold flex items-center justify-center gap-space-xs hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
