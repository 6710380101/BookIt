export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type RoomCategory = 'all' | 'computer' | 'meeting' | 'hall' | 'science' | 'smart';

export interface Room {
  id: string;
  name: string;
  type: 'computer' | 'meeting' | 'hall' | 'science' | 'smart';
  typeName: string;
  capacity: number;
  building: string;
  floor?: string;
  imageUrl: string;
  isActive: boolean;
  equipment: string[];
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  roomId: string;
  roomName: string;
  roomBuilding: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: string;
  participants: number;
  equipment: string[];
  status: BookingStatus;
  rejectReason?: string;
  createdAt: string;
}

export type NavigationTab = 'dashboard' | 'rooms' | 'my-bookings' | 'admin-console' | 'profile' | 'new-booking';

export interface DemoAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  password: string;
  avatarUrl?: string;
}
