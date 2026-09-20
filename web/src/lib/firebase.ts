// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC41s_Kz-wZjot5D3SH3cbjaUVcfsjO-N8",
  authDomain: "our-sky-964a4.firebaseapp.com",
  projectId: "our-sky-964a4",
  storageBucket: "our-sky-964a4.firebasestorage.app",
  messagingSenderId: "859965599998",
  appId: "1:859965599998:web:bb9e81496d6b45305eb5af",
  measurementId: "G-GH8CT0YM5Z"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    void signInAnonymously(auth);
  }
});
