import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_XvKmpnc9NBY7PBJ1lphKy4sYEMAx6MY",
  authDomain: "modern-barber-203fd.firebaseapp.com",
  projectId: "modern-barber-203fd",
  storageBucket: "modern-barber-203fd.firebasestorage.app",
  messagingSenderId: "882260298272",
  appId: "1:882260298272:web:f38a9d90f55213f4688a45",
  measurementId: "G-N82VF8XME4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
