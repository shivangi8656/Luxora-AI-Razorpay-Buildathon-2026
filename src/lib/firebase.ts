import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration provided by client
export const firebaseConfig = {
  apiKey: "AIzaSyCoH60vsg3w-jtYwJ7Uz4p8Gy_LilCwpwI",
  authDomain: "luxora-ai-bdbc2.firebaseapp.com",
  projectId: "luxora-ai-bdbc2",
  storageBucket: "luxora-ai-bdbc2.firebasestorage.app",
  messagingSenderId: "928737895297",
  appId: "1:928737895297:web:f1d6cad3d5b1197126be80"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
