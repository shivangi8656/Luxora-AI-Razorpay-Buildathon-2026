import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration provided by client
export const firebaseConfig = {
  apiKey: "AIzaSyDP378e-kSuMMBqacguYcI7ldmkReQW3qs",
  authDomain: "luxora-ai-76ab7.firebaseapp.com",
  projectId: "luxora-ai-76ab7",
  storageBucket: "luxora-ai-76ab7.firebasestorage.app",
  messagingSenderId: "766437284022",
  appId: "1:766437284022:web:84f2641d6634fe1868ee17"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
