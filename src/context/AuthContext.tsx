import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

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
  signUpWithEmail: (email: string, pass: string, name: string, role?: 'buyer' | 'merchant') => Promise<{ success: boolean; email: string }>;
  resendVerificationEmail: (email: string, pass: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  isVipClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Master credentials reference
export const MASTER_CREDENTIALS = {
  email: 'sharma.shivangiz105@gmail.com',
  password: 'Shivangi@1',
  displayName: 'Shivangi Sharma',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Enforce Firebase Authentication email verification: block access if email is not verified
        if (!currentUser.emailVerified) {
          setUser(null);
          localStorage.removeItem('luxora_auth_user');
          try {
            await signOut(auth);
          } catch (e) {
            // Ignore signout cleanup errors
          }
          setLoading(false);
          return;
        }

        const appU: AppUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Client',
          photoURL: currentUser.photoURL,
          role: 'buyer'
        };
        setUser(appU);
        localStorage.setItem('luxora_auth_user', JSON.stringify(appU));
      } else {
        setUser(null);
        localStorage.removeItem('luxora_auth_user');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string, role: 'buyer' | 'merchant' = 'buyer') => {
    const cleanEmail = email.trim().toLowerCase();
    
    let userCred;
    try {
      userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      // If master user not yet created in the project's Firebase Auth, create and send verification email
      if (cleanEmail === MASTER_CREDENTIALS.email.toLowerCase() && 
         (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          await updateProfile(newCred.user, { displayName: MASTER_CREDENTIALS.displayName });
          await sendEmailVerification(newCred.user);
          await signOut(auth);
          setUser(null);
          localStorage.removeItem('luxora_auth_user');

          const unverifiedErr: any = new Error('EMAIL_NOT_VERIFIED');
          unverifiedErr.code = 'auth/email-not-verified';
          unverifiedErr.email = cleanEmail;
          throw unverifiedErr;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-not-verified') {
            throw createErr;
          }
          throw err;
        }
      }
      throw err;
    }

    // Reload user record to get freshly verified status from Firebase Auth
    await userCred.user.reload();

    // If email is not verified, block access, send verification email and sign out
    if (!userCred.user.emailVerified) {
      try {
        await sendEmailVerification(userCred.user);
      } catch (sendErr) {
        console.warn('Verification email send notice:', sendErr);
      }

      await signOut(auth);
      setUser(null);
      localStorage.removeItem('luxora_auth_user');

      const unverifiedErr: any = new Error('EMAIL_NOT_VERIFIED');
      unverifiedErr.code = 'auth/email-not-verified';
      unverifiedErr.email = cleanEmail;
      throw unverifiedErr;
    }

    // User is verified, grant access
    const appU: AppUser = {
      uid: userCred.user.uid,
      email: userCred.user.email,
      displayName: userCred.user.displayName || cleanEmail.split('@')[0],
      photoURL: userCred.user.photoURL,
      role: role
    };
    setUser(appU);
    localStorage.setItem('luxora_auth_user', JSON.stringify(appU));
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: 'buyer' | 'merchant' = 'buyer') => {
    const cleanEmail = email.trim().toLowerCase();

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    
    if (name && userCredential.user) {
      try {
        await updateProfile(userCredential.user, { displayName: name });
      } catch (e) {
        console.warn('Profile name update warning:', e);
      }
    }

    // Send verification email using Firebase Authentication
    await sendEmailVerification(userCredential.user);

    // Enforce: Do not sign them in automatically
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('luxora_auth_user');

    return { success: true, email: cleanEmail };
  };

  const resendVerificationEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    await sendEmailVerification(userCred.user);
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('luxora_auth_user');
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
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('luxora_auth_user');
      setUser(null);
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out fallback:', e);
      setUser(null);
      localStorage.removeItem('luxora_auth_user');
    } finally {
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
        resendVerificationEmail,
        signInGoogle,
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

