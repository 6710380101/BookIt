import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Room, Booking, BookingStatus, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { INITIAL_ROOMS } from '../data/seedData';

interface BookingContextType {
  rooms: Room[];
  bookings: Booking[];
  loadingRooms: boolean;
  loadingBookings: boolean;
  checkTimeConflict: (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ) => { hasConflict: boolean; conflictingBooking?: Booking };
  createBooking: (bookingData: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    participants: number;
    equipment: string[];
  }) => Promise<string>;
  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
    rejectReason?: string
  ) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  getRoomById: (roomId: string) => Room | undefined;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper to convert "HH:mm" to minutes
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Real-time listener for Rooms
  useEffect(() => {
    if (!currentUser) {
      setRooms(INITIAL_ROOMS);
      setLoadingRooms(false);
      return;
    }

    const roomsRef = collection(db, 'rooms');
    const unsubscribeRooms = onSnapshot(
      roomsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedRooms: Room[] = [];
          snapshot.forEach((docSnap) => {
            loadedRooms.push({ id: docSnap.id, ...(docSnap.data() as Omit<Room, 'id'>) });
          });
          setRooms(loadedRooms);
        } else {
          setRooms(INITIAL_ROOMS);
        }
        setLoadingRooms(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'rooms');
        setLoadingRooms(false);
      }
    );

    return () => unsubscribeRooms();
  }, [currentUser]);

  // Seed initial demo bookings if empty once logged in
  const ensureInitialBookings = async () => {
    if (!currentUser) return;
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      if (snap.empty) {
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const initialList: Booking[] = [
          {
            id: 'BK-9021',
            userId: currentUser.uid,
            userName: userProfile?.name || 'อ. อารีญา ศรีวิลัย',
            userEmail: currentUser.email || 'areeya.s@school.ac.th',
            userRole: userProfile?.role || 'admin',
            roomId: 'room-1',
            roomName: 'ห้องปฏิบัติการคอมพิวเตอร์ 1',
            roomBuilding: 'อาคารเฉลิมพระเกียรติ ชั้น 3',
            date: todayStr,
            startTime: '13:00',
            endTime: '15:00',
            purpose: 'สอนวิชาวิทยาการคำนวณ ม.4/1 (เตรียมโปรเจกต์ AI Coding)',
            participants: 38,
            equipment: ['ไมโครโฟนไร้สาย (2 ตัว)', 'ปลั๊กพ่วงสายยาว 10 ม.'],
            status: 'approved',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'BK-9044',
            userId: currentUser.uid,
            userName: 'นายกานต์ พงษ์ศิริ',
            userEmail: 'karn.p@student.school.ac.th',
            userRole: 'student',
            roomId: 'room-3',
            roomName: 'หอประชุมใหญ่ อาคาร 4',
            roomBuilding: 'อาคารกิจกรรมกลาง ชั้น 1',
            date: tomorrowStr,
            startTime: '09:00',
            endTime: '12:00',
            purpose: 'การประชุมผู้ปกครองและแนะแนวการศึกษาต่อระดับอุดมศึกษา',
            participants: 250,
            equipment: ['ไมโครโฟนไร้สาย (2 ตัว)'],
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'BK-8992',
            userId: currentUser.uid,
            userName: userProfile?.name || 'อ. อารีญา ศรีวิลัย',
            userEmail: currentUser.email || 'areeya.s@school.ac.th',
            userRole: userProfile?.role || 'admin',
            roomId: 'room-6',
            roomName: 'ห้อง Smart Classroom 302',
            roomBuilding: 'อาคาร 3 ชั้น 3',
            date: tomorrowStr,
            startTime: '10:00',
            endTime: '11:30',
            purpose: 'ติวสอบ O-NET ภาษาอังกฤษ เสริมทักษะการฟังและการพูด',
            participants: 30,
            equipment: [],
            status: 'rejected',
            rejectReason: 'มีการใช้งานซ้ำซ้อนกับกิจกรรมวิชาการระดับมัธยมปลาย',
            createdAt: new Date().toISOString(),
          },
        ];

        for (const item of initialList) {
          await setDoc(doc(db, 'bookings', item.id), item);
        }
      }
    } catch (e) {
      console.warn('Initial bookings check/seed:', e);
    }
  };

  // Real-time listener for Bookings
  useEffect(() => {
    if (!currentUser) {
      setBookings([]);
      setLoadingBookings(false);
      return;
    }

    ensureInitialBookings();

    const bookingsRef = collection(db, 'bookings');
    const unsubscribeBookings = onSnapshot(
      bookingsRef,
      (snapshot) => {
        const loaded: Booking[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Booking, 'id'>) });
        });

        // Sort by date then startTime desc
        loaded.sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return a.startTime.localeCompare(b.startTime);
        });

        setBookings(loaded);
        setLoadingBookings(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
        setLoadingBookings(false);
      }
    );

    return () => unsubscribeBookings();
  }, [currentUser]);

  // Conflict Checking Engine (Double-booking prevention)
  const checkTimeConflict = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): { hasConflict: boolean; conflictingBooking?: Booking } => {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    // Look for approved bookings for the same room on the same date
    const conflicting = bookings.find((b) => {
      if (b.id === excludeBookingId) return false;
      if (b.roomId !== roomId) return false;
      if (b.date !== date) return false;
      if (b.status !== 'approved') return false; // Only approved bookings lock the slot

      const existingStart = timeToMinutes(b.startTime);
      const existingEnd = timeToMinutes(b.endTime);

      // Overlap condition: start < otherEnd && end > otherStart
      return newStart < existingEnd && newEnd > existingStart;
    });

    return {
      hasConflict: !!conflicting,
      conflictingBooking: conflicting,
    };
  };

  const getRoomById = (roomId: string): Room | undefined => {
    return rooms.find((r) => r.id === roomId);
  };

  // Create new booking with duplicate check
  const createBooking = async (data: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    participants: number;
    equipment: string[];
  }): Promise<string> => {
    if (!currentUser || !userProfile) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการจอง');
    }

    const room = getRoomById(data.roomId);
    if (!room) {
      throw new Error('ไม่พบข้อมูลห้องที่เลือก');
    }

    if (!room.isActive) {
      throw new Error('ห้องนี้กำลังปิดปรับปรุงชั่วคราว ไม่สามารถจองได้');
    }

    // Validate times
    const startMin = timeToMinutes(data.startTime);
    const endMin = timeToMinutes(data.endTime);
    if (endMin <= startMin) {
      throw new Error('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
    }

    // Strict Double-Booking Check
    const conflict = checkTimeConflict(data.roomId, data.date, data.startTime, data.endTime);
    if (conflict.hasConflict && conflict.conflictingBooking) {
      throw new Error(
        `ไม่สามารถจองได้ เนื่องจากห้อง "${room.name}" มีการจองที่อนุมัติแล้วในช่วงเวลา ${conflict.conflictingBooking.startTime} - ${conflict.conflictingBooking.endTime} น. กรุณาเลือกช่วงเวลาอื่น`
      );
    }

    // Generate unique reference code: BK-YYYY-MMDD-XXX
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingId = `BK-${dateFormatted}-${randomSuffix}`;

    const newBooking: Booking = {
      id: bookingId,
      userId: currentUser.uid,
      userName: userProfile.name,
      userEmail: userProfile.email,
      userRole: userProfile.role,
      roomId: room.id,
      roomName: room.name,
      roomBuilding: room.building,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose.trim(),
      participants: Number(data.participants) || 1,
      equipment: data.equipment,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'bookings', bookingId), newBooking);
      return bookingId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingId}`);
    }
  };

  // Admin approves or rejects booking
  const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
    rejectReason?: string
  ): Promise<void> => {
    if (userProfile?.role !== 'admin') {
      throw new Error('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถอนุมัติหรือปฏิเสธคำขอได้');
    }

    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) {
      throw new Error('ไม่พบข้อมูลคำขอจอง');
    }

    // If approving, verify that no conflicting approved booking was added in between
    if (status === 'approved') {
      const conflict = checkTimeConflict(
        targetBooking.roomId,
        targetBooking.date,
        targetBooking.startTime,
        targetBooking.endTime,
        bookingId
      );
      if (conflict.hasConflict && conflict.conflictingBooking) {
        throw new Error(
          `ไม่สามารถอนุมัติได้ เนื่องจากมีคำขออื่น (${conflict.conflictingBooking.id}) ได้รับการอนุมัติในช่วงเวลาทับซ้อนแล้ว (${conflict.conflictingBooking.startTime} - ${conflict.conflictingBooking.endTime} น.)`
        );
      }
    }

    const bookingRef = doc(db, 'bookings', bookingId);
    const updatePayload: Partial<Booking> = { status };
    if (rejectReason !== undefined) {
      updatePayload.rejectReason = rejectReason.trim();
    }

    try {
      await updateDoc(bookingRef, updatePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  // User cancels their own booking
  const cancelBooking = async (bookingId: string): Promise<void> => {
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบ');

    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) throw new Error('ไม่พบข้อมูลคำขอจอง');

    if (targetBooking.userId !== currentUser.uid && userProfile?.role !== 'admin') {
      throw new Error('คุณสามารถยกเลิกได้เฉพาะการจองของตนเองเท่านั้น');
    }

    const bookingRef = doc(db, 'bookings', bookingId);
    try {
      await updateDoc(bookingRef, { status: 'cancelled' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const deleteBooking = async (bookingId: string): Promise<void> => {
    if (userProfile?.role !== 'admin') {
      throw new Error('เฉพาะผู้ดูแลระบบที่สามารถลบรายการได้');
    }
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bookings/${bookingId}`);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        rooms,
        bookings,
        loadingRooms,
        loadingBookings,
        checkTimeConflict,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        deleteBooking,
        getRoomById,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
