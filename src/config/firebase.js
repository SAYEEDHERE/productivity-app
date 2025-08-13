import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAIWm0G9AsHdTHFJyUnSuN_Ibg0TG4YfJg",
  authDomain: "to-do-app-7d77b.firebaseapp.com",
  projectId: "to-do-app-7d77b",
  storageBucket: "to-do-app-7d77b.firebasestorage.app",
  messagingSenderId: "89932471050",
  appId: "1:89932471050:web:2df3e49046d0a263fb38f3",
  measurementId: "G-V6P5SLB0GT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
