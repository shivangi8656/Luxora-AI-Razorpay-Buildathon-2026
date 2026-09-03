import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { saveUserToFirestore } from '../lib/firebaseService';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: 'buyer' | 'merchant' | 'admin';
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string, role?: 'buyer' | 'merchant') => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: 'buyer' | 'merchant') => Promise<void>;
  signInGoogle: () => Promise<void>;
  loginWithMasterDemo: (role?: 'buyer' | 'merchant') => void;
  logOut: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  isVipClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Master credentials requested by user
export const MASTER_CREDENTIALS = {
  email: 'sharma.shivangiz105@gmail.com',
  password: '12345',
  displayName: 'Shivangi Sharma',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    // Check localStorage for saved session
    const saved = localStorage.getItem('luxora_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const appU: AppUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || 'Shivangi Sharma',
          photoURL: currentUser.photoURL,
          role: 'buyer'
        };
        setUser(appU);
        localStorage.setItem('luxora_auth_user', JSON.stringify(appU));
        saveUserToFirestore(appU);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string, role: 'buyer' | 'merchant' = 'buyer') => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check master credential match (support exact match as specified)
    if (cleanEmail === MASTER_CREDENTIALS.email.toLowerCase() && pass === MASTER_CREDENTIALS.password) {
      const demoUser: AppUser = {
        uid: 'user-shivangi-master',
        email: MASTER_CREDENTIALS.email,
        displayName: MASTER_CREDENTIALS.displayName,
        role: role
      };
      setUser(demoUser);
      localStorage.setItem('luxora_auth_user', JSON.stringify(demoUser));
      saveUserToFirestore(demoUser);
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const appU: AppUser = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        displayName: userCred.user.displayName || email.split('@')[0],
        photoURL: userCred.user.photoURL,
        role: role
      };
      setUser(appU);
      localStorage.setItem('luxora_auth_user', JSON.stringify(appU));
      saveUserToFirestore(appU);
    } catch (err: any) {
      // If Firebase fails due to credential formatting or network, but it's the master email
      if (cleanEmail === MASTER_CREDENTIALS.email.toLowerCase()) {
        const demoUser: AppUser = {
          uid: 'user-shivangi-master',
          email: MASTER_CREDENTIALS.email,
          displayName: MASTER_CREDENTIALS.displayName,
          role: role
        };
        setUser(demoUser);
        localStorage.setItem('luxora_auth_user', JSON.stringify(demoUser));
        saveUserToFirestore(demoUser);
        return;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: 'buyer' | 'merchant' = 'buyer') => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === MASTER_CREDENTIALS.email.toLowerCase()) {
      const demoUser: AppUser = {
        uid: 'user-shivangi-master',
        email: MASTER_CREDENTIALS.email,
        displayName: name || MASTER_CREDENTIALS.displayName,
        role: role
      };
      setUser(demoUser);
      localStorage.setItem('luxora_auth_user', JSON.stringify(demoUser));
      saveUserToFirestore(demoUser);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    const appU: AppUser = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name || userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
      role: role
    };
    setUser(appU);
    localStorage.setItem('luxora_auth_user', JSON.stringify(appU));
    saveUserToFirestore(appU);
  };

  const loginWithMasterDemo = (role: 'buyer' | 'merchant' = 'buyer') => {
    const demoUser: AppUser = {
      uid: 'user-shivangi-master',
      email: MASTER_CREDENTIALS.email,
      displayName: MASTER_CREDENTIALS.displayName,
      role: role
    };
    setUser(demoUser);
    localStorage.setItem('luxora_auth_user', JSON.stringify(demoUser));
    saveUserToFirestore(demoUser);
  };

  const signInGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const appU: AppUser = {
      uid: res.user.uid,
      email: res.user.email,
      displayName: res.user.displayName,
      photoURL: res.user.photoURL,
      role: 'buyer'
    };
    setUser(appU);
    localStorage.setItem('luxora_auth_user', JSON.stringify(appU));
    saveUserToFirestore(appU);
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('luxora_auth_user');
      setUser(null);
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out local reset fallback:', e);
      setUser(null);
      localStorage.removeItem('luxora_auth_user');
    } finally {
      // Force a complete clean reset of the application state to root index page
      window.location.href = '/';
    }
  };

  const logOut = handleSignOut;

  const isVipClient = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInGoogle,
        loginWithMasterDemo,
        logOut,
        handleSignOut,
        isVipClient,
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
