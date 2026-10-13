import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { RoomsPage } from './pages/RoomsPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { NavigationTab } from './types';

const MainApp: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-1');

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-lg animate-pulse">
          <span className="material-symbols-outlined text-[32px]">meeting_room</span>
        </div>
        <p className="text-[14px] font-semibold text-primary">กำลังโหลด BookIt School...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-0">
      {/* Sticky Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin pt-20 flex-1 bg-surface">
        {currentTab === 'dashboard' && (
          <Dashboard
            setCurrentTab={setCurrentTab}
            onSelectRoomForBooking={(roomId) => setSelectedRoomId(roomId)}
          />
        )}
        {currentTab === 'rooms' && (
          <RoomsPage
            setCurrentTab={setCurrentTab}
            onSelectRoomForBooking={(roomId) => setSelectedRoomId(roomId)}
          />
        )}
        {currentTab === 'new-booking' && (
          <BookingFormPage
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            setCurrentTab={setCurrentTab}
          />
        )}
        {currentTab === 'my-bookings' && (
          <MyBookingsPage
            setCurrentTab={setCurrentTab}
            onSelectRoomForBooking={(roomId) => setSelectedRoomId(roomId)}
          />
        )}
        {currentTab === 'admin-console' && <AdminPage />}
        {currentTab === 'profile' && <ProfilePage />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Desktop Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainApp />
      </BookingProvider>
    </AuthProvider>
  );
}
