import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { UserProfile, UserRole, DemoAccount } from '../types';
import { INITIAL_ROOMS, DEMO_ACCOUNTS } from '../data/seedData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, requestedRole?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoUser: (demo: DemoAccount) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initialize DB seed rooms if empty
  const ensureInitialRooms = async () => {
    try {
      const snap = await getDocs(collection(db, 'rooms'));
      if (snap.empty) {
        for (const room of INITIAL_ROOMS) {
          await setDoc(doc(db, 'rooms', room.id), room);
        }
      }
    } catch (err) {
      console.warn('Initial rooms check/seed:', err);
    }
  };

  useEffect(() => {
    testConnection();
    ensureInitialRooms();
  }, []);

  // Listen to Auth state changes and real-time Firestore profile
  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Real-time listener for current user's profile
        const userRef = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(
          userRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              setUserProfile(snapshot.data() as UserProfile);
            } else {
              // Create user profile if first time
              const isDefaultAdmin =
                user.email === 't.gan5140@gmail.com' ||
                user.email === 'areeya.s@school.ac.th';
              
              const newProfile: UserProfile = {
                uid: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
                email: user.email || '',
                role: isDefaultAdmin ? 'admin' : 'student', // new user defaults to student
                department: isDefaultAdmin ? 'ผู้ดูแลระบบงานเทคโนโลยี' : 'นักเรียน / นักศึกษา',
                phone: '02-xxx-xxxx',
                avatarUrl: user.photoURL || undefined,
                createdAt: new Date().toISOString(),
              };

              try {
                await setDoc(userRef, newProfile);
                setUserProfile(newProfile);
              } catch (writeErr) {
                handleFirestoreError(writeErr, OperationType.WRITE, `users/${user.uid}`);
              }
            }
            setLoading(false);
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      setLoading(false);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบใหม่อีกครั้ง');
      } else if (code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setError('เข้าสู่ระบบไม่สำเร็จ: กรุณาลองใหม่อีกครั้ง');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    requestedRole?: UserRole
  ) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      // New user is automatically "student", unless it's the bootstrapped admin
      const isDefaultAdmin = email === 't.gan5140@gmail.com' || email === 'areeya.s@school.ac.th';
      const assignedRole: UserRole = isDefaultAdmin ? 'admin' : (requestedRole === 'teacher' ? 'teacher' : 'student');

      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: assignedRole,
        department: assignedRole === 'teacher' ? 'ครูผู้สอน' : (assignedRole === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน / นักศึกษา'),
        phone: '02-xxx-xxxx',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err: unknown) {
      setLoading(false);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาเข้าสู่ระบบแทน');
      } else if (code === 'auth/weak-password') {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else {
        setError('การสมัครสมาชิกล้มเหลว กรุณาตรวจสอบข้อมูล');
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      setLoading(false);
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user') {
        setError('การเข้าสู่ระบบด้วย Google ล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }
      throw err;
    }
  };

  // One-click login as Demo Account (Admin, Teachers, Students)
  const signInAsDemoUser = async (demo: DemoAccount) => {
    setError(null);
    setLoading(true);
    try {
      // Attempt login
      try {
        await signInWithEmailAndPassword(auth, demo.email, demo.password);
      } catch (loginErr: unknown) {
        const code = (loginErr as { code?: string })?.code;
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
          // Create account if not present yet
          const cred = await createUserWithEmailAndPassword(auth, demo.email, demo.password);
          const profile: UserProfile = {
            uid: cred.user.uid,
            name: demo.name,
            email: demo.email,
            role: demo.role,
            department: demo.department,
            phone: demo.phone,
            avatarUrl: demo.avatarUrl,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', cred.user.uid), profile);
        } else {
          throw loginErr;
        }
      }
    } catch (err) {
      setLoading(false);
      setError(`ไม่สามารถเข้าสู่ระบบด้วยบัญชี ${demo.name} ได้`);
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนบทบาทผู้ใช้ได้');
    }
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { role: newRole }, { merge: true });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        error,
        clearError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsDemoUser,
        signOut,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
