import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCmgSq8TLjLTjV70ykVOrCuGWRMjPV7w8",
  authDomain: "darpan360ai.firebaseapp.com",
  databaseURL: "https://darpan360ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "darpan360ai",
  storageBucket: "darpan360ai.firebasestorage.app",
  messagingSenderId: "607679095858",
  appId: "1:607679095858:web:f36bebe4015ec89ca0c82b",
  measurementId: "G-BJPD14NKDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
